import { sourceLabel, timeAgo } from "@/lib/format";
import type { Article } from "@/types";

/**
 * Scrolling strip of the newest headlines. Pauses on hover/focus, and becomes
 * a plain scrollable row for readers who prefer reduced motion.
 */
export default function Ticker({ articles }: { articles: Article[] }) {
  if (articles.length < 3) return null;

  const items = articles.slice(0, 10);
  // ~7s per headline keeps the pace readable.
  const duration = Math.max(40, items.length * 7);

  const list = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((a) => (
        <li key={a.url} className="shrink-0">
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={hidden ? -1 : undefined}
            className="group flex items-center gap-2 px-5 py-2.5 text-sm text-ink/90 transition hover:text-ink"
          >
            <span className="text-xs font-medium text-muted">
              {sourceLabel(a.source)}
            </span>
            <span className="hl">{a.title}</span>
            <span className="text-xs text-muted">{timeAgo(a.publishedAt)}</span>
          </a>
          <span className="sr-only">.</span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Latest headlines"
      className="border-y border-line bg-surface"
    >
      <div className="mx-auto flex max-w-6xl items-stretch">
        <div className="z-10 flex shrink-0 items-center gap-2 border-r border-line bg-surface px-4 text-sm font-semibold text-ink">
          <span className="live-dot h-2 w-2 rounded-full bg-breaking" aria-hidden="true" />
          Live
        </div>
        <div className="marquee relative min-w-0 flex-1 overflow-hidden">
          <div
            className="marquee-track"
            style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
          >
            {list(false)}
            {list(true)}
          </div>
        </div>
      </div>
    </section>
  );
}
