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
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="text-[#888]">
        We hit an unexpected problem loading this page. You can try again, or head
        back to the front page.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-gold-light"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[#2a2a2a] px-5 py-2 text-sm font-medium text-[#ccc] transition hover:border-gold/60 hover:text-white"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
