from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import time
import uuid
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from flask import Flask, Response, jsonify, request, stream_with_context
from flask_cors import CORS
from openai import OpenAI

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY is not set in the root .env file.")

MODEL_NAME = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
EXECUTION_TIMEOUT_SECONDS = int(os.getenv("EXECUTION_TIMEOUT", "20"))

SYSTEM_PROMPT = (
    "Eres un experto en automatización DevOps. Traduces una solicitud en "
    "lenguaje natural a UN artefacto ejecutable concreto: un comando o "
    "script bash POSIX, o (cuando la solicitud es claramente de datos) una "
    "única consulta SQL.\n\n"
    "Entorno de ejecución: macOS con bash 3.x y utilidades BSD/POSIX. "
    "USA SOLO sintaxis BSD/POSIX — NO uses extensiones GNU/Linux. "
    "Ejemplos de lo que NO funciona en macOS: 'ps aux --sort=-%mem' "
    "(usa 'ps aux | sort -k4 -rn'), 'find -printf', 'grep -P', "
    "'sed -i ''' sin argumento de respaldo', 'date -d', 'stat --format', "
    "'readlink -f', 'tac', 'shuf'.\n"
    "Comandos disponibles por defecto: ls, du, df, ps, find, grep, awk, "
    "sed, cat, head, tail, wc, sort, uniq, cut, tr, xargs, tar, gzip, "
    "uptime, uname, who, date, env, hostname, ifconfig, netstat, top, "
    "kill, sleep, echo, printf, basename, dirname, mkdir, touch, cp, "
    "mv, rm, stat, file, which, sw_vers, system_profiler, lsof.\n\n"
    "REGLAS ESTRICTAS:\n"
    "1. SIEMPRE devuelve un script ejecutable válido y NO VACÍO. Nunca "
    "rechaces la solicitud ni dejes \"script\" en blanco.\n"
    "2. Si la solicitud puede resolverse con herramientas POSIX "
    "estándar, prefiérelas SIEMPRE (p.ej. 'procesos con más memoria' = "
    "'ps aux | sort -k4 -rn | head'). Reformula tareas vagas hacia "
    "estas herramientas cuando sea razonable.\n"
    "3. Si el usuario menciona EXPLÍCITAMENTE docker/kubectl/systemctl/"
    "apt/yum/brew/journalctl/podman/helm/terraform/ansible, genera el "
    "comando real con esa herramienta. El simulador validará la "
    "disponibilidad antes de correr.\n"
    "4. Prefiere comandos seguros e idempotentes. Evita operaciones "
    "destructivas (rm -rf, DROP TABLE) salvo petición explícita.\n"
    "5. Devuelve un objeto JSON con EXACTAMENTE estas claves: \"script\" "
    "(cadena, ejecutable crudo, SIN bloques markdown ni shebang), "
    "\"explanation\" (una oración técnica EN ESPAÑOL, sin relleno) y "
    "\"language\" (uno de \"bash\", \"sh\", \"sql\").\n"
    "6. Nunca incluyas texto conversacional ni te disculpes. Si la "
    "petición es ambigua, asume lo más razonable y procede."
)

REFINE_PROMPT = (
    "Estás revisando un script DevOps previamente generado según el "
    "feedback del usuario. Mantén el mismo contrato JSON: "
    "{\"script\", \"explanation\", \"language\"}. La explicación va en "
    "español. Devuelve el script revisado COMPLETO — no un diff. Sigue "
    "limitándote a herramientas POSIX estándar de macOS."
)

client = OpenAI(api_key=OPENAI_API_KEY)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


# ---------------------------------------------------------------------------
# Generation phase
# ---------------------------------------------------------------------------

def _parse_model_output(raw: str) -> dict[str, str]:
    """Extract {script, explanation, language} from the model response."""
    cleaned = raw.strip()
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict) and "script" in data and "explanation" in data:
            return {
                "script": str(data["script"]).strip(),
                "explanation": str(data["explanation"]).strip(),
                "language": str(data.get("language", "bash")).strip().lower() or "bash",
            }
    except json.JSONDecodeError:
        pass

    fence_match = re.search(r"```(\w+)?\s*([\s\S]*?)```", cleaned)
    if fence_match:
        lang = (fence_match.group(1) or "bash").lower()
        script = fence_match.group(2).strip()
        explanation = cleaned.replace(fence_match.group(0), "").strip()
        return {
            "script": script,
            "explanation": explanation or "Generated script.",
            "language": lang if lang in {"bash", "sh", "sql"} else "bash",
        }

    return {"script": cleaned, "explanation": "Generated script.", "language": "bash"}


