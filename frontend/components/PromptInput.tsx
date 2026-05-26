"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled?: boolean;
}

const EXAMPLES = [
  "Mostrar uso de disco",
  "Procesos con más memoria",
  "Ver tiempo encendido",
];

export function PromptInput({
  value,
  onChange,
  onSubmit,
  loading,
  disabled = false,
}: PromptInputProps) {
  const canSubmit = value.trim().length > 0 && !loading && !disabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      <div
        className={cn(
          "group relative rounded-xl border border-white/10 bg-zinc-900/40 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] backdrop-blur-sm transition",
          "focus-within:border-white/25 focus-within:bg-zinc-900/60",
        )}
      >
        <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition group-focus-within:opacity-100">
          <div className="h-full w-full rounded-xl ring-1 ring-emerald-400/15" />
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={3}
          disabled={disabled}
          placeholder="Describe una tarea…"
          className="relative w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none disabled:opacity-60"
        />
        <div className="relative flex items-center justify-between border-t border-white/5 px-3 py-2">
          <span className="font-mono text-[11px] text-zinc-500">⌘ Enter</span>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition",
              canSubmit
                ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                : "cursor-not-allowed bg-zinc-800 text-zinc-600",
            )}
          >
            {loading ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-transparent" />
                Generando
              </>
            ) : (
              <>
                Generar
                <ArrowUp className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {value.trim().length === 0 && !disabled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => onChange(ex)}
              className="rounded-full border border-white/10 bg-zinc-900/30 px-2.5 py-1 text-[11px] text-zinc-400 transition hover:border-white/20 hover:bg-zinc-900/60 hover:text-zinc-200"
            >
              {ex}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
