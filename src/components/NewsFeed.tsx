"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import ArticleImage from "@/components/ArticleImage";
import CatalogFilterBar, { type SortOrder, type TimeRange } from "@/components/catalog/CatalogFilterBar";
import ViewModeToggle, { type ViewMode } from "@/components/catalog/ViewModeToggle";
import QuickReadDrawer, { readingTime } from "@/components/catalog/QuickReadDrawer";
import { articleKey, useBookmarks } from "@/context/BookmarkContext";
import { sourceLabel, timeAgo } from "@/lib/format";
import type { Article } from "@/types";

type Category = "all" | "world" | "india" | "tech";
const CATEGORIES: { key: Category; label: string }[] = [{ key: "all", label: "All stories" }, { key: "world", label: "World" }, { key: "india", label: "India" }, { key: "tech", label: "Tech & AI" }];
function interleave(items: Article[]) { const groups = new Map<string, Article[]>(); for (const item of items) { const key = item.source || item.provider; groups.set(key, [...(groups.get(key) || []), item]); } const result: Article[] = []; while (Array.from(groups.values()).some((g) => g.length)) for (const group of groups.values()) { const next = group.shift(); if (next) result.push(next); } return result; }

export default function NewsFeed({ initialCategory = "all", id, title, showTabs = true }: { initialCategory?: Category; id?: string; title: string; showTabs?: boolean }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<Category>(initialCategory);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reload, setReload] = useState(0);
  const [view, setView] = useState<ViewMode>("grid");
  const [source, setSource] = useState("");
  const [range, setRange] = useState<TimeRange>("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [preview, setPreview] = useState<Article | null>(null);
  const section = useRef<HTMLElement>(null);
  const { has, toggleArticle } = useBookmarks();
  const pageSize = 12;
  useEffect(() => { try { const saved = localStorage.getItem("binglish_view_mode"); if (saved === "grid" || saved === "compact" || saved === "bento") setView(saved); } catch { /* Use the default. */ } }, []);
  function changeView(next: ViewMode) { setView(next); try { localStorage.setItem("binglish_view_mode", next); } catch { /* The current session still works. */ } }
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (category === "india") { params.set("region", "IN"); params.set("category", "india"); } else if (category !== "all") params.set("category", category);
        if (search) params.set("q", search);
        const response = await fetch(`/api/news?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("News request failed");
        const data = await response.json();
        setArticles(Array.isArray(data.articles) ? data.articles : []); setTotal(data.total ?? 0);
      } catch (err) { if ((err as Error).name !== "AbortError") setError("We couldn't load the latest stories."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [category, page, search, reload]);
  const visible = useMemo(() => {
    const now = Date.now();
    const filtered = articles.filter((a) => (!source || a.source === source) && (range === "all" || (Number.isFinite(Date.parse(a.publishedAt)) && now - Date.parse(a.publishedAt) <= (range === "breaking" ? 3 : 24) * 3600000)));
    if (sort === "diverse") return interleave(filtered);
    if (sort === "quick") return [...filtered].sort((a,b) => a.summary.length - b.summary.length);
    return [...filtered].sort((a,b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }, [articles, source, range, sort]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  function submitSearch(e: FormEvent) { e.preventDefault(); setPage(1); setSource(""); setSearch(searchInput.trim().slice(0, 100)); }
  function clear() { setSource(""); setRange("all"); setSort("newest"); setSearchInput(""); setSearch(""); setPage(1); }
  return <section ref={section} id={id} className="scroll-mt-24" aria-labelledby={id ? `${id}-title` : undefined}>
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-accent-text">The latest briefing</p><h2 id={id ? `${id}-title` : undefined} className="font-serif text-4xl font-semibold tracking-tight">{title}</h2></div><ViewModeToggle mode={view} onChange={changeView} /></div>
    {showTabs && <div role="group" aria-label="Filter by topic" className="mb-5 flex gap-2 overflow-x-auto pb-1">{CATEGORIES.map((cat) => <button key={cat.key} onClick={() => { setCategory(cat.key); setPage(1); setSource(""); }} aria-pressed={category === cat.key} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${category === cat.key ? "bg-accent text-accent-ink" : "bg-surface text-muted hover:text-ink"}`}>{cat.label}</button>)}</div>}
    <form onSubmit={submitSearch} role="search" className="mb-5 flex gap-2"><input type="search" aria-label={`Search ${title}`} placeholder="Search headlines and topics" maxLength={100} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-accent" /><button className="rounded-full bg-ink px-5 py-3 text-sm font-bold text-paper">Search</button></form>
    {!loading && !error && <CatalogFilterBar articles={articles} source={source} setSource={setSource} range={range} setRange={setRange} sort={sort} setSort={setSort} count={visible.length} search={search} clear={clear} />}
    {loading ? <div aria-label="Loading stories" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_,i) => <div key={i} className="skeleton h-64 rounded-xl" />)}</div> : error ? <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-8 text-center"><p className="text-danger">{error}</p><button onClick={() => setReload((v) => v + 1)} className="mt-4 rounded-full bg-ink px-5 py-2 text-paper">Try again</button></div> : visible.length === 0 ? <div className="rounded-xl bg-surface p-10 text-center"><p className="font-serif text-xl">No stories match these filters.</p><button onClick={clear} className="mt-3 text-sm font-bold text-accent-text underline">Clear filters</button></div> : <ul className={view === "compact" ? "divide-y divide-line border-t border-line" : `grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${view === "bento" ? "digest-grid" : ""}`}>
      {visible.map((article, index) => <li key={`${article.url}-${index}`} className={view === "compact" ? "py-5" : `overflow-hidden rounded-xl border border-line bg-surface ${view === "bento" && index === 0 ? "digest-lead" : ""}`}><article className={view === "compact" ? "flex flex-wrap items-start justify-between gap-3" : "flex h-full flex-col"}>
        {view !== "compact" && <a href={article.url} target="_blank" rel="noopener noreferrer" className="group overflow-hidden"><ArticleImage src={article.imageUrl} label={sourceLabel(article.source)} className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.03]" /></a>}
        <div className={view === "compact" ? "min-w-0 flex-1" : "flex flex-1 flex-col p-5"}><div className="flex flex-wrap items-center gap-2 text-xs text-muted"><span className="rounded-full bg-sunken px-2 py-1 font-bold text-ink">{sourceLabel(article.source)}</span><span>{timeAgo(article.publishedAt)}</span><span>· {readingTime(article)} min snippet</span></div>
          <h3 className={`mt-3 font-serif font-semibold leading-tight ${view === "bento" && index === 0 ? "text-3xl" : "text-xl"}`}><a href={article.url} target="_blank" rel="noopener noreferrer" className="hl">{article.title}</a></h3>
          {view !== "compact" && article.summary && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{article.summary}</p>}
          <div className="mt-5 flex flex-wrap gap-4 text-xs font-bold"><button onClick={() => setPreview(article)} className="text-accent-text">Quick preview →</button><button onClick={() => toggleArticle(article)} aria-pressed={has(articleKey(article))} className="text-muted hover:text-ink">{has(articleKey(article)) ? "Saved ✓" : "Save +"}</button></div></div>
      </article></li>)}
    </ul>}
    {!loading && !error && totalPages > 1 && <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4 border-t border-line pt-6"><button disabled={page <= 1} onClick={() => { setPage(page - 1); setSource(""); section.current?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40">Previous</button><span className="text-sm text-muted">Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => { setPage(page + 1); setSource(""); section.current?.scrollIntoView({ behavior: "smooth" }); }} className="rounded-full border border-line px-4 py-2 text-sm disabled:opacity-40">Next</button></nav>}
    <QuickReadDrawer article={preview} articles={articles} onClose={() => setPreview(null)} />
  </section>;
}
