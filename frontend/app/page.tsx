"use client";

import { useState } from "react";
import { PromptInput } from "@/components/PromptInput";
import { ResultCard } from "@/components/ResultCard";
import { ErrorBanner } from "@/components/ErrorBanner";
import { generateScript, type GenerateResponse } from "@/lib/api";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await generateScript(trimmed);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-6 py-20">
      <header className="mb-10">
        <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
          DevOps Task Simulator
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Describe a task. Get the script.
        </p>
      </header>

      <PromptInput
        value={prompt}
        onChange={setPrompt}
        onSubmit={handleSubmit}
        loading={loading}
      />
      <ErrorBanner message={error} />
      <ResultCard result={result} />
    </main>
  );
}
