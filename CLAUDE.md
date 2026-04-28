# DevOps Task Simulator - Project Context & Standards

## Project Overview

An AI-powered middleware that translates Natural Language (NL) instructions into executable DevOps scripts or database queries. The system bridges the gap between high-level intent and low-level infrastructure execution.

## Tech Stack

- **Backend:** Python 3.x / Flask (REST API).
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS.
- **AI Integration:** Google Gemini API (Generative AI SDK).
- **Styling/UI:** Framer Motion (animations), Lucide React (icons), Radix UI (primitives).

## Architecture & Directory Structure

- `/backend`: Flask application logic.
  - `app.py`: Entry point and API routes. Runs on port `8000`.
  - `requirements.txt`: Python dependencies.
- `/frontend`: Next.js application.
  - `/app`: Pages and layouts (App Router).
  - `/components`: Modular UI components (`PromptInput`, `ResultCard`, `TerminalBlock`, `TypingText`, `ErrorBanner`).
  - `/lib`: Shared utilities — `cn.ts` (class merger), `api.ts` (typed fetch client).
- `/.env`: Located at the ROOT. Contains `GEMINI_API_KEY` and optional `GEMINI_MODEL` (default `gemini-2.5-flash-lite`).

## Development Standards

### Backend (Python/Flask)

- **Error Handling:** Use try-except blocks with specific HTTP status codes. Return JSON error objects `{"error": "message"}`.
- **Environment:** Load `.env` from the root directory using `python-dotenv`.
- **CORS:** Must allow requests from `http://localhost:3000`.
- **Prompt Engineering:** The system prompt must force Gemini to output a structured JSON or a clean code block. No conversational filler (e.g., "Sure, here is your script").

### Frontend (Next.js/TypeScript)

- **Design Language:** Modern DevOps/Terminal aesthetic. Dark mode by default (`#0a0a0a` backgrounds). Use monospaced fonts for code outputs.
- **Component Pattern:** Functional components with strict TypeScript interfaces.
- **Animations:** Use `framer-motion` for staggered list entries, smooth transitions, and loading states.
- **Interactions:** Use "Glassmorphism" effects and subtle borders (`border-white/10`).

### AI Implementation Logic

- **Model:** `gemini-2.5-flash-lite` by default (override via `GEMINI_MODEL`).
- **System Instruction:** "You are a DevOps Automation Expert. Generate ONLY the executable script/command and a 1-sentence technical note for the following request. No conversational text." Gemini is configured with `response_mime_type=application/json` and instructed to return strict JSON with `script` and `explanation` keys; `app._parse_model_output` falls back to fenced-code-block extraction if parsing fails.

### Frontend Patterns

- **Path alias:** `@/*` → project root (configured in `tsconfig.json`).
- **Class merging:** Use `cn(...)` from `@/lib/cn` (clsx + tailwind-merge) for conditional class composition.
- **API access:** Use `generateScript(prompt)` from `@/lib/api`. Base URL is `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8000`).
- **Animations:**
  - Result card uses Framer Motion `AnimatePresence` with a slide-up + fade-in entry.
  - The explanation field uses a per-character "typing" effect (`TypingText`) implemented via staggered Framer Motion opacity transitions.
- **Theme:** Slate/Zinc base with Emerald accents; global background combines an SVG noise texture and a CSS grid (`.bg-grid`, `.bg-noise` in `globals.css`).

## Workflow

1. User enters text in Frontend.
2. Frontend sends POST request to `/api/generate` with `{ "prompt": "..." }`.
3. Backend calls Gemini API with strict system instructions and JSON response mode.
4. Gemini returns a JSON object with `script` and `explanation`.
5. Backend validates / falls back-parses and returns `{"script": "...", "explanation": "..."}`.
6. Frontend renders the script in a terminal-styled block with a `navigator.clipboard` copy button, and types out the explanation character-by-character.

## Local Run

- Backend: `cd backend && source .venv/bin/activate && python app.py` (serves on `:8000`).
- Frontend: `cd frontend && npm run dev` (serves on `:3000`).
