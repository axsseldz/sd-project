"use client";

interface ErrorBannerProps {
  message: string | null;
}

export function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <div className="mt-4 rounded-md border border-white/10 bg-zinc-900/40 px-3 py-2 font-mono text-xs text-zinc-400">
      {message}
    </div>
  );
}
