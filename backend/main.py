import os
import warnings

import numpy as np
import pandas as pd
import plotly.graph_objects as go
import streamlit as st

warnings.filterwarnings("ignore")

st.set_page_config(page_title="IPL Analytics", page_icon="🏏", layout="wide")

CHART_WIDTH = "stretch"
COLORS = ["#FF6B2B", "#00D4FF", "#FFD700", "#8B5CF6", "#10B981", "#F472B6"]


def load_styles():
    st.markdown(
        """
        <style>
        .stApp {
            background: linear-gradient(160deg, #050a14 0%, #0a1628 50%, #071a12 100%);
        }
        div[data-testid="stMetric"] {
            background: rgba(13, 31, 60, 0.85);
            border: 1px solid rgba(0, 212, 255, 0.2);
            border-radius: 14px;
            padding: 14px 16px;
        }
        div[data-testid="stMetricValue"] { color: #ffd700 !important; font-weight: 700 !important; }
        </style>
        """,
        unsafe_allow_html=True,
    )


def page_header(title, subtitle=None):
    st.title(title)
    if subtitle:
        st.caption(subtitle)
    st.divider()


def section_heading(text):
    st.subheader(text)


@st.cache_data(show_spinner=False)
def load_data():
    base = os.path.dirname(__file__)
    matches_path = os.path.join(base, "matches.csv")
    deliveries_path = os.path.join(base, "deliveries.csv")

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

    return matches, deliveries, batter_col


def style_chart(fig, title=None):
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font=dict(color="#d1d5db"),
        margin=dict(t=40, b=40, l=40, r=40),
        colorway=COLORS,
        title=title,
    )
    fig.update_xaxes(gridcolor="rgba(255,255,255,0.08)")
    fig.update_yaxes(gridcolor="rgba(255,255,255,0.08)")
    return fig


def filter_players(players, query):
    if not query or not str(query).strip():
        return players
    q = str(query).strip().lower()
    return [p for p in players if q in str(p).lower()]


def pick_player(label, players, key_prefix):
    search = st.text_input(
        f"Search {label.lower()}",
        placeholder=f"Type a name — e.g. Kohli, Bumrah",
        key=f"{key_prefix}_search",
    )
    filtered = filter_players(players, search)
    if not filtered:
        st.warning("No player found. Try a shorter or different spelling.")
        return None
    if search and search.strip():
        st.caption(f"Showing {len(filtered)} of {len(players)} players")
    return st.selectbox(f"Choose {label.lower()}", filtered, key=f"{key_prefix}_select")


def run_breakdown(series):
    runs = series.fillna(0).astype(int)
    counts = {
        "Dots": int((runs == 0).sum()),
        "1s": int((runs == 1).sum()),
        "2s": int((runs == 2).sum()),
        "3s": int((runs == 3).sum()),
        "4s": int((runs == 4).sum()),
        "6s": int((runs == 6).sum()),
    }
    other = len(runs) - sum(counts.values())
    if other > 0:
        counts["Other"] = int(other)
    return {k: v for k, v in counts.items() if v > 0}


def scoring_zones(series):
    runs = series.fillna(0).astype(int)
    zones = {
        "Dots": int((runs == 0).sum()),
        "Singles (1–3)": int(((runs >= 1) & (runs <= 3)).sum()),
        "Fours": int((runs == 4).sum()),
        "Sixes": int((runs == 6).sum()),
    }
    other = len(runs) - sum(zones.values())
    if other > 0:
        zones["Other"] = int(other)
    return {k: v for k, v in zones.items() if v > 0}


def make_pie(data, title):
    if not data:
        return None
    fig = go.Figure(
        go.Pie(
            labels=list(data.keys()),
            values=list(data.values()),
            hole=0.4,
            textinfo="label+percent",
            marker=dict(colors=COLORS),
        )
    )
    return style_chart(fig, title)


def make_bar(x, y, title, color="#00D4FF", horizontal=False):
    fig = go.Figure(
        go.Bar(
            x=y if horizontal else x,
            y=x if horizontal else y,
            orientation="h" if horizontal else "v",
            marker=dict(color=color),
        )
    )
    return style_chart(fig, title)


