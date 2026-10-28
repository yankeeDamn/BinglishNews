"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * Today's date in the reader's own timezone. Rendered empty on the server so a
 * cached page never shows yesterday's date.
 */
export default function Dateline({ className = "" }: { className?: string }) {
  const text = useSyncExternalStore(
    noop,
    () =>
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    () => "",
  );
  return (
    <time className={className} dateTime={new Date().toISOString().slice(0, 10)} suppressHydrationWarning>
      {text}
    </time>
  );
}
