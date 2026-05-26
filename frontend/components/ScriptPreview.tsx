"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Play, RotateCcw, Wand2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GenerateResponse, ScriptLanguage } from "@/lib/api";
import { TerminalBlock } from "./TerminalBlock";

interface ScriptPreviewProps {
  result: GenerateResponse;
  onApprove: () => void;
  onDiscard: () => void;
  onRefine: (feedback: string) => void;
  refining: boolean;
  disabled?: boolean;
}

const LANG_LABEL: Record<ScriptLanguage, string> = {
  bash: "bash",
  sh: "sh",
  sql: "sql",
};

export function ScriptPreview({
  result,
  onApprove,
  onDiscard,
  onRefine,
  refining,
  disabled = false,
}: ScriptPreviewProps) {
  const [showRefine, setShowRefine] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  function submitRefine() {
    const trimmed = feedback.trim();
    if (!trimmed || refining) return;
    onRefine(trimmed);
    setFeedback("");
    setShowRefine(false);
  }

  return (
    <motion.section
      key={result.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-zinc-500">
          {LANG_LABEL[result.language]} · {result.script.split("\n").length}{" "}
          {result.script.split("\n").length === 1 ? "línea" : "líneas"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-zinc-400 transition hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copiar
            </>
          )}
        </button>
      </div>

      <TerminalBlock script={result.script} language={result.language} />

      <p className="text-[12.5px] leading-relaxed text-zinc-400">
        {result.explanation}
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onApprove}
          disabled={disabled || refining}
          className={cn(
            "group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition",
            "bg-emerald-400 text-emerald-950 hover:bg-emerald-300",
            "disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600",
          )}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Ejecutar
        </button>
        <button
          type="button"
          onClick={() => setShowRefine((s) => !s)}
          disabled={disabled || refining}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:bg-zinc-900/70 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wand2 className="h-3.5 w-3.5" />
          Ajustar
        </button>
        <button
          type="button"
          onClick={onDiscard}
          disabled={disabled || refining}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm text-zinc-500 transition hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Descartar
        </button>
      </div>

      <AnimatePresence>
        {showRefine && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 rounded-lg border border-white/10 bg-zinc-900/40">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    submitRefine();
                  }
                }}
                rows={2}
                placeholder="¿Qué quieres cambiar?"
                className="w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
                autoFocus
              />
              <div className="flex items-center justify-end gap-1.5 border-t border-white/5 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowRefine(false);
                    setFeedback("");
                  }}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-zinc-500 hover:text-zinc-200"
                >
                  <X className="h-3 w-3" />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={submitRefine}
                  disabled={feedback.trim().length === 0 || refining}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[11px] font-medium transition",
                    feedback.trim().length === 0 || refining
                      ? "cursor-not-allowed bg-zinc-800 text-zinc-600"
                      : "bg-zinc-100 text-zinc-900 hover:bg-white",
                  )}
                >
                  {refining ? "Ajustando…" : "Aplicar"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