def show_player_charts(df, key_prefix, runs_col="batsman_runs"):
    if df.empty:
        st.info("No data to chart for this player.")
        return

    section_heading("Charts")
    left, right = st.columns(2)

    with left:
        fig = make_pie(scoring_zones(df[runs_col]), "How they score (by ball)")
        if fig:
            st.plotly_chart(fig, width=CHART_WIDTH, key=f"{key_prefix}_zones")

    with right:
        fig = make_pie(run_breakdown(df[runs_col]), "Runs per ball type")
        if fig:
            st.plotly_chart(fig, width=CHART_WIDTH, key=f"{key_prefix}_breakdown")

    dist = df[runs_col].value_counts().sort_index().reset_index()
    dist.columns = ["Runs", "Balls"]
    fig = make_bar(dist["Runs"].astype(str), dist["Balls"], "Ball-by-ball run counts", color="#00D4FF")
    st.plotly_chart(fig, width=CHART_WIDTH, key=f"{key_prefix}_bar")

    if "over" in df.columns:
        by_over = df.groupby("over", as_index=False)[runs_col].sum()
        fig = go.Figure(
            go.Scatter(
                x=by_over["over"],
                y=by_over[runs_col],
                mode="lines+markers",
                line=dict(color="#FF6B2B", width=2),
            )
        )
        st.plotly_chart(
            style_chart(fig, "Runs by over"),
            width=CHART_WIDTH,
            key=f"{key_prefix}_overs",
        )


def show_matchup_charts(mdf, batter, bowler, key_prefix):
    section_heading("Charts")

    runs = int(mdf["batsman_runs"].sum())
    balls = len(mdf)
    wickets = int(mdf["player_dismissed"].notna().sum())

    c1, c2, c3 = st.columns(3)
    c1.metric("Runs in this matchup", runs)
    c2.metric("Balls faced", balls)
    c3.metric("Times dismissed", wickets)

    left, right = st.columns(2)
    with left:
        fig = make_pie(scoring_zones(mdf["batsman_runs"]), f"{batter} vs {bowler}")
        if fig:
            st.plotly_chart(fig, width=CHART_WIDTH, key=f"{key_prefix}_zones")

    with right:
        outcomes = {"Survived": balls - wickets, "Out": wickets}
        outcomes = {k: v for k, v in outcomes.items() if v > 0}
        fig = make_pie(outcomes, "Outcomes (balls)")
        if fig:
            st.plotly_chart(fig, width=CHART_WIDTH, key=f"{key_prefix}_outcomes")

    dist = mdf["batsman_runs"].value_counts().sort_index().reset_index()
    dist.columns = ["Runs", "Balls"]
    fig = make_bar(dist["Runs"].astype(str), dist["Balls"], "Runs per ball type", color="#8B5CF6")
    st.plotly_chart(fig, width=CHART_WIDTH, key=f"{key_prefix}_bar")

    if "over" in mdf.columns:
        by_over = mdf.groupby("over", as_index=False)["batsman_runs"].sum()
        fig = go.Figure(go.Bar(x=by_over["over"], y=by_over["batsman_runs"], marker=dict(color="#FFD700")))
        st.plotly_chart(
            style_chart(fig, f"Runs each over — {batter} vs {bowler}"),
            width=CHART_WIDTH,
            key=f"{key_prefix}_overs",
        )


def page_home(matches, deliveries, batter_col):
    page_header(
        "IPL Analytics",
        "Ball-by-ball stats from your dataset — pick a tab above to dig in.",
    )

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Matches", f"{len(matches):,}")
    c2.metric("Runs", f"{int(deliveries['batsman_runs'].sum()):,}")
    c3.metric("Wickets", f"{int(deliveries['player_dismissed'].notna().sum()):,}")
    seasons = matches["season"].nunique() if "season" in matches.columns else 0
    c4.metric("Seasons", seasons)

    section_heading("Top run scorers")
    if not batter_col:
        st.warning("Batter data is not available in this file.")
        return

    top = deliveries.groupby(batter_col)["batsman_runs"].sum().nlargest(10).reset_index()
    top.columns = ["Player", "Runs"]
    fig = go.Figure(
        go.Bar(x=top["Runs"], y=top["Player"], orientation="h", marker=dict(color="#FF6B2B"))
    )
    fig.update_layout(yaxis=dict(autorange="reversed"))
    st.plotly_chart(style_chart(fig), width=CHART_WIDTH, key="home_top_scorers")


