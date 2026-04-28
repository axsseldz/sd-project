"""DevOps Task Simulator backend.

Translates natural language into executable DevOps scripts via Gemini.
"""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

import google.genai as genai
from google.genai import types
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in the root .env file.")

MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

SYSTEM_PROMPT = (
    "You are a DevOps Automation Expert. Generate ONLY the executable "
    "script/command and a 1-sentence technical note for the following "
    "request. No conversational text.\n\n"
    "Respond strictly as a JSON object with exactly two string keys: "
    '"script" (the raw executable script or command, no markdown fences) '
    'and "explanation" (one sentence describing what the script does).'
)

client = genai.Client(api_key=GEMINI_API_KEY)

GENERATION_CONFIG = types.GenerateContentConfig(
    system_instruction=SYSTEM_PROMPT,
    response_mime_type="application/json",
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})


def _parse_model_output(raw: str) -> dict[str, str]:
    """Extract {script, explanation} from Gemini's response text."""
    cleaned = raw.strip()
    try:
        data = json.loads(cleaned)
        if isinstance(data, dict) and "script" in data and "explanation" in data:
            return {
                "script": str(data["script"]).strip(),
                "explanation": str(data["explanation"]).strip(),
            }
    except json.JSONDecodeError:
        pass

    fence_match = re.search(r"```(?:\w+)?\s*([\s\S]*?)```", cleaned)
    if fence_match:
        script = fence_match.group(1).strip()
        explanation = cleaned.replace(fence_match.group(0), "").strip()
        return {"script": script, "explanation": explanation or "Generated script."}

    return {"script": cleaned, "explanation": "Generated script."}


@app.route("/api/generate", methods=["POST"])
def generate():
    payload = request.get_json(silent=True) or {}
    prompt = (payload.get("prompt") or "").strip()

    if not prompt:
        return jsonify({"error": "Field 'prompt' is required."}), 400

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=GENERATION_CONFIG,
        )
        text = (getattr(response, "text", None) or "").strip()
        if not text:
            return jsonify({"error": "Empty response from Gemini."}), 502

        parsed = _parse_model_output(text)
        return jsonify(parsed), 200
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": f"Generation failed: {exc}"}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
