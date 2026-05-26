"""
FastAPI backend for IPL Nexus AI React dashboard.
Run: uvicorn api:app --reload --port 8000
"""

import json
import os
import sqlite3
import threading
import time
from datetime import datetime
from typing import Literal
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx

from backend.data_service import (
    get_matchup,
    get_players,
    get_summary,
    get_player_profile,
    get_bowler_profile,
    get_trends,
    load_data,
)

# Load .env from parent directory (project root)
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

app = FastAPI(title="IPL Nexus AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    ok = load_data()[0] is not None
    return {"ok": ok, "dataset_loaded": ok}


@app.get("/api/summary")
def summary():
    data = get_summary()
    if data is None:
        raise HTTPException(404, "matches.csv / deliveries.csv not found in backend/")
    return data


@app.get("/api/players")
def players(role: Literal["batter", "bowler"] = "batter"):
    return {"players": get_players(role)}


@app.get("/api/matchup")
def matchup(batter: str, bowler: str):
    result = get_matchup(batter, bowler)
    if result is None:
        raise HTTPException(500, "Dataset not ready")
    return result


@app.get("/api/trends")
def trends():
    data = get_trends()
    if data is None:
        raise HTTPException(404, "Dataset not ready")
    return data


@app.get("/api/player-profile")
def player_profile(playerId: str, venue: str = "", season: str = ""):
    data = get_player_profile(playerId, venue, season)
    if data is None:
        raise HTTPException(404, "Player profile not available")
    return data


@app.get("/api/bowler-profile")
def bowler_profile(bowlerId: str, venue: str = "", season: str = ""):
    data = get_bowler_profile(bowlerId, venue, season)
    if data is None:
        raise HTTPException(404, "Bowler profile not available")
    return data


def normalize_match(item, match_info=None):
    teams = item.get("teams") or []
    team_info = item.get("teamInfo") or []
    team_a = teams[0] if len(teams) > 0 else item.get("team-1") or item.get("team1") or "Team A"
    team_b = teams[1] if len(teams) > 1 else item.get("team-2") or item.get("team2") or "Team B"
    team_short_a = team_info[0].get("shortname") if len(team_info) > 0 else (team_a[:3].upper() if team_a else "A")
    team_short_b = team_info[1].get("shortname") if len(team_info) > 1 else (team_b[:3].upper() if team_b else "B")
    team_logo_a = team_info[0].get("img") if len(team_info) > 0 else ""
    team_logo_b = team_info[1].get("img") if len(team_info) > 1 else ""

    score_list = item.get("score") or []
    score_details = []
    for index, score in enumerate(score_list):
        team_name = teams[index] if index < len(teams) else score.get("team") or score.get("inning") or f"Team {index + 1}"
        score_details.append(
            {
                "team": team_name,
                "label": score.get("inning") or team_name,
                "runs": score.get("r") or 0,
                "wickets": score.get("w") or 0,
                "overs": score.get("o") or 0,
                "runRate": score.get("rr") or score.get("run_rate") or "",
                "description": score.get("inning") or "",
            }
        )

    score_a = score_details[0]["runs"] if len(score_details) > 0 else ""
    wickets_a = score_details[0]["wickets"] if len(score_details) > 0 else ""
    score_b = score_details[1]["runs"] if len(score_details) > 1 else ""
    wickets_b = score_details[1]["wickets"] if len(score_details) > 1 else ""

    status_text = item.get("status") or ""
    if item.get("matchEnded"):
        status = "FINISHED"
    elif item.get("matchStarted"):
        status = "LIVE"
    elif status_text:
        status = status_text
    else:
        status = "SCHEDULED"

    toss_winner = item.get("tossWinner") or (match_info or {}).get("tossWinner") or ""
    toss_choice = item.get("tossChoice") or (match_info or {}).get("tossChoice") or ""
    toss_text = f"{toss_winner.title()} elected to {toss_choice}" if toss_winner and toss_choice else item.get("toss") or item.get("lead") or status_text or ""

    return {
        "id": item.get("id") or "",
        "name": item.get("name") or "",
        "venue": item.get("venue") or item.get("ground") or "",
        "phase": item.get("matchType") or item.get("type") or "",
        "teamNames": [team_a, team_b],
        "teamShortNames": [team_short_a, team_short_b],
        "teamLogos": [team_logo_a, team_logo_b],
        "scoreA": f"{score_a}/{wickets_a}" if score_a != "" else "",
        "scoreB": f"{score_b}/{wickets_b}" if score_b != "" else "",
        "scoreDetails": score_details,
        "status": status,
        "runRate": item.get("runRate") or item.get("run_rate") or "",
        "lead": item.get("lead") or item.get("toss") or status_text or "",
        "toss": toss_text,
        "lastBall": item.get("lastBall") or item.get("last_ball") or "",
        "nextBowler": item.get("bowling") or item.get("nextBowler") or "",
        "previousBalls": item.get("previousBalls") or item.get("previous_ball") or [],
        "comment": status_text or item.get("name") or "",
        "matchStarted": item.get("matchStarted") or False,
        "matchEnded": item.get("matchEnded") or False,
        "dateTimeGMT": item.get("dateTimeGMT") or "",
        "date": item.get("date") or "",
        "matchInfo": match_info or {},
    }


import json
import sqlite3
import threading
import time
from datetime import datetime

LIVE_DB_PATH = Path(__file__).parent / "live_scores.db"
DB_REFRESH_INTERVAL = int(os.getenv("LIVE_REFRESH_INTERVAL", 30))


def get_db_connection():
    conn = sqlite3.connect(str(LIVE_DB_PATH), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_live_db():
    LIVE_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS live_matches (
                id TEXT PRIMARY KEY,
                name TEXT,
                venue TEXT,
                phase TEXT,
                team_names TEXT,
                team_short_names TEXT,
                team_logos TEXT,
                score_a TEXT,
                score_b TEXT,
                score_details TEXT,
                status TEXT,
                run_rate TEXT,
                lead TEXT,
                toss TEXT,
                last_ball TEXT,
                next_bowler TEXT,
                previous_balls TEXT,
                comment TEXT,
                match_started INTEGER,
                match_ended INTEGER,
                date_time_gmt TEXT,
                date TEXT,
                match_info TEXT,
                last_updated TEXT
            )
            """
        )
        conn.commit()


def row_to_match(row):
    if row is None:
        return None
    return {
        "id": row["id"],
        "name": row["name"],
        "venue": row["venue"],
        "phase": row["phase"],
        "teamNames": json.loads(row["team_names"] or "[]"),
        "teamShortNames": json.loads(row["team_short_names"] or "[]"),
        "teamLogos": json.loads(row["team_logos"] or "[]"),
        "scoreA": row["score_a"],
        "scoreB": row["score_b"],
        "scoreDetails": json.loads(row["score_details"] or "[]"),
        "status": row["status"],
        "runRate": row["run_rate"],
        "lead": row["lead"],
        "toss": row["toss"],
        "lastBall": row["last_ball"],
        "nextBowler": row["next_bowler"],
        "previousBalls": json.loads(row["previous_balls"] or "[]"),
        "comment": row["comment"],
        "matchStarted": bool(row["match_started"]),
        "matchEnded": bool(row["match_ended"]),
        "dateTimeGMT": row["date_time_gmt"],
        "date": row["date"],
        "matchInfo": json.loads(row["match_info"] or "{}"),
        "lastUpdated": row["last_updated"],
    }


def save_live_matches(matches):
    with get_db_connection() as conn:
        for match in matches:
            conn.execute(
                """
                REPLACE INTO live_matches (
                    id, name, venue, phase, team_names, team_short_names, team_logos,
                    score_a, score_b, score_details, status, run_rate, lead, toss,
                    last_ball, next_bowler, previous_balls, comment, match_started,
                    match_ended, date_time_gmt, date, match_info, last_updated
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    match.get("id", ""),
                    match.get("name", ""),
                    match.get("venue", ""),
                    match.get("phase", ""),
                    json.dumps(match.get("teamNames", [])),
                    json.dumps(match.get("teamShortNames", [])),
                    json.dumps(match.get("teamLogos", [])),
                    match.get("scoreA", ""),
                    match.get("scoreB", ""),
                    json.dumps(match.get("scoreDetails", [])),
                    match.get("status", ""),
                    match.get("runRate", ""),
                    match.get("lead", ""),
                    match.get("toss", ""),
                    match.get("lastBall", ""),
                    match.get("nextBowler", ""),
                    json.dumps(match.get("previousBalls", [])),
                    match.get("comment", ""),
                    int(bool(match.get("matchStarted", False))),
                    int(bool(match.get("matchEnded", False))),
                    match.get("dateTimeGMT", ""),
                    match.get("date", ""),
                    json.dumps(match.get("matchInfo", {})),
                    datetime.utcnow().isoformat(),
                ),
            )
        conn.commit()


def read_live_matches():
    with get_db_connection() as conn:
        rows = conn.execute("SELECT * FROM live_matches ORDER BY last_updated DESC").fetchall()
        return [row_to_match(row) for row in rows]


def read_live_match(match_id: str):
    with get_db_connection() as conn:
        row = conn.execute("SELECT * FROM live_matches WHERE id = ?", (match_id,)).fetchone()
        return row_to_match(row)


def fetch_and_cache_matches(api_key: str = None):
    raw_matches = get_live_matches(api_key)
    if not raw_matches:
        raw_matches = get_live_matches_from_espn()
    normalized = [normalize_match(match) for match in raw_matches]
    save_live_matches(normalized)
    return normalized


class LiveMatchRefresher:
    def __init__(self, api_key: str = None, interval: int = DB_REFRESH_INTERVAL):
        self.api_key = api_key
        self.interval = interval
        self.stop_event = threading.Event()
        self.thread = None

    def start(self):
        if self.thread and self.thread.is_alive():
            return
        self.stop_event.clear()
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self):
        self.stop_event.set()
        if self.thread:
            self.thread.join(timeout=1)

    def _run(self):
        while not self.stop_event.is_set():
            try:
                fetch_and_cache_matches(self.api_key)
            except Exception:
                pass
            self.stop_event.wait(self.interval)