def page_player(matches, deliveries, batter_col):
    page_header("Player stats", "Search for a batter or bowler and see their IPL numbers.")

    if not batter_col:
        st.error("Could not find a batter column in deliveries.csv.")
        return

    batting_tab, bowling_tab = st.tabs(["Batting", "Bowling"])

    with batting_tab:
        players = sorted(deliveries[batter_col].dropna().unique())
        name = pick_player("batter", players, "player_bat")
        if not name:
            return

        df = deliveries[deliveries[batter_col] == name]
        runs = int(df["batsman_runs"].sum())
        balls = len(df)
        outs = int(df["player_dismissed"].notna().sum())
        sr = round(runs / max(balls, 1) * 100, 2)
        avg = round(runs / max(outs, 1), 2)

        section_heading(f"{name} — batting")
        c1, c2, c3, c4, c5 = st.columns(5)
        c1.metric("Runs", runs)
        c2.metric("Balls", balls)
        c3.metric("Strike rate", sr)
        c4.metric("Average", avg)
        c5.metric("Sixes", int((df["batsman_runs"] == 6).sum()))

        c1, c2, c3 = st.columns(3)
        c1.metric("Fours", int((df["batsman_runs"] == 4).sum()))
        c2.metric("Dismissals", outs)
        c3.metric(
            "Dot ball %",
            f"{round((df['batsman_runs'] == 0).sum() / max(balls, 1) * 100, 1)}%",
        )
        show_player_charts(df, "player_bat")

    with bowling_tab:
        if "bowler" not in deliveries.columns:
            st.warning("No bowler column in the data.")
            return

        bowlers = sorted(deliveries["bowler"].dropna().unique())
        name = pick_player("bowler", bowlers, "player_bowl")
        if not name:
            return

        df = deliveries[deliveries["bowler"] == name]
        wickets = int(df["player_dismissed"].notna().sum())
        runs_given = int(df["batsman_runs"].sum())
        balls = len(df)
        overs = round(balls / 6, 1)
        economy = round(runs_given / max(overs, 1), 2)

        section_heading(f"{name} — bowling")
        c1, c2, c3, c4 = st.columns(4)
        c1.metric("Wickets", wickets)
        c2.metric("Runs conceded", runs_given)
        c3.metric("Overs", overs)
        c4.metric("Economy", economy)

        show_player_charts(df, "player_bowl")

        if "dismissal_kind" in df.columns:
            kinds = (
                df[df["player_dismissed"].notna()]["dismissal_kind"]
                .value_counts()
                .head(8)
                .reset_index()
            )
            if not kinds.empty:
                kinds.columns = ["Dismissal", "Count"]
                fig = make_bar(
                    kinds["Dismissal"],
                    kinds["Count"],
                    "How they take wickets",
                    color="#FF6B2B",
                    horizontal=True,
                )
                fig.update_layout(yaxis=dict(autorange="reversed"))
                st.plotly_chart(fig, width=CHART_WIDTH, key="player_bowl_kinds")


def page_matchups(matches, deliveries, batter_col):
    page_header(
        "Batter vs bowler",
        "See how one batter has done against a specific bowler.",
    )

    if not batter_col or "bowler" not in deliveries.columns:
        st.error("Need batter and bowler columns in deliveries.csv.")
        return

    batters = sorted(deliveries[batter_col].dropna().unique())
    bowlers = sorted(deliveries["bowler"].dropna().unique())

    c1, c2 = st.columns(2)
    with c1:
        batter = pick_player("batter", batters, "matchup_bat")
    with c2:
        bowler = pick_player("bowler", bowlers, "matchup_bowl")

    if not batter or not bowler:
        return

    df = deliveries[(deliveries[batter_col] == batter) & (deliveries["bowler"] == bowler)]
    if df.empty:
        st.info(f"No balls recorded for {batter} against {bowler}.")
        return

    runs = int(df["batsman_runs"].sum())
    balls = len(df)
    sr = round(runs / max(balls, 1) * 100, 2)
    dots = round((df["batsman_runs"] == 0).sum() / max(balls, 1) * 100, 1)

    section_heading(f"{batter} vs {bowler}")
    c1, c2, c3, c4, c5, c6 = st.columns(6)
    c1.metric("Runs", runs)
    c2.metric("Balls", balls)
    c3.metric("Strike rate", sr)
    c4.metric("Dot %", f"{dots}%")
    c5.metric("Fours", int((df["batsman_runs"] == 4).sum()))
    c6.metric("Sixes", int((df["batsman_runs"] == 6).sum()))

    show_matchup_charts(df, batter, bowler, "matchup")


