"use client";

import { cn } from "@/lib/cn";

interface TerminalBlockProps {
  script: string;
  language?: "bash" | "sh" | "sql";
  className?: string;
}

// Very light syntax tinting — no heavy highlighter dependency. We keep the
// markup minimal and rely on color contrast to suggest structure.
function tint(line: string, language: "bash" | "sh" | "sql"): React.ReactNode {
  if (language === "sql") {
    const sqlKeywords =
      /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP BY|ORDER BY|LIMIT|INSERT INTO|UPDATE|SET|DELETE|VALUES|AS|AND|OR|NOT|NULL|IS|IN|BETWEEN|LIKE|HAVING|UNION|CASE|WHEN|THEN|ELSE|END|WITH)\b/gi;
    return splitMarkup(line, [
      { re: /--.*$/g, cls: "text-zinc-500" },
      { re: /'[^']*'/g, cls: "text-amber-300/90" },
      { re: sqlKeywords, cls: "text-violet-300" },
      { re: /\b\d+(\.\d+)?\b/g, cls: "text-emerald-300/90" },
    ]);
  }
  return splitMarkup(line, [
    { re: /(^|\s)#.*$/g, cls: "text-zinc-500" },
    { re: /"[^"]*"|'[^']*'/g, cls: "text-amber-300/90" },
    {
      re: /\b(sudo|cd|ls|grep|awk|sed|find|xargs|tar|gzip|curl|wget|docker|kubectl|systemctl|service|ssh|scp|rsync|chmod|chown|ps|kill|top|df|du|cat|tail|head|echo|export|source|if|then|else|fi|for|do|done|while|in|function|return)\b/g,
      cls: "text-violet-300",
    },
    { re: /(^|\s)(-{1,2}[\w-]+)/g, cls: "text-emerald-300/90" },
    { re: /\$\w+|\$\{[^}]+\}/g, cls: "text-sky-300" },
  ]);
}

interface Rule {
  re: RegExp;
  cls: string;
}

function splitMarkup(line: string, rules: Rule[]): React.ReactNode {
  type Span = { start: number; end: number; cls: string };
  const spans: Span[] = [];
  for (const rule of rules) {
    rule.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = rule.re.exec(line)) !== null) {
      if (m[0].length === 0) {
        rule.re.lastIndex += 1;
        continue;
      }
      spans.push({
        start: m.index,
        end: m.index + m[0].length,
        cls: rule.cls,
      });
    }
  }
  if (spans.length === 0) return line || " ";

  // Resolve overlaps: keep earliest-starting, longest match.
  spans.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Span[] = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (!last || s.start >= last.end) merged.push(s);
  }

  const out: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < merged.length; i++) {
    const s = merged[i];
    if (s.start > cursor) out.push(line.slice(cursor, s.start));
    out.push(
      <span key={i} className={s.cls}>
        {line.slice(s.start, s.end)}
      </span>,
    );
    cursor = s.end;
  }
  if (cursor < line.length) out.push(line.slice(cursor));
  return out;
}

export function TerminalBlock({
  script,
  language = "bash",
  className,
}: TerminalBlockProps) {
  const lines = script.length === 0 ? [""] : script.split("\n");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0e]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {language}
        </span>
      </div>
      <pre className="max-h-[28rem] overflow-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed text-zinc-200">
        <code>
          {lines.map((line, idx) => (
            <div key={idx} className="flex gap-4">
              <span className="select-none text-zinc-700">
                {String(idx + 1).padStart(2, " ")}
              </span>
              <span className="whitespace-pre-wrap break-words">
                {tint(line, language)}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