live_refresher = None


def get_live_matches(api_key: str = None):
    """Get live matches from Cricket API with fallback to ESPN/mock data."""
    if api_key:
        try:
            raw_matches = []
            offset = 0
            with httpx.Client(timeout=15.0) as client:
                while True:
                    response = client.get(
                        "https://api.cricapi.com/v1/currentMatches",
                        params={"apikey": api_key, "offset": offset},
                    )
                    response.raise_for_status()
                    payload = response.json()
                    page_matches = payload.get("data") or []
                    if not page_matches:
                        break
                    raw_matches.extend(page_matches)
                    offset += len(page_matches)
                    if len(page_matches) < 25:
                        break

            if raw_matches:
                return raw_matches
            if payload.get("status") == "failure":
                return get_live_matches_from_espn()
        except Exception:
            pass

    return get_live_matches_from_espn()


@app.on_event("startup")
def startup_event():
    global live_refresher
    initialize_live_db()
    api_key = os.getenv("CRICKET_API_KEY")
    if not live_refresher:
        live_refresher = LiveMatchRefresher(api_key=api_key)
    live_refresher.start()
    try:
        fetch_and_cache_matches(api_key)
    except Exception:
        pass


@app.on_event("shutdown")
def shutdown_event():
    if live_refresher:
        live_refresher.stop()


