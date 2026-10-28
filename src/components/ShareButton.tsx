"use client";

import { useState } from "react";

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Share sheet dismissed or clipboard blocked: nothing to recover.
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm font-medium transition hover:border-ink active:scale-[0.97]"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" />
      </svg>
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}
