"use client";

import { useEffect, useState } from "react";

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export function TypingText({ text, speed = 14, className }: TypingTextProps) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setShown(0);
    if (!text) return;

    let cancelled = false;
    let i = 0;
    const id = window.setInterval(() => {
      if (cancelled) return;
      i += 1;
      setShown(i);
      if (i >= text.length) window.clearInterval(id);
    }, speed);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [text, speed]);

  return (
    <p className={className} aria-label={text}>
      {text.slice(0, shown)}
    </p>
  );
}
