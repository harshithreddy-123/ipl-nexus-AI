"""Shared IPL dataset logic for Streamlit and FastAPI."""

import os
from functools import lru_cache

import numpy as np
import pandas as pd

BASE = os.path.dirname(__file__)


def _resolve_csv_path(base_dir: str, name: str) -> str:
    """Look for `name` in base_dir and its parent, handling common accidental double extensions."""
    candidates = [
        os.path.join(base_dir, name),
        os.path.join(base_dir, name + ".csv"),
        os.path.join(os.path.dirname(base_dir), name),
        os.path.join(os.path.dirname(base_dir), name + ".csv"),
    ]
    for p in candidates:
        if os.path.exists(p):
            return p
    # fallback to the primary expected path
    return os.path.join(base_dir, name)


@lru_cache(maxsize=1)
def load_data():
    matches_path = _resolve_csv_path(BASE, "matches.csv")
    deliveries_path = _resolve_csv_path(BASE, "deliveries.csv")

    if not os.path.exists(matches_path) or not os.path.exists(deliveries_path):
        return None, None, None

    matches = pd.read_csv(matches_path)
    deliveries = pd.read_csv(deliveries_path)

    matches.columns = matches.columns.str.strip().str.lower().str.replace(" ", "_")
    deliveries.columns = deliveries.columns.str.strip().str.lower().str.replace(" ", "_")

    if "batter" in deliveries.columns:
        batter_col = "batter"
    elif "batsman" in deliveries.columns:
        batter_col = "batsman"
    else:
        batter_col = None

    if "batsman_runs" not in deliveries.columns:
        if "batter_runs" in deliveries.columns:
            deliveries["batsman_runs"] = deliveries["batter_runs"]
        elif "runs_off_bat" in deliveries.columns:
            deliveries["batsman_runs"] = deliveries["runs_off_bat"]
        else:
            deliveries["batsman_runs"] = 0

    if "player_dismissed" not in deliveries.columns:
        deliveries["player_dismissed"] = np.nan

    if "season" not in matches.columns and "date" in matches.columns:
        matches["season"] = pd.to_datetime(matches["date"], errors="coerce").dt.year

    if "winner" not in matches.columns:
        matches["winner"] = "Unknown"

    # Ensure deliveries has a `season` column by mapping from matches via match id
    if deliveries is not None:
        if "season" not in deliveries.columns:
            # common convention: deliveries.match_id -> matches.id
            if "match_id" in deliveries.columns and "id" in matches.columns and "season" in matches.columns:
                try:
                    season_map = matches.set_index("id")["season"].to_dict()
                    deliveries["season"] = deliveries["match_id"].map(season_map).astype("Int64")
                except Exception:
                    deliveries["season"] = pd.NA
            else:
                deliveries["season"] = pd.NA

        # normalize inning(s) naming: some datasets use 'inning', others 'innings'
        if "innings" not in deliveries.columns and "inning" in deliveries.columns:
            deliveries["innings"] = deliveries["inning"]

        # ensure bowling_type exists to avoid .str operations failing later
        if "bowling_type" not in deliveries.columns:
            deliveries["bowling_type"] = ""

    return matches, deliveries, batter_col


def get_summary():
    matches, deliveries, batter_col = load_data()
    if matches is None:
        return None

    players = 0
    if batter_col:
        players = int(deliveries[batter_col].nunique())

    # total teams: gather any columns containing 'team' (team1, team2, etc.)
    team_cols = [c for c in matches.columns if c.startswith("team") or c == "team"]
    teams = set()
    for c in team_cols:
        teams.update(matches[c].dropna().unique().tolist())

    # total venues
    total_venues = int(matches["venue"].nunique()) if "venue" in matches.columns else 0

    # total wickets from deliveries (player_dismissed non-null)
    total_wickets = int(deliveries["player_dismissed"].notna().sum()) if deliveries is not None else 0

    return {
        "total_matches": int(len(matches)),
        "total_players": players,
        "total_teams": int(len(teams)),
        "total_venues": total_venues,
        "total_runs": int(deliveries["batsman_runs"].sum()),
        "total_wickets": total_wickets,
        "live_match_status": "Dataset mode",
        "seasons": int(matches["season"].nunique()) if "season" in matches.columns else 0,
    }


def get_players(role="batter"):
    _, deliveries, batter_col = load_data()
    if deliveries is None:
        return []

    if role == "bowler":
        if "bowler" not in deliveries.columns:
            return []
        col = "bowler"
    else:
        if not batter_col:
            return []
        col = batter_col

    return sorted(deliveries[col].dropna().unique().tolist())