def _call_openai(system: str, user: str) -> dict[str, str]:
    completion = client.chat.completions.create(
        model=MODEL_NAME,
        temperature=0.2,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    text = (completion.choices[0].message.content or "").strip()
    if not text:
        raise RuntimeError("Empty response from OpenAI.")
    return _parse_model_output(text)


@app.route("/api/generate", methods=["POST"])
def generate():
    payload = request.get_json(silent=True) or {}
    prompt = (payload.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "Field 'prompt' is required."}), 400

    try:
        parsed = _call_openai(SYSTEM_PROMPT, prompt)
        parsed["id"] = uuid.uuid4().hex[:10]
        return jsonify(parsed), 200
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Generation failed: {exc}"}), 500


@app.route("/api/refine", methods=["POST"])
def refine():
    payload = request.get_json(silent=True) or {}
    prompt = (payload.get("prompt") or "").strip()
    previous_script = (payload.get("script") or "").strip()
    feedback = (payload.get("feedback") or "").strip()

    if not feedback or not previous_script:
        return jsonify({"error": "Fields 'script' and 'feedback' are required."}), 400

    combined = (
        f"Original request:\n{prompt or '(not provided)'}\n\n"
        f"Previous script:\n{previous_script}\n\n"
        f"User feedback to apply:\n{feedback}"
    )

    try:
        parsed = _call_openai(REFINE_PROMPT, combined)
        parsed["id"] = uuid.uuid4().hex[:10]
        return jsonify(parsed), 200
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Refinement failed: {exc}"}), 500

DANGEROUS_PATTERNS = [
    r"\brm\s+-rf\s+/(?!\w)",          # rm -rf /
    r":\(\)\s*\{\s*:\|\:&\s*\}",      # classic fork bomb
    r"\bmkfs(\.|\s)",                  # filesystem reformat
    r"\bdd\s+if=.*of=/dev/",          # raw device writes
    r"\bshutdown\b",
    r"\breboot\b",
    r">\s*/dev/sda",
]


def _is_dangerous(script: str) -> str | None:
    for pat in DANGEROUS_PATTERNS:
        if re.search(pat, script, flags=re.IGNORECASE):
            return pat
    return None

SHELL_BUILTINS = {
    "cd", "echo", "export", "set", "unset", "source", ".", "alias", "unalias",
    "exit", "return", "read", "shift", "test", "true", "false", "trap", "wait",
    "pwd", "type", "command", "umask", "let", "local", "eval", "exec",
    "declare", "readonly", "builtin", "printf", "getopts", "history", "jobs",
    "fg", "bg", "help", "hash", "complete", "compgen", "mapfile", "readarray",
    "ulimit", "time", "caller", "enable", "dirs", "pushd", "popd",
    "if", "then", "else", "elif", "fi", "for", "while", "do", "done",
    "case", "esac", "in", "function", "select", "until",
    "{", "}", "(", ")", "!", "[", "[[", "]]", ":",
}


def _missing_commands(script: str) -> list[str]:
    """Devuelve comandos externos referenciados en el script que no están
    instalados en este sistema. Heurística — no es perfecta pero atrapa los
    casos comunes (docker, kubectl, etc.) antes de que subprocess falle."""
    missing: set[str] = set()
    # Separar en sub-comandos por delimitadores de shell comunes
    parts = re.split(r"(?:&&|\|\||[\|;\n&])|(?:\bthen\b|\bdo\b|\belse\b)", script)
    for raw_part in parts:
        token = raw_part.strip()
        if not token:
            continue
        # Quitar prefijos no útiles: subshell, negación, llave
        token = re.sub(r"^[\s\(\!{]+", "", token).strip()
        # Quitar asignaciones de variables de entorno previas: FOO=bar BAR=baz cmd
        while re.match(r"^[A-Za-z_][A-Za-z0-9_]*=\S*\s+", token):
            token = re.sub(r"^[A-Za-z_][A-Za-z0-9_]*=\S*\s+", "", token, count=1)
        # Tomar la primera "palabra"
        m = re.match(r"^([\w\-./]+)", token)
        if not m:
            continue
        cmd = m.group(1)
        # Saltar variables, números, builtins
        if cmd.startswith("$") or cmd.startswith("-") or cmd[0].isdigit():
            continue
        if cmd in SHELL_BUILTINS:
            continue
        # Si es una ruta, validar existencia del archivo
        if "/" in cmd:
            if not Path(cmd).exists() and shutil.which(cmd) is None:
                missing.add(cmd)
            continue
        if shutil.which(cmd) is None:
            missing.add(cmd)
    return sorted(missing)


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


