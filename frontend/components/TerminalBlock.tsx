"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface TerminalBlockProps {
  script: string;
}

export function TerminalBlock({ script }: TerminalBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900/40">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          Script
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] text-zinc-400 transition hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="max-h-120 overflow-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-200">
        <code className="whitespace-pre-wrap break-words">{script}</code>
      </pre>
    </div>
  );
}
