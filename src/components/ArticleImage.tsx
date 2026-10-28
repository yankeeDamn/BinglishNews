"use client";

import { useState } from "react";

/**
 * Remote article image with a typographic fallback, so a missing or broken
 * image never leaves a hole in the layout.
 */
export default function ArticleImage({
  src,
  label,
  className = "",
  fallbackClassName = "text-2xl",
  priority = false,
}: {
  src?: string | null;
  /** Shown in the fallback (usually the source name). */
  label: string;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={label}
        className={`flex items-center justify-center bg-gradient-to-br from-sunken to-line/60 p-4 text-center font-serif italic text-muted/80 ${fallbackClassName} ${className}`}
      >
        {label}
      </div>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`bg-sunken object-cover ${className}`}
    />
  );
}