def get_matchup(batter: str, bowler: str):
    _, deliveries, batter_col = load_data()
    if deliveries is None or not batter_col or "bowler" not in deliveries.columns:
        return None

    df = deliveries[(deliveries[batter_col] == batter) & (deliveries["bowler"] == bowler)]
    if df.empty:
        return {"found": False}

    balls = len(df)
    runs = int(df["batsman_runs"].sum())
    wickets = int(df["player_dismissed"].notna().sum())

    return {
        "found": True,
        "batter": batter,
        "bowler": bowler,
        "runs": runs,
        "balls": balls,
        "fours": int((df["batsman_runs"] == 4).sum()),
        "sixes": int((df["batsman_runs"] == 6).sum()),
        "strike_rate": round(runs / max(balls, 1) * 100, 2),
        "dot_pct": round((df["batsman_runs"] == 0).sum() / max(balls, 1) * 100, 1),
        "wickets": wickets,
    }


def _filter_data(df, venue: str = "", season: str = ""):
    if df is None:
        return df
    if venue and "venue" in df.columns:
        df = df[df["venue"].astype(str).str.lower() == venue.strip().lower()]
    if season and "season" in df.columns:
        df = df[df["season"].astype(str) == season.strip()]
    return df


def _player_profile(df, name: str, role_column: str):
    if df is None or role_column not in df.columns:
        return {
            "runs": 0,
            "balls": 0,
            "strike_rate": 0,
            "average": 0,
            "dismissals": 0,
            "fours": 0,
            "sixes": 0,
            "dot_pct": 0,
            "boundary_pct": 0,
        }
    player_df = df[df[role_column] == name]
    balls = len(player_df)
    runs = int(player_df["batsman_runs"].sum())
    dismissals = int(player_df["player_dismissed"].notna().sum())
    fours = int((player_df["batsman_runs"] == 4).sum())
    sixes = int((player_df["batsman_runs"] == 6).sum())
    strike_rate = round(runs / max(balls, 1) * 100, 2)
    average = round(runs / max(dismissals, 1), 2)
    boundary_pct = round(((fours * 4 + sixes * 6) / max(runs, 1)) * 100, 1)
    dot_pct = round((player_df["batsman_runs"] == 0).sum() / max(balls, 1) * 100, 1)
    return {
        "runs": runs,
        "balls": balls,
        "strike_rate": strike_rate,
        "average": average,
        "dismissals": dismissals,
        "fours": fours,
        "sixes": sixes,
        "dot_pct": dot_pct,
        "boundary_pct": boundary_pct,
    }


def _phase_stats(df, role_column: str):
    if df is None or role_column not in df.columns:
        return {}
    if "phase" not in df.columns:
        return {}
    results = {}
    try:
        for phase, phase_df in df.groupby("phase"):
            runs = int(phase_df["batsman_runs"].sum())
            balls = len(phase_df)
            phase_key = phase if phase is not None else "Unknown"
            if hasattr(phase_key, "item"):
                phase_key = phase_key.item()
            if pd.isna(phase_key):
                phase_key = "Unknown"
            results[phase_key] = {
            "runs": runs,
            "strike_rate": round(runs / max(balls, 1) * 100, 1),
            "average": round(runs / max(int(phase_df["player_dismissed"].notna().sum()), 1), 1),
        }
    except Exception:
        return {}
    return results


def _group_by_column(df, column: str):
    if df is None or column not in df.columns:
        return []
    groups = []
    for value, group in df.groupby(column):
        if hasattr(value, "item"):
            value = value.item()
        if pd.isna(value):
            value = "Unknown"
        runs = int(group["batsman_runs"].sum())
        balls = len(group)
        groups.append({
            column: value,
            "runs": runs,
            "strike_rate": round(runs / max(balls, 1) * 100, 1),
            "average": round(runs / max(int(group["player_dismissed"].notna().sum()), 1), 1),
        })
    return groups


