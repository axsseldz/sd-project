"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ExecutionStep } from "@/lib/api";

interface ExecutionStreamProps {
  steps: ExecutionStep[];
  active: boolean;
}

export function ExecutionStream({ steps, active }: ExecutionStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [steps]);

  // Merge consecutive entries with the same label so transitions
  // (running → ok/error) update in place rather than duplicating.
  const merged: ExecutionStep[] = [];
  for (const s of steps) {
    const last = merged[merged.length - 1];
    if (last && last.label === s.label) merged[merged.length - 1] = s;
    else merged.push(s);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0e]"
    >
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              active ? "bg-emerald-400 pulse-dot" : "bg-zinc-600",
            )}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            {active ? "Ejecutando" : "Proceso"}
          </span>
        </div>
      </div>
      <div
        ref={containerRef}
        className="max-h-72 overflow-auto px-4 py-3 font-mono text-[12px] leading-relaxed"
      >
        <AnimatePresence initial={false}>
          {merged.map((step) => (
            <motion.div
              key={`${step.label}-${step.ts}-${step.status}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="flex items-start gap-3 py-0.5"
            >
              <span className="mt-0.5 w-4 shrink-0">
                {step.status === "running" && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                )}
                {step.status === "ok" && (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                )}
                {step.status === "error" && (
                  <X className="h-3.5 w-3.5 text-rose-400" />
                )}
              </span>
              <span
                className={cn(
                  "flex-1",
                  step.status === "error" ? "text-rose-300" : "text-zinc-200",
                )}
              >
                <span
                  className={cn(
                    "uppercase tracking-wider text-[10px] mr-2",
                    step.status === "running" && "text-zinc-500",
                    step.status === "ok" && "text-emerald-400/90",
                    step.status === "error" && "text-rose-400/90",
                  )}
                >
                  [
                  {step.status === "running"
                    ? "···"
                    : step.status === "ok"
                      ? "ok"
                      : "err"}
                  ]
                </span>
                {step.label}
                {step.detail ? (
                  <span className="text-zinc-500"> — {step.detail}</span>
                ) : null}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {active && (
          <div className="mt-1 text-zinc-600">
            <span className="caret" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
