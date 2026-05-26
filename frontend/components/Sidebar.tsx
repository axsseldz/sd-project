"use client";

import { motion } from "framer-motion";
import { Plus, Terminal } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SessionEntry {
  id: string;
  title: string;
  language: string;
  status: "suggested" | "success" | "error" | "running";
  ts: number;
}

interface SidebarProps {
  sessions: SessionEntry[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

const STATUS_DOT: Record<SessionEntry["status"], string> = {
  suggested: "bg-zinc-500",
  running: "bg-emerald-400 pulse-dot",
  success: "bg-emerald-400",
  error: "bg-rose-400",
};

function formatRelative(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

export function Sidebar({ sessions, activeId, onSelect, onNew }: SidebarProps) {
  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-zinc-950/60 backdrop-blur-sm md:flex">
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400/30 to-emerald-700/40 ring-1 ring-emerald-400/20">
          <Terminal className="h-3.5 w-3.5 text-emerald-200" />
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-medium text-zinc-100">Orbit</p>
          <p className="font-mono text-[10px] text-zinc-500">simulador</p>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-between rounded-md border border-white/10 bg-zinc-900/40 px-2.5 py-1.5 text-[12px] text-zinc-300 transition hover:border-white/20 hover:bg-zinc-900/70"
        >
          <span className="inline-flex items-center gap-1.5">
            <Plus className="h-3 w-3" />
            Nueva tarea
          </span>
        </button>
      </div>

      <div className="mt-5 px-3 pb-2">
        <p className="px-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          Historial
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {sessions.length === 0 ? (
          <p className="px-2 py-3 text-[12px] text-zinc-600">
            Sin tareas aún.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {sessions.map((s) => (
              <li key={s.id}>
                <motion.button
                  layout
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition",
                    activeId === s.id
                      ? "bg-zinc-900/70 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      STATUS_DOT[s.status],
                    )}
                  />
                  <span className="flex-1 truncate text-[12.5px]">{s.title}</span>
                  <span className="font-mono text-[10px] text-zinc-600">
                    {formatRelative(s.ts)}
                  </span>
                </motion.button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </aside>
  );
}
