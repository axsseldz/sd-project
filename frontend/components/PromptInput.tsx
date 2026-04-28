"use client";

import { cn } from "@/lib/cn";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  loading,
}: PromptInputProps) {
  const canSubmit = value.trim().length > 0 && !loading;

  return (
    <div className="w-full">
      <div className="rounded-lg border border-white/10 bg-zinc-900/40 transition focus-within:border-white/25">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
              e.preventDefault();
              onSubmit();
            }
          }}
          rows={4}
          placeholder="e.g. Find all log files older than 30 days and gzip them."
          className="w-full resize-none bg-transparent px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <div className="flex items-center justify-between border-t border-white/5 px-3 py-2">
          <span className="font-mono text-[11px] text-zinc-600">
            ⌘ + Enter
          </span>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition",
              canSubmit
                ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                : "cursor-not-allowed bg-zinc-800 text-zinc-600",
            )}
          >
            {loading ? "Generating…" : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}
