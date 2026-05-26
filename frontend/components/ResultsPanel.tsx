"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Copy, TerminalSquare, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ExecutionResult } from "@/lib/api";
import { OutputRenderer } from "./OutputRenderer";

interface ResultsPanelProps {
  result: ExecutionResult;
  onReset: () => void;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ResultsPanel({ result, onReset }: ResultsPanelProps) {
  const hasStdout = result.stdout.trim().length > 0;
  const hasStderr = result.stderr.trim().length > 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border px-3 py-2",
          result.ok
            ? "border-emerald-400/20 bg-emerald-400/5"
            : "border-rose-400/20 bg-rose-400/5",
        )}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full",
              result.ok ? "bg-emerald-400/15" : "bg-rose-400/15",
            )}
          >
            {result.ok ? (
              <Check className="h-3.5 w-3.5 text-emerald-300" />
            ) : (
              <X className="h-3.5 w-3.5 text-rose-300" />
            )}
          </span>
          <div className="leading-tight">
            <p
              className={cn(
                "text-sm font-medium",
                result.ok ? "text-emerald-200" : "text-rose-200",
              )}
            >
              {result.ok ? "Ejecución exitosa" : "Ejecución fallida"}
            </p>
            <p className="font-mono text-[11px] text-zinc-500">
              código {result.exitCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-500">
            <Clock className="h-3 w-3" />
            {formatDuration(result.durationMs)}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="rounded-md border border-white/10 bg-zinc-900/40 px-2.5 py-1 text-[11px] text-zinc-300 transition hover:border-white/20 hover:bg-zinc-900/70"
          >
            Nueva tarea
          </button>
        </div>
      </div>

      {hasStdout && (
        <OutputBlock title="salida" tone="ok" body={result.stdout} />
      )}
      {hasStderr && (
        <OutputBlock title="errores" tone="err" body={result.stderr} />
      )}
      {!hasStdout && !hasStderr && (
        <div className="rounded-lg border border-white/10 bg-zinc-900/30 px-3 py-2 font-mono text-[11px] text-zinc-500">
          (sin salida)
        </div>
      )}
    </motion.section>
  );
}

function OutputBlock({
  title,
  tone,
  body,
}: {
  title: string;
  tone: "ok" | "err";
  body: string;
}) {
  const [view, setView] = useState<"pretty" | "raw">("pretty");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable */
    }
  }

  const lineCount = body.trim().split("\n").length;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0e]">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <TerminalSquare
            className={cn(
              "h-3 w-3",
              tone === "ok" ? "text-emerald-300/80" : "text-rose-300/80",
            )}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {title}
          </span>
          <span className="font-mono text-[10px] text-zinc-600">
            · {lineCount} {lineCount === 1 ? "línea" : "líneas"} ·{" "}
            {formatBytes(body.length)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ViewToggle value={view} onChange={setView} />
          <button
            type="button"
            onClick={handleCopy}
            className="ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 transition hover:text-zinc-100"
            title="Copiar"
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
      </div>
      <div className="max-h-[28rem] overflow-auto">
        {view === "pretty" ? (
          <OutputRenderer body={body} tone={tone} />
        ) : (
          <pre
            className={cn(
              "px-4 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap break-words",
              tone === "ok" ? "text-zinc-200" : "text-rose-200/95",
            )}
          >
            {body}
          </pre>
        )}
      </div>
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: "pretty" | "raw";
  onChange: (v: "pretty" | "raw") => void;
}) {
  return (
    <div className="flex items-center rounded-md border border-white/10 bg-zinc-900/40 p-0.5">
      {(["pretty", "raw"] as const).map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider transition",
            value === opt
              ? "bg-zinc-700/50 text-zinc-100"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          {opt === "pretty" ? "vista" : "raw"}
        </button>
      ))}
    </div>
  );
}