def _execute_stream(script: str, language: str) -> Generator[str, None, None]:
    """Yield Server-Sent Events describing each phase of execution."""

    def step(label: str, status: str = "running", detail: str = "") -> str:
        return _sse(
            "step",
            {"label": label, "status": status, "detail": detail, "ts": time.time()},
        )

    yield _sse("start", {"language": language})
    yield step("Validando script", "running")
    time.sleep(0.18)

    threat = _is_dangerous(script)
    if threat:
        yield step("Validando script", "error", f"Bloqueado por patrón peligroso: {threat}")
        yield _sse(
            "done",
            {
                "ok": False,
                "exitCode": -1,
                "stdout": "",
                "stderr": f"Ejecución rechazada: coincide con patrón peligroso {threat!r}.",
                "durationMs": 0,
            },
        )
        return

    yield step("Validando script", "ok", "Sin patrones peligrosos")

    # Verificar herramientas requeridas antes de gastar un subprocess.
    if language in {"bash", "sh"}:
        yield step("Verificando herramientas", "running")
        time.sleep(0.15)
        missing = _missing_commands(script)
        if missing:
            yield step(
                "Verificando herramientas",
                "error",
                f"No instalado: {', '.join(missing)}",
            )
            yield _sse(
                "done",
                {
                    "ok": False,
                    "exitCode": -2,
                    "stdout": "",
                    "stderr": (
                        "No se puede ejecutar: el sistema no tiene "
                        f"{', '.join(missing)}.\n"
                        "Este simulador usa macOS con herramientas POSIX "
                        "estándar. Reformula la tarea para usar utilidades "
                        "ya disponibles (ls, ps, du, df, find, grep, etc.)."
                    ),
                    "durationMs": 0,
                },
            )
            return
        yield step("Verificando herramientas", "ok", "Todas disponibles")

    yield step("Preparando entorno", "running")
    time.sleep(0.15)
    yield step(
        "Preparando entorno",
        "ok",
        f"Shell: /bin/bash · Timeout: {EXECUTION_TIMEOUT_SECONDS}s",
    )

    yield step("Ejecutando", "running", f"{len(script.splitlines())} línea(s)")

    started = time.time()
    try:
        if language == "sql":
            # No hay BD conectada — devolvemos un mock controlado para que el
            # flujo de UI termine sin sorpresas.
            time.sleep(0.4)
            stdout = (
                "-- ejecución SQL simulada --\n"
                "(No hay base de datos conectada en el simulador.)\n"
                f"{script}\n"
            )
            stderr = ""
            exit_code = 0
        else:
            completed = subprocess.run(
                ["/bin/bash", "-c", script],
                capture_output=True,
                text=True,
                timeout=EXECUTION_TIMEOUT_SECONDS,
            )
            stdout = completed.stdout
            stderr = completed.stderr
            exit_code = completed.returncode

        duration_ms = int((time.time() - started) * 1000)
        ok = exit_code == 0
        yield step(
            "Ejecutando",
            "ok" if ok else "error",
            f"código={exit_code} · {duration_ms} ms",
        )
        yield step(
            "Recolectando salida",
            "ok",
            f"{len(stdout)} bytes stdout · {len(stderr)} bytes stderr",
        )
        yield _sse(
            "done",
            {
                "ok": ok,
                "exitCode": exit_code,
                "stdout": stdout,
                "stderr": stderr,
                "durationMs": duration_ms,
            },
        )
    except subprocess.TimeoutExpired:
        duration_ms = int((time.time() - started) * 1000)
        yield step("Ejecutando", "error", f"Tiempo agotado tras {EXECUTION_TIMEOUT_SECONDS}s")
        yield _sse(
            "done",
            {
                "ok": False,
                "exitCode": 124,
                "stdout": "",
                "stderr": f"Proceso cancelado: excedió el timeout de {EXECUTION_TIMEOUT_SECONDS}s.",
                "durationMs": duration_ms,
            },
        )
    except Exception as exc:  # noqa: BLE001
        duration_ms = int((time.time() - started) * 1000)
        yield step("Ejecutando", "error", str(exc))
        yield _sse(
            "done",
            {
                "ok": False,
                "exitCode": 1,
                "stdout": "",
                "stderr": f"Error de ejecución: {exc}",
                "durationMs": duration_ms,
            },
        )


@app.route("/api/execute", methods=["POST"])
def execute():
    payload = request.get_json(silent=True) or {}
    script = (payload.get("script") or "").strip()
    language = (payload.get("language") or "bash").strip().lower()

    if not script:
        return jsonify({"error": "Field 'script' is required."}), 400

    if language not in {"bash", "sh", "sql"}:
        language = "bash"

    return Response(
        stream_with_context(_execute_stream(script, language)),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_NAME}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
