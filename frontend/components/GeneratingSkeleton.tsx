"use client";

import { motion } from "framer-motion";

export function GeneratingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/40 px-2 py-0.5 text-[10px] text-zinc-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Pensando…
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0e]">
        <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            generando
          </span>
        </div>
        <div className="space-y-2.5 px-4 py-4">
          <div className="shimmer h-3 w-[78%] rounded" />
          <div className="shimmer h-3 w-[62%] rounded" />
          <div className="shimmer h-3 w-[88%] rounded" />
          <div className="shimmer h-3 w-[40%] rounded" />
        </div>
      </div>
    </motion.div>
  );
}
