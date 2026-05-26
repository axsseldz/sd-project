"use client";

import { motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface ErrorBannerProps {
  message: string | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-start gap-2 rounded-md border border-rose-400/20 bg-rose-400/5 px-3 py-2 text-xs text-rose-200"
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
      <p className="flex-1 font-mono leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-rose-200/70 transition hover:text-rose-100"
          aria-label="Cerrar error"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}
