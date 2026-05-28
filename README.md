# Orbit — DevOps Task Simulator

AI-powered middleware that turns natural-language requests into executable DevOps scripts and commands. Describe a task, review the generated script, optionally refine it, then execute it — all from the browser with real-time streaming output.

Backend is Flask + OpenAI. Frontend is Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.

---

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and **npm**
- An **OpenAI API key** — create one at https://platform.openai.com/api-keys

---

## Setup

### 1. Clone and configure the API key

Create a `.env` file at the **root** of the project (next to this README):

```env
OPENAI_API_KEY=your_key_here
# Optional — override the default model (default: gpt-4o-mini)
# OPENAI_MODEL=gpt-4o
# Optional — script execution timeout in seconds (default: 20)
# EXECUTION_TIMEOUT=30
```

### 2. Backend (Flask, port 8000)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The API will be live at `http://localhost:8000` with these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/generate` | Generate a script from a natural-language prompt |
| `POST` | `/api/refine` | Refine a previously generated script with feedback |
| `POST` | `/api/execute` | Execute a script and stream results via SSE |
| `GET` | `/api/health` | Health check — returns `{ "status": "ok" }` |

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

## How it works

1. **Describe** — type a task in natural language (e.g. "Mostrar uso de disco").
2. **Review** — the AI generates a script; you see it syntax-highlighted in a terminal block with an explanation.
3. **Refine** *(optional)* — click "Ajustar" and describe what to change. The AI rewrites the full script.
4. **Execute** — click "Ejecutar" to run the script locally. Safety checks block dangerous patterns and missing tools before execution.
5. **Results** — stdout and stderr stream in real-time. Output is formatted with smart views (e.g. `ps aux` output renders as an interactive process table).

---

## Project structure

```
.
├── .env                        # OPENAI_API_KEY (root-level, gitignored)
├── backend/
│   ├── app.py                  # Flask app, OpenAI client, execution engine, safety guards
│   └── requirements.txt        # flask, flask-cors, python-dotenv, openai
└── frontend/
    ├── app/                    # Next.js App Router — page.tsx (phase state machine), layout.tsx, globals.css
    ├── components/
    │   ├── PromptInput.tsx      # Textarea with example chips and ⌘Enter submit
    │   ├── ScriptPreview.tsx    # Script display with Ejecutar / Ajustar / Descartar actions
    │   ├── TerminalBlock.tsx    # Syntax-highlighted code block with line numbers
    │   ├── ExecutionStream.tsx  # Real-time step-by-step execution progress (SSE)
    │   ├── ResultsPanel.tsx     # Execution results — stdout/stderr with pretty/raw toggle
    │   ├── OutputRenderer.tsx   # Smart output formatting (ps-style table, numbered lines)
    │   ├── GeneratingSkeleton.tsx # Shimmer loading placeholder
    │   ├── ErrorBanner.tsx      # Dismissible error notification
    │   └── Sidebar.tsx          # Session history with status indicators
    └── lib/
        ├── api.ts               # Typed fetch client with SSE stream parser
        └── cn.ts                # clsx + tailwind-merge class merger
```

---

## Things to ask the system

### Bash / macOS

- Mostrar uso de disco del home.
- Procesos con más consumo de memoria.
- Encontrar archivos mayores a 100MB.
- Imprimir las últimas 10 líneas de /var/log/system.log.
- Ver tiempo encendido del sistema.

### Docker

- Listar contenedores en ejecución.
- Detener todos los contenedores activos.
- Eliminar imágenes sin uso.
- Mostrar logs del contenedor `web`.

### Kubernetes

- Listar todos los pods en todos los namespaces.
- Reiniciar el deployment `api`.
- Estado de todos los nodos.

### Git

- Deshacer el último commit pero conservar los cambios.
- Eliminar la rama local `feature-x`.
- Mostrar los últimos 5 commits.

### SQL

- Obtener los 10 usuarios más recientes de la tabla `users`.
- Contar filas en la tabla `orders`.
- Encontrar emails duplicados en `users`.

### Networking

- Verificar si el puerto 443 está abierto en `example.com`.
- Mostrar mi IP pública.
- Hacer ping a `google.com` 5 veces.

---

## Tech stack

- **Backend:** Python 3, Flask, flask-cors, python-dotenv, openai
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React
- **Model:** `gpt-4o-mini` (default) — overridable via `OPENAI_MODEL`
