# IPL Nexus AI

Monorepo-style layout: React UI in `frontend/`, analytics dashboard in `backend/`.

## Frontend (Vite + React)

From the **repository root** (`ipl-nexus-ai`, the folder that contains this `README.md`):

```powershell
cd C:\Users\Reddy\OneDrive\ipl-nexus-ai
npm install --prefix frontend
npm run dev
```

The dev server is served by the app under `frontend/`. If you see `ENOENT` / “Could not read package.json”, your shell is not in this folder (for example you are in `C:\Users\Reddy\OneDrive`). Run `cd` into `ipl-nexus-ai` first, then run `npm run dev` again.

## Backend (Streamlit)

```powershell
cd backend
..\.venv\Scripts\Activate.ps1
streamlit run main.py
```

Place `matches.csv` and `deliveries.csv` next to `backend/main.py` (or adjust paths in the app).

---

Below is the original Vite template README for the scaffold under `frontend/` when applicable.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. See the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