@app.get("/api/live-scores")
def live_scores():
    api_key = os.getenv("CRICKET_API_KEY")
    matches = read_live_matches()
    if not matches:
        try:
            matches = fetch_and_cache_matches(api_key)
        except Exception:
            matches = []

    ipl_matches = [
        m for m in matches
        if m.get("name") and ("ipl" in m.get("name", "").lower() or "indian premier league" in m.get("name", "").lower())
    ]

    if not ipl_matches and matches:
        ipl_matches = matches[:5]

    message = (
        "Live scores fetched from provider." if ipl_matches else "Live scores fetched, but no active matches were available."
    )

    return {
        "configured": True,
        "message": message,
        "matches": ipl_matches,
    }


@app.get("/api/live-scores/{match_id}")
def live_score_detail(match_id: str):
    match = read_live_match(match_id)
    if not match:
        api_key = os.getenv("CRICKET_API_KEY")
        try:
            fetch_and_cache_matches(api_key)
        except Exception:
            pass
        match = read_live_match(match_id)

    if not match:
        raise HTTPException(404, "Match not found")

    return {
        "configured": True,
        "message": "Live match details fetched from provider.",
        "match": match,
    }


@app.post("/api/chat")
def chat(body: dict):
    """
    Wire Groq / Gemini / OpenAI here.
    Set GROQ_API_KEY or AI_API_KEY in .env — never commit the key.
    """
    question = (body or {}).get("message", "").strip()
    if not question:
        raise HTTPException(400, "message is required")

    groq_api_key = os.getenv("GROQ_API_KEY")
    openai_api_key = os.getenv("OPENAI_API_KEY")
    ai_api_key = os.getenv("AI_API_KEY")

    if groq_api_key:
        api_key = groq_api_key
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = "openai/gpt-oss-20b"
    elif openai_api_key or (ai_api_key and ai_api_key.startswith("sk-")):
        api_key = openai_api_key or ai_api_key
        url = "https://api.openai.com/v1/chat/completions"
        model = "gpt-4o-mini"
    else:
        return {
            "reply": (
                "AI is not configured yet. Add GROQ_API_KEY or OPENAI_API_KEY to .env, "
                f"then connect the provider in backend/api.py. You asked: “{question}”"
            ),
            "configured": False,
        }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                url,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": question}],
                    "temperature": 0.7,
                },
            )
            response.raise_for_status()
            payload = response.json()
    except httpx.HTTPStatusError as exc:
        raise HTTPException(502, f"AI provider error: {exc.response.text}")
    except Exception as exc:
        raise HTTPException(502, f"AI provider request failed: {str(exc)}")

    choice = None
    if isinstance(payload, dict):
        choices = payload.get("choices") or []
        if choices:
            choice = choices[0]
    reply = ""
    if isinstance(choice, dict):
        reply = choice.get("message", {}).get("content") or choice.get("text") or ""
    if not reply:
        reply = payload.get("error", {}).get("message") if isinstance(payload, dict) else ""
    reply = reply or "No reply returned from AI provider."

    return {"reply": reply.strip(), "configured": True}