def page_teams(matches, deliveries, batter_col):
    page_header("Teams", "Which franchises have won the most matches.")

    if "winner" not in matches.columns:
        st.warning("No winner column in matches.csv.")
        return

    wins = matches["winner"].value_counts().head(10).reset_index()
    wins.columns = ["Team", "Wins"]
    fig = go.Figure(go.Bar(x=wins["Team"], y=wins["Wins"], marker=dict(color="#FFD700")))
    st.plotly_chart(style_chart(fig, "Most wins"), width=CHART_WIDTH, key="teams_wins")


def page_trends(matches, deliveries, batter_col):
    page_header("Season trends", "How many matches were played each season.")

    if "season" not in matches.columns:
        st.warning("No season column in matches.csv.")
        return

    by_season = matches.groupby("season").size().reset_index()
    by_season.columns = ["Season", "Matches"]
    fig = go.Figure(
        go.Bar(
            x=by_season["Season"].astype(str),
            y=by_season["Matches"],
            marker=dict(color="#8B5CF6"),
        )
    )
    st.plotly_chart(style_chart(fig, "Matches per season"), width=CHART_WIDTH, key="trends")


def fallback_answer(question):
    q = question.lower()
    answers = [
        (("kohli", "virat"), "Virat Kohli is among the top IPL run-scorers and has been the face of RCB for years."),
        (("dhoni", "msd"), "MS Dhoni led CSK to multiple titles and is known as one of the best finishers in the league."),
        (("bumrah",), "Jasprit Bumrah is a standout death bowler for Mumbai Indians with a low economy."),
        (("csk",), "Chennai Super Kings are one of the most successful and consistent IPL teams."),
        (("rcb",), "Royal Challengers Bangalore have a huge fan base and many famous batters."),
        (("mi", "mumbai"), "Mumbai Indians have won the IPL more times than any other team."),
        (("strike rate",), "Strike rate = (runs ÷ balls faced) × 100."),
        (("economy",), "Economy = runs conceded ÷ overs bowled."),
        (("orange cap",), "Orange Cap goes to the leading run-scorer in a season."),
        (("purple cap",), "Purple Cap goes to the leading wicket-taker in a season."),
    ]
    for keys, text in answers:
        if any(k in q for k in keys):
            return text
    return (
        "Ask me about IPL players, teams, strike rate, economy, or the Orange and Purple Caps. "
        "Add a Gemini API key below for fuller answers."
    )


def ask_gemini(api_key, question):
    if not api_key:
        return fallback_answer(question)

    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        prompt = (
            "You help with IPL cricket stats and trivia. "
            "Keep answers short and clear.\n\n"
            f"Question: {question}"
        )
        for model_name in ("gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"):
            try:
                model = genai.GenerativeModel(model_name)
                return model.generate_content(prompt).text
            except Exception:
                continue
        return fallback_answer(question)
    except Exception:
        return fallback_answer(question)


def page_chat():
    page_header(
        "Ask about IPL",
        "Optional: paste a Gemini API key for AI replies. Without it, simple built-in answers still work.",
    )

    api_key = st.text_input("Gemini API key (optional)", type="password")

    if "chat_messages" not in st.session_state:
        st.session_state.chat_messages = [
            {"role": "assistant", "content": "Hi — ask me anything about IPL stats or players."}
        ]

    for msg in st.session_state.chat_messages:
        with st.chat_message(msg["role"]):
            st.write(msg["content"])

    if prompt := st.chat_input("Your question"):
        st.session_state.chat_messages.append({"role": "user", "content": prompt})
        with st.spinner("Thinking..."):
            reply = ask_gemini(api_key, prompt)
        st.session_state.chat_messages.append({"role": "assistant", "content": reply})
        st.rerun()

    if st.button("Clear chat"):
        st.session_state.chat_messages = [
            {"role": "assistant", "content": "Chat cleared. What would you like to know?"}
        ]
        st.rerun()


def main():
    load_styles()

    matches, deliveries, batter_col = load_data()
    if matches is None:
        st.error("Place matches.csv and deliveries.csv in the backend folder next to main.py.")
        return

    tabs = st.tabs(["Home", "Players", "Matchups", "Teams", "Seasons", "Chat"])

    with tabs[0]:
        page_home(matches, deliveries, batter_col)
    with tabs[1]:
        page_player(matches, deliveries, batter_col)
    with tabs[2]:
        page_matchups(matches, deliveries, batter_col)
    with tabs[3]:
        page_teams(matches, deliveries, batter_col)
    with tabs[4]:
        page_trends(matches, deliveries, batter_col)
    with tabs[5]:
        page_chat()


if __name__ == "__main__":
    main()
