# DevOps Task Simulator

AI-powered middleware that turns natural-language requests into executable DevOps scripts and commands.

Backend is Flask + Google Gemini. Frontend is Next.js (App Router) + TypeScript + Tailwind.

---

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and **npm**
- A **Google Gemini API key** — create one at https://aistudio.google.com/apikey

---

## Setup

### 1. Clone and configure the API key

Create a `.env` file at the **root** of the project (next to this README):

```env
GEMINI_API_KEY=your_key_here
# Optional — override the default model
# GEMINI_MODEL=gemini-2.5-flash
```

If you see a `429 RESOURCE_EXHAUSTED` with `limit: 0`, your free-tier project does not include that model. Try `gemini-2.5-flash` or `gemini-2.5-flash-lite` via `GEMINI_MODEL`.

### 2. Backend (Flask, port 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API will be live at `http://localhost:8000` with two endpoints:

- `POST /api/generate` — body `{ "prompt": "..." }` → `{ "script": "...", "explanation": "..." }`
- `GET /api/health` — returns `{ "status": "ok" }`

### 3. Frontend (Next.js, port 3000)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend talks to `http://localhost:8000` by default. To point at a different backend, set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local`.

---

## Project structure

```
.
├── .env                   # GEMINI_API_KEY (root-level, gitignored)
├── backend/
│   ├── app.py             # Flask app + Gemini client (port 8000)
│   └── requirements.txt
└── frontend/
    ├── app/               # Next.js App Router pages + layout
    ├── components/        # PromptInput, ResultCard, TerminalBlock, TypingText, ErrorBanner
    └── lib/               # api.ts (typed fetch client), cn.ts (class merger)
```

---

## Things to ask the system

Simple prompts to try first:

### Bash

- List all files in the current directory.
- Show disk usage of the home folder.
- Find files larger than 100MB.
- Delete all `.tmp` files in `/tmp`.
- Print the 10 most recent log lines from `/var/log/syslog`.

### Docker

- List all running containers.
- Stop every running container.
- Remove unused images.
- Show logs of a container named `web`.

### Kubernetes

- List all pods in all namespaces.
- Restart a deployment named `api`.
- Get the status of every node.

### Git

- Undo the last commit but keep the changes.
- Delete a local branch named `feature-x`.
- Show the last 5 commits.

### SQL

- Get the 10 most recent users from a `users` table.
- Count rows in a table called `orders`.
- Find duplicate emails in a `users` table.

### Networking

- Check if port 443 is open on `example.com`.
- Show my public IP address.
- Ping `google.com` 5 times.

---

## Tech stack

- **Backend:** Python 3, Flask, `flask-cors`, `python-dotenv`, `google-genai`
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, lucide-react
- **Model:** `gemini-2.5-flash` (default) — overridable via `GEMINI_MODEL`
