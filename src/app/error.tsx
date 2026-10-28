"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">This page didn&apos;t load</h1>
      <p className="text-muted">
        Something broke on our side. Try again, or go back to the front page.
      </p>
      <div className="mt-2 flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-hover active:scale-[0.97]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-2 text-sm font-medium transition hover:border-ink"
        >
          Front page
        </Link>
      </div>
    </div>
  );
}
