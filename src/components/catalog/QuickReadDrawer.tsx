"use client";
import { useEffect, useRef, useState } from "react";
import { articleKey, useBookmarks } from "@/context/BookmarkContext";
import { formatDate, sourceLabel } from "@/lib/format";
import type { Article } from "@/types";

export function readingTime(article: Article) { return Math.max(1, Math.ceil(`${article.title} ${article.summary}`.trim().split(/\s+/).length / 200)); }
export default function QuickReadDrawer({ article, articles, onClose }: { article: Article | null; articles: Article[]; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [size, setSize] = useState(20);
  const { has, toggleArticle } = useBookmarks();
  useEffect(() => { const el = ref.current; if (!el) return; if (article && !el.open) el.showModal(); else if (!article && el.open) el.close(); }, [article]);
  const related = article ? articles.filter((other) => other.url !== article.url && other.category === article.category).slice(0, 3) : [];
  return <dialog ref={ref} onClose={onClose} aria-labelledby="preview-title" className="drawer">
    {article && <><div className="flex items-center justify-between border-b border-line pb-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-accent-text">Quick preview</p><button onClick={onClose} className="drawer-close" aria-label="Close preview">✕</button></div>
      <p className="mt-8 text-xs font-bold uppercase tracking-wider text-muted">{sourceLabel(article.source)} · {formatDate(article.publishedAt)} · {readingTime(article)} min snippet</p>
      <h2 id="preview-title" className="mt-4 font-serif text-4xl leading-tight">{article.title}</h2>
      <div className="mt-6 flex items-center gap-2 text-xs text-muted"><span>Text size</span><button aria-label="Decrease text size" onClick={() => setSize((s) => Math.max(16, s - 2))} className="drawer-close">A−</button><button aria-label="Increase text size" onClick={() => setSize((s) => Math.min(28, s + 2))} className="drawer-close">A+</button></div>
      <p style={{ fontSize: size }} className="mt-6 font-serif leading-relaxed text-ink/80">{article.summary || "A preview is not available for this story. Visit the publisher to read the full article."}</p>
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="mt-8 block rounded-full bg-accent px-5 py-3 text-center text-sm font-bold text-accent-ink">Read full article at {sourceLabel(article.source)} ↗</a>
      <div className="mt-4 flex gap-5 text-sm font-semibold"><button onClick={() => toggleArticle(article)}>{has(articleKey(article)) ? "Remove bookmark" : "Save to bookmarks"}</button><button onClick={() => { if (navigator.share) void navigator.share({ title: article.title, url: article.url }).catch(() => {}); else void navigator.clipboard?.writeText(article.url); }}>Share ↗</button></div>
      {related.length > 0 && <section className="mt-10 border-t border-line pt-6"><h3 className="font-serif text-2xl">Related coverage</h3>{related.map((other) => <a key={other.url} href={other.url} target="_blank" rel="noopener noreferrer" className="block border-b border-line py-4 font-serif text-lg hover:text-accent-text">{other.title} ↗</a>)}</section>}
    </>}
  </dialog>;
}
