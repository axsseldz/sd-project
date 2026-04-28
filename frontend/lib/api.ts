export interface GenerateResponse {
  script: string;
  explanation: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

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

  if (typeof data.script !== "string" || typeof data.explanation !== "string") {
    throw new Error("Malformed response from generation API.");
  }

  return { script: data.script, explanation: data.explanation };
}
