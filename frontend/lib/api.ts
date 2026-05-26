export type ScriptLanguage = "bash" | "sh" | "sql";

export interface GenerateResponse {
  id: string;
  script: string;
  explanation: string;
  language: ScriptLanguage;
}

export interface ExecutionStep {
  label: string;
  status: "running" | "ok" | "error";
  detail: string;
  ts: number;
}

export interface ExecutionResult {
  ok: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export type ExecutionEvent =
  | { type: "start"; language: ScriptLanguage }
  | { type: "step"; step: ExecutionStep }
  | { type: "done"; result: ExecutionResult };

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

function normalize(data: Partial<GenerateResponse>): GenerateResponse {
  if (
    typeof data.script !== "string" ||
    typeof data.explanation !== "string"
  ) {
    throw new Error("Malformed response from generation API.");
  }
  const lang = (data.language ?? "bash") as ScriptLanguage;
  return {
    id: typeof data.id === "string" ? data.id : crypto.randomUUID().slice(0, 10),
    script: data.script,
    explanation: data.explanation,
    language: ["bash", "sh", "sql"].includes(lang) ? lang : "bash",
  };
}

export async function generateScript(prompt: string): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = (await res.json()) as Partial<GenerateResponse> & {
    error?: string;
  };

  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`);
  }
  return normalize(data);
}

export async function refineScript(
  prompt: string,
  script: string,
  feedback: string,
): Promise<GenerateResponse> {
  const res = await fetch(`${API_BASE}/api/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, script, feedback }),
  });
  const data = (await res.json()) as Partial<GenerateResponse> & {
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed with status ${res.status}`);
  }
  return normalize(data);
}

/**
 * Stream execution events from the backend via Server-Sent Events.
 * Calls onEvent for each parsed event; resolves with the final result.
 */
export async function executeScript(
  script: string,
  language: ScriptLanguage,
  onEvent: (event: ExecutionEvent) => void,
  signal?: AbortSignal,
): Promise<ExecutionResult> {
  const res = await fetch(`${API_BASE}/api/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ script, language }),
    signal,
  });

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Execution request failed with status ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: ExecutionResult | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by blank lines (\n\n).
    let sepIndex;
    while ((sepIndex = buffer.indexOf("\n\n")) !== -1) {
      const rawFrame = buffer.slice(0, sepIndex);
      buffer = buffer.slice(sepIndex + 2);

      let eventName = "message";
      const dataLines: string[] = [];
      for (const line of rawFrame.split("\n")) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      if (dataLines.length === 0) continue;

      let payload: unknown;
      try {
        payload = JSON.parse(dataLines.join("\n"));
      } catch {
        continue;
      }

      if (eventName === "start") {
        onEvent({
          type: "start",
          language: (payload as { language: ScriptLanguage }).language,
        });
      } else if (eventName === "step") {
        onEvent({ type: "step", step: payload as ExecutionStep });
      } else if (eventName === "done") {
        finalResult = payload as ExecutionResult;
        onEvent({ type: "done", result: finalResult });
      }
    }
  }

  if (!finalResult) {
    throw new Error("Execution stream ended before a result arrived.");
  }
  return finalResult;
}
