"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface OutputRendererProps {
  body: string;
  tone: "ok" | "err";
}

type Shape =
  | { kind: "empty" }
  | { kind: "ps"; rows: PsRow[] }
  | { kind: "lines"; items: string[] };

interface PsRow {
  user: string;
  pid: string;
  cpu: string;
  mem: string;
  command: string;
  raw: string;
}

const PS_LINE =
  /^(\S+)\s+(\d+)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+)\s+(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/;

function detectShape(body: string): Shape {
  const raw = body.replace(/\s+$/, "");
  if (!raw) return { kind: "empty" };
  const lines = raw.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { kind: "empty" };

  // Detect ps-aux-style output: ≥ 2 lines match the canonical format.
  const psRows: PsRow[] = [];
  let psMatchCount = 0;
  for (const line of lines) {
    const m = line.match(PS_LINE);
    if (m) {
      psMatchCount += 1;
      psRows.push({
        user: m[1],
        pid: m[2],
        cpu: m[3],
        mem: m[4],
        command: m[11],
        raw: line,
      });
    }
  }
  if (psMatchCount >= 2 && psMatchCount / lines.length >= 0.7) {
    return { kind: "ps", rows: psRows };
  }

  return { kind: "lines", items: lines };
}

export function OutputRenderer({ body, tone }: OutputRendererProps) {
  const shape = useMemo(() => detectShape(body), [body]);
  if (shape.kind === "empty") {
    return (
      <div className="px-4 py-3 font-mono text-[11px] text-zinc-600">
        (sin contenido)
      </div>
    );
  }
  if (shape.kind === "ps") return <PsView rows={shape.rows} />;
  return <LinesView items={shape.items} tone={tone} />;
}

// ---------------------------------------------------------------------------
// PS view
// ---------------------------------------------------------------------------

function processName(cmd: string): string {
  const flagIdx = cmd.search(/\s-/);
  const binary = (flagIdx === -1 ? cmd : cmd.slice(0, flagIdx)).trim();
  const lastSlash = binary.lastIndexOf("/");
  const name = lastSlash === -1 ? binary : binary.slice(lastSlash + 1);
  return name || binary;
}

function PsView({ rows }: { rows: PsRow[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <ul className="divide-y divide-white/5">
      {rows.map((row, i) => {
        const isOpen = expanded.has(i);
        const name = processName(row.command);
        const cpu = parseFloat(row.cpu);
        const mem = parseFloat(row.mem);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-white/[0.02]"
            >
              <ChevronRight
                className={cn(
                  "mt-1 h-3 w-3 shrink-0 text-zinc-600 transition-transform",
                  isOpen && "rotate-90",
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate text-[13px] font-medium text-zinc-100">
                    {name}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    PID {row.pid}
                  </span>
                  <span className="text-zinc-700">·</span>
                  <span className="font-mono text-[10px] text-zinc-500">
                    {row.user}
                  </span>
                </div>
                <div
                  className={cn(
                    "mt-1 font-mono text-[11.5px] text-zinc-500",
                    !isOpen && "truncate",
                    isOpen && "whitespace-pre-wrap break-words",
                  )}
                >
                  {row.command}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <StatChip label="CPU" value={cpu} unit="%" />
                <StatChip label="MEM" value={mem} unit="%" />
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function StatChip({
  label,
  value,
  unit,
}: {
  label: string;
  value: number;
  unit: string;
}) {
  // Color intensity: light if low, warm if elevated, hot if high
  const tone =
    value >= 20
      ? "border-rose-400/30 bg-rose-400/10 text-rose-200"
      : value >= 5
        ? "border-amber-400/25 bg-amber-400/5 text-amber-200"
        : "border-white/10 bg-zinc-900/60 text-zinc-300";
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px]",
        tone,
      )}
    >
      <span className="text-zinc-500">{label}</span>
      <span>
        {value.toFixed(1)}
        {unit}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Generic lines view
// ---------------------------------------------------------------------------

function LinesView({ items, tone }: { items: string[]; tone: "ok" | "err" }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const longLineThreshold = 100;

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <ul className="divide-y divide-white/[0.04]">
      {items.map((line, i) => {
        const isLong = line.length > longLineThreshold;
        const isOpen = expanded.has(i);
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => isLong && toggle(i)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-2 text-left transition",
                isLong && "cursor-pointer hover:bg-white/[0.02]",
                !isLong && "cursor-default",
              )}
            >
              <span className="mt-0.5 w-7 shrink-0 select-none text-right font-mono text-[10px] text-zinc-600">
                {i + 1}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 font-mono text-[12.5px] leading-relaxed",
                  tone === "ok" ? "text-zinc-200" : "text-rose-200/95",
                  !isOpen && "truncate",
                  isOpen && "whitespace-pre-wrap break-words",
                )}
              >
                {line || " "}
              </span>
              {isLong && !isOpen && (
                <span className="mt-0.5 shrink-0 font-mono text-[10px] text-zinc-600">
                  +{line.length - longLineThreshold}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
