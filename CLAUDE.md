# Orbit — DevOps Task Simulator

## Project Overview

An AI-powered middleware that translates Natural Language (NL) instructions into executable DevOps scripts or SQL queries. The system follows a three-phase flow: **Generate → Review/Refine → Execute**, with real-time streaming of execution results. Scripts run locally on the host machine (macOS) inside a sandboxed subprocess with safety guards.

## Tech Stack

- **Backend:** Python 3.x / Flask (REST API + SSE streaming).
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4.
- **AI Integration:** OpenAI API (`openai` Python SDK). Default model: `gpt-4o-mini`.
- **Styling/UI:** Framer Motion (animations), Lucide React (icons), clsx + tailwind-merge (class composition).

## Architecture & Directory Structure

- `/backend`: Flask application logic.
  - `app.py`: Entry point, API routes, execution engine, safety checks. Runs on port `8000`.
  - `requirements.txt`: Python dependencies (`flask`, `flask-cors`, `python-dotenv`, `openai`).
- `/frontend`: Next.js application.
  - `/app`: Pages and layouts (App Router). Single page `page.tsx` with phase-based state machine.
  - `/components`: Modular UI components:
    - `PromptInput` — textarea with example chips and ⌘Enter submit.
    - `ScriptPreview` — generated script display with Ejecutar/Ajustar/Descartar actions.
    - `TerminalBlock` — syntax-highlighted code block with line numbers (light regex-based tinting for bash/sh/sql).
    - `ExecutionStream` — real-time step-by-step execution progress via SSE.
    - `ResultsPanel` — execution result display with stdout/stderr, pretty/raw toggle.
    - `OutputRenderer` — smart output formatting (detects `ps aux` output → interactive process table; otherwise numbered lines view).
    - `GeneratingSkeleton` — shimmer loading placeholder during generation.
    - `ErrorBanner` — dismissible error notification.
    - `Sidebar` — session history sidebar with status dots and relative timestamps.
  - `/lib`: Shared utilities — `cn.ts` (class merger), `api.ts` (typed fetch client with SSE parser).
- `/.env`: Located at the ROOT. Contains `OPENAI_API_KEY` (required) and optional `OPENAI_MODEL` (default `gpt-4o-mini`) and `EXECUTION_TIMEOUT` (default `20` seconds).

## API Endpoints

| Method | Path | Body | Response |
|--------|------|------|----------|
| `POST` | `/api/generate` | `{ "prompt": "..." }` | `{ "id", "script", "explanation", "language" }` |
| `POST` | `/api/refine` | `{ "prompt", "script", "feedback" }` | `{ "id", "script", "explanation", "language" }` |
| `POST` | `/api/execute` | `{ "script", "language" }` | SSE stream: `start` → `step`* → `done` events |
| `GET` | `/api/health` | — | `{ "status": "ok", "model": "..." }` |

## Development Standards

### Backend (Python/Flask)

- **Error Handling:** Use try-except blocks with specific HTTP status codes. Return JSON error objects `{"error": "message"}`.
- **Environment:** Load `.env` from the root directory using `python-dotenv`.
- **CORS:** Must allow requests from `http://localhost:3000`.
- **Safety:** Scripts are validated against dangerous patterns (`rm -rf /`, fork bombs, `mkfs`, `dd`, `shutdown`, `reboot`) before execution. Missing commands are detected pre-execution via `shutil.which`.
- **Execution:** Scripts run via `subprocess.run(["/bin/bash", "-c", script])` with a configurable timeout. SQL scripts are mock-executed (no database connected). Results stream as Server-Sent Events.

### AI Implementation Logic

- **Model:** `gpt-4o-mini` by default (override via `OPENAI_MODEL` in `.env`).
- **Response format:** OpenAI JSON mode (`response_format: json_object`), temperature `0.2`.
- **System prompt:** In Spanish. Instructs the model to act as a DevOps automation expert generating macOS/POSIX-compatible scripts. Must return strict JSON with keys `script`, `explanation` (Spanish), and `language` (`bash`|`sh`|`sql`). No conversational filler.
- **Refinement prompt:** Separate system prompt for the `/api/refine` endpoint. Receives the original prompt, previous script, and user feedback. Returns a complete revised script (not a diff).
- **Fallback parsing:** `_parse_model_output` tries JSON first, then fenced code blocks, then raw text.

### Frontend (Next.js/TypeScript)

- **Design Language:** Modern DevOps/Terminal aesthetic. Dark mode only (`#09090b` background). Monospaced fonts for code. UI text in Spanish.
- **Component Pattern:** Functional components with strict TypeScript interfaces.
- **Animations:** Framer Motion for `AnimatePresence` transitions, staggered entries, slide-up/fade-in, and loading states.
- **Interactions:** Glassmorphism cards with `backdrop-blur-sm`, subtle borders (`border-white/10`), emerald accent color.

### Frontend Patterns

- **Path alias:** `@/*` → project root (configured in `tsconfig.json`).
- **Class merging:** Use `cn(...)` from `@/lib/cn` (clsx + tailwind-merge).
- **API access:** Three functions in `@/lib/api`:
  - `generateScript(prompt)` — POST to `/api/generate`.
  - `refineScript(prompt, script, feedback)` — POST to `/api/refine`.
  - `executeScript(script, language, onEvent, signal?)` — POST to `/api/execute`, parses SSE stream.
- **Types:** `GenerateResponse`, `ScriptLanguage`, `ExecutionStep`, `ExecutionResult`, `ExecutionEvent`.
- **State machine:** The main page uses a `Phase` discriminated union: `idle` → `generating` → `suggested` (with optional `refining`) → `executing` → `finished`.
- **Theme:** Zinc/Slate base with Emerald accents. Background uses `::before` (radial gradients in indigo/emerald) and `::after` (48px CSS grid) pseudo-elements, not CSS classes.

## Workflow

1. User enters a natural-language task in `PromptInput`.
2. Frontend calls `POST /api/generate` with `{ "prompt": "..." }`.
3. Backend calls OpenAI with the system prompt and JSON response mode.
4. OpenAI returns `{ "script", "explanation", "language" }`.
5. Backend validates/fallback-parses and returns the response with a generated `id`.
6. Frontend enters `suggested` phase: shows `ScriptPreview` with the script in a `TerminalBlock`, the explanation, and three actions:
   - **Ejecutar** — approve and execute the script.
   - **Ajustar** — open a refinement textarea; sends feedback to `/api/refine` and replaces the script.
   - **Descartar** — return to idle.
7. On approval, Frontend calls `POST /api/execute` and enters `executing` phase.
8. Backend streams SSE events: validates safety → checks tool availability → runs the script → collects output.
9. Frontend renders each step in `ExecutionStream` in real-time.
10. On completion, `ResultsPanel` shows exit code, duration, stdout (pretty or raw), and stderr.
11. Sessions are tracked in the `Sidebar` with status indicators.

## Local Run

- Backend: `cd backend && source .venv/bin/activate && python app.py` (serves on `:8000`).
- Frontend: `cd frontend && npm run dev` (serves on `:3000`).
