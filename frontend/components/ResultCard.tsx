"use client";

import { TerminalBlock } from "./TerminalBlock";
import { TypingText } from "./TypingText";

interface ResultCardProps {
  result: { script: string; explanation: string } | null;
}

export function ResultCard({ result }: ResultCardProps) {
  if (!result) return null;

  return (
    <section className="mt-6 space-y-3">
      <TerminalBlock script={result.script} />
      <TypingText
        text={result.explanation}
        className="font-mono text-xs leading-relaxed text-zinc-500"
      />
    </section>
  );
}
