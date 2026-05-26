# IPL Nexus AI

Professional IPL analytics dashboard — batter vs bowler matchups, live scores (API-ready), and floating AI chat.

## Run the app (recommended)

**Terminal 1 — API** (serves CSV data from `backend/`):

```powershell
cd C:\Users\Reddy\OneDrive\ipl-nexus-ai\backend
..\.venv\Scripts\pip.exe install fastapi uvicorn python-dotenv
..\.venv\Scripts\uvicorn.exe api:app --reload --port 8000
```

**Terminal 2 — React UI**:

```powershell
cd C:\Users\Reddy\OneDrive\ipl-nexus-ai
npm run dev
```

Open **http://localhost:5173** → login → single dashboard.

## API keys (optional)

Copy `.env.example` to `.env` in the project root:

- `CRICKET_API_KEY` — live scores (`backend/api.py`)
- `GROQ_API_KEY` or `AI_API_KEY` — AI chat (`backend/api.py`)

Never commit `.env`.

## Streamlit (legacy dashboard)

```powershell
.\.venv\Scripts\streamlit.exe run backend/main.py
```

## Project layout

| Path | Purpose |
|------|---------|
| `frontend/src/pages/Dashboard.jsx` | Main single-page dashboard |
| `frontend/src/pages/Login.jsx` | Login screen |
| `backend/api.py` | FastAPI for React |
| `backend/data_service.py` | IPL CSV logic |
| `backend/main.py` | Streamlit app (unchanged data logic) |
