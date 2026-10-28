/** "Just now", "12m ago", "3h ago", "2d ago", then a short date. */
export function timeAgo(iso: string | undefined | null, now = Date.now()): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  if (isNaN(t)) return "";
  const mins = Math.round((now - t) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
}

/** "bbc.co.uk" -> "BBC"; falls back to the bare domain without "www.". */
export function sourceLabel(source: string): string {
  const host = source.replace(/^www\./, "");
  const known: Record<string, string> = {
    "bbc.co.uk": "BBC",
    "bbc.com": "BBC",
    "nytimes.com": "The New York Times",
    "reuters.com": "Reuters",
    "thehindu.com": "The Hindu",
    "timesofindia.indiatimes.com": "Times of India",
    "news.ycombinator.com": "Hacker News",
  };
  return known[host] ?? host;
}

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