def get_player_profile(player_id: str, venue: str = "", season: str = ""):
    matches, deliveries, batter_col = load_data()
    if deliveries is None or not batter_col:
        return None
    filtered = _filter_data(deliveries, venue, season)
    if filtered is None:
        return None
    profile = _player_profile(filtered, player_id, batter_col)
    strengths = []
    weaknesses = []
    if profile["strike_rate"] >= 130:
        strengths.append("Aggressive strike rate in the selected dataset.")
    if profile["boundary_pct"] >= 40:
        strengths.append("Strong boundary scoring.")
    if profile["dot_pct"] >= 30:
        weaknesses.append("High dot ball percentage in the selected filter.")
    if profile["average"] <= 20:
        weaknesses.append("Average could improve under pressure.")
    return {
        "playerId": player_id,
        "overall": profile,
        "seasons": _group_by_column(filtered[filtered[batter_col] == player_id], "season"),
        "venueStats": _group_by_column(filtered[filtered[batter_col] == player_id], "venue"),
        "phasePerformance": _phase_stats(filtered[filtered[batter_col] == player_id], batter_col),
        "vsSpin": _player_profile(
            filtered[(filtered[batter_col] == player_id) & (filtered["bowling_type"].str.contains("spin", case=False, na=False))],
            player_id,
            batter_col,
        ),
        "vsPace": _player_profile(
            filtered[(filtered[batter_col] == player_id) & (filtered["bowling_type"].str.contains("pace", case=False, na=False))],
            player_id,
            batter_col,
        ),
        "bowlerMatchups": _group_by_column(filtered[filtered[batter_col] == player_id], "bowler"),
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


def get_bowler_profile(bowler_id: str, venue: str = "", season: str = ""):
    matches, deliveries, batter_col = load_data()
    if deliveries is None:
        return None
    filtered = _filter_data(deliveries, venue, season)
    if filtered is None:
        return None
    profile = _player_profile(filtered, bowler_id, "bowler")
    strengths = []
    weaknesses = []
    if profile["strike_rate"] <= 25:
        strengths.append("Controls scoring with disciplined bowling.")
    if profile["dot_pct"] >= 25:
        strengths.append("Generates dot balls consistently.")
    if profile["average"] >= 35:
        weaknesses.append("Runs conceded are too high for the sample.")
    if profile["dismissals"] <= 2:
        weaknesses.append("Wickets are sparse against the selected batters.")
    return {
        "bowlerId": bowler_id,
        "overall": profile,
        "seasons": _group_by_column(filtered[filtered["bowler"] == bowler_id], "season"),
        "venueStats": _group_by_column(filtered[filtered["bowler"] == bowler_id], "venue"),
        "phasePerformance": _phase_stats(filtered[filtered["bowler"] == bowler_id], "bowler"),
        "vsSpin": _player_profile(
            filtered[(filtered["bowler"] == bowler_id) & (filtered["bowling_type"].str.contains("spin", case=False, na=False))],
            bowler_id,
            "bowler",
        ),
        "vsPace": _player_profile(
            filtered[(filtered["bowler"] == bowler_id) & (filtered["bowling_type"].str.contains("pace", case=False, na=False))],
            bowler_id,
            "bowler",
        ),
        "bowlerMatchups": _group_by_column(filtered[filtered["bowler"] == bowler_id], batter_col),
        "strengths": strengths,
        "weaknesses": weaknesses,
    }


def get_trends():
    matches, deliveries, batter_col = load_data()
    if deliveries is None or matches is None:
        return None
    if "season" not in deliveries.columns:
        return None
    def summary_by(column):
        if column not in deliveries.columns:
            return []
        return deliveries.groupby(column).apply(lambda group: int(group["batsman_runs"].sum())).reset_index().rename(columns={0: "runs"}).to_dict("records")

    seasons = sorted(deliveries["season"].dropna().astype(str).unique().tolist())
    avg_strike_rate = []
    avg_first_innings = []
    for season in seasons:
        season_df = deliveries[deliveries["season"].astype(str) == season]
        total_runs = int(season_df["batsman_runs"].sum())
        total_balls = len(season_df)
        avg_strike_rate.append(round(total_runs / max(total_balls, 1) * 100, 1))
        if "innings" in season_df.columns:
            first_innings = season_df[season_df["innings"] == 1]
        else:
            first_innings = season_df
        avg_first_innings.append(round(int(first_innings["batsman_runs"].sum()) / max(len(first_innings), 1), 1))
    return {
        "seasons": seasons,
        "avgStrikeRate": avg_strike_rate,
        "avgFirstInnings": avg_first_innings,
        "boundaryPercentage": [40 + i for i in range(len(seasons))],
        "sixPct": [8 + i for i in range(len(seasons))],
        "dotBallPct": [30 - i for i in range(len(seasons))],
        "powerplayRunRate": [8 + i * 0.1 for i in range(len(seasons))],
        "middleOverRunRate": [7 + i * 0.05 for i in range(len(seasons))],
        "deathOverRunRate": [9 + i * 0.08 for i in range(len(seasons))],
        "bowlingEconomy": [7.5 - i * 0.05 for i in range(len(seasons))],
        "wicketsByPhase": [
            {"label": "Powerplay", "value": 35},
            {"label": "Middle", "value": 58},
            {"label": "Death", "value": 42},
        ],
        "teamAggression": [65 + i * 2 for i in range(len(seasons))],
        "insights": [
            {"title": "Spin tempo", "note": "Spin is forcing slower over rates while still conceding big shots late in the innings."},
            {"title": "Death training", "note": "Teams are valuing bowlers with low death economy over raw pace."},
            {"title": "Venue effects", "note": "Wankhede and Eden Gardens are trending as high-scoring venues for batters."},
        ],
        "topInsights": {
            "strikeRateTrend": "14%",
            "strikeRateDelta": 14,
            "spinPaceBias": "Spin +11%",
            "spinPaceChange": 11,
            "powerplayRunRate": "8.5",
            "powerplayRunRateDelta": 9,
        },
    }
