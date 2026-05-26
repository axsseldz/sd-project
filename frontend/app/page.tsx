"use client";

import { useCallback, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  executeScript,
  generateScript,
  refineScript,
  type ExecutionResult,
  type ExecutionStep,
  type GenerateResponse,
} from "@/lib/api";
import { PromptInput } from "@/components/PromptInput";
import { ScriptPreview } from "@/components/ScriptPreview";
import { ExecutionStream } from "@/components/ExecutionStream";
import { ResultsPanel } from "@/components/ResultsPanel";
import { ErrorBanner } from "@/components/ErrorBanner";
import { GeneratingSkeleton } from "@/components/GeneratingSkeleton";
import { Sidebar, type SessionEntry } from "@/components/Sidebar";

type Phase =
  | { kind: "idle" }
  | { kind: "generating" }
  | { kind: "suggested"; result: GenerateResponse; refining: boolean }
  | {
      kind: "executing";
      result: GenerateResponse;
      steps: ExecutionStep[];
    }
  | {
      kind: "finished";
      result: GenerateResponse;
      steps: ExecutionStep[];
      execution: ExecutionResult;
    };

function shortTitle(prompt: string) {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  return trimmed.length > 56 ? `${trimmed.slice(0, 54)}…` : trimmed;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const upsertSession = useCallback(
    (entry: SessionEntry) => {
      setSessions((prev) => {
        const existing = prev.findIndex((p) => p.id === entry.id);
        if (existing === -1) return [entry, ...prev].slice(0, 24);
        const next = [...prev];
        next[existing] = entry;
        return next;
      });
    },
    [setSessions],
  );

  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setError(null);
    setPhase({ kind: "generating" });

    try {
      const data = await generateScript(trimmed);
      setPhase({ kind: "suggested", result: data, refining: false });
      setActiveSessionId(data.id);
      upsertSession({
        id: data.id,
        title: shortTitle(trimmed),
        language: data.language,
        status: "suggested",
        ts: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
      setPhase({ kind: "idle" });
    }
  }, [prompt, upsertSession]);

  const handleRefine = useCallback(
    async (feedback: string) => {
      if (phase.kind !== "suggested") return;
      const current = phase.result;
      setError(null);
      setPhase({ kind: "suggested", result: current, refining: true });

      try {
        const next = await refineScript(prompt, current.script, feedback);
        setPhase({ kind: "suggested", result: next, refining: false });
        setActiveSessionId(next.id);
        upsertSession({
          id: next.id,
          title: shortTitle(`${prompt} · ${feedback}`),
          language: next.language,
          status: "suggested",
          ts: Date.now(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Refinement failed.");
        setPhase({ kind: "suggested", result: current, refining: false });
      }
    },
    [phase, prompt, upsertSession],
  );

  const handleApprove = useCallback(async () => {
    if (phase.kind !== "suggested") return;
    const result = phase.result;
    setError(null);
    setPhase({ kind: "executing", result, steps: [] });
    upsertSession({
      id: result.id,
      title: shortTitle(prompt),
      language: result.language,
      status: "running",
      ts: Date.now(),
    });

    try {
      let collected: ExecutionStep[] = [];
      const execResult = await executeScript(
        result.script,
        result.language,
        (event) => {
          if (event.type === "step") {
            collected = [...collected, event.step];
            setPhase({ kind: "executing", result, steps: collected });
          }
        },
      );
      setPhase({
        kind: "finished",
        result,
        steps: collected,
        execution: execResult,
      });
      upsertSession({
        id: result.id,
        title: shortTitle(prompt),
        language: result.language,
        status: execResult.ok ? "success" : "error",
        ts: Date.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Execution failed.");
      setPhase({ kind: "suggested", result, refining: false });
      upsertSession({
        id: result.id,
        title: shortTitle(prompt),
        language: result.language,
        status: "error",
        ts: Date.now(),
      });
    }
  }, [phase, prompt, upsertSession]);

  const handleReset = useCallback(() => {
    setPhase({ kind: "idle" });
    setPrompt("");
    setError(null);
    setActiveSessionId(null);
  }, []);

  const handleDiscard = useCallback(() => {
    setPhase({ kind: "idle" });
    setError(null);
  }, []);

  const inputDisabled = useMemo(
    () => phase.kind === "executing" || phase.kind === "generating",
    [phase],
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={(id) => setActiveSessionId(id)}
        onNew={handleReset}
      />

      <main className="mx-auto flex w-full max-w-3xl flex-col overflow-y-auto px-6 py-10 md:py-16">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-[26px] font-medium leading-tight tracking-tight text-zinc-50">
            Describe. Revisa. Ejecuta.
          </h1>
        </motion.header>

        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleGenerate}
          loading={phase.kind === "generating"}
          disabled={inputDisabled}
        />

        <div className="mt-6 space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <ErrorBanner
                key="error"
                message={error}
                onDismiss={() => setError(null)}
              />
            )}

            {phase.kind === "generating" && (
              <GeneratingSkeleton key="generating" />
            )}

            {phase.kind === "suggested" && (
              <ScriptPreview
                key={`preview-${phase.result.id}`}
                result={phase.result}
                onApprove={handleApprove}
                onDiscard={handleDiscard}
                onRefine={handleRefine}
                refining={phase.refining}
              />
            )}

            {phase.kind === "executing" && (
              <motion.div
                key="executing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <ScriptPreview
                  result={phase.result}
                  onApprove={() => {}}
                  onDiscard={() => {}}
                  onRefine={() => {}}
                  refining={false}
                  disabled
                />
                <ExecutionStream steps={phase.steps} active />
              </motion.div>
            )}

            {phase.kind === "finished" && (
              <motion.div
                key={`finished-${phase.result.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <ScriptPreview
                  result={phase.result}
                  onApprove={() => {}}
                  onDiscard={() => {}}
                  onRefine={() => {}}
                  refining={false}
                  disabled
                />
                <ExecutionStream steps={phase.steps} active={false} />
                <ResultsPanel
                  result={phase.execution}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
