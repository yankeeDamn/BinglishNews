"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ArticleImage from "@/components/ArticleImage";
import { sourceLabel, timeAgo, formatDate } from "@/lib/format";
import type { Article } from "@/types";

type Category = "all" | "world" | "india" | "tech";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "world", label: "World" },
  { key: "india", label: "India" },
  { key: "tech", label: "Tech" },
];

function SkeletonGrid() {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <div className="skeleton aspect-[3/2] rounded-md" />
          <div className="skeleton mt-4 h-3 w-1/3 rounded" />
          <div className="skeleton mt-3 h-5 w-full rounded" />
          <div className="skeleton mt-2 h-5 w-4/5 rounded" />
        </div>
      ))}
    </div>
  );
}

export default function NewsFeed({
  initialCategory = "all",
  id,
  title,
  showTabs = true,
}: {
  initialCategory?: Category;
  id?: string;
  title: string;
  /** Hide the category tabs when the feed is pinned to one category. */
  showTabs?: boolean;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const pageSize = 12;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // One controller per request: switching tab/page cancels the previous
    // request so a slow stale response can't overwrite the current results.
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });
        if (category === "india") {
          params.set("region", "IN");
          params.set("category", "india");
        } else if (category !== "all") {
          params.set("category", category);
        }
        if (search) params.set("q", search);

        const res = await fetch(`/api/news?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`News request failed (${res.status})`);
        const data = await res.json();
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setTotal(data.total ?? 0);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        console.error(err);
        setError("We couldn't load the latest stories.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();

    return () => controller.abort();
  }, [category, page, search, reloadKey]);

  const retry = useCallback(() => setReloadKey((k) => k + 1), []);

  const scrollToTop = () =>
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setPage(1);
  };

  const changePage = (next: number) => {
    setPage(next);
    scrollToTop();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim().slice(0, 100));
  };

  const hasNextPage = page * pageSize < total;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section ref={sectionRef} id={id} className="scroll-mt-20" aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <h2 id={id ? `${id}-title` : undefined} className="font-serif text-3xl font-semibold tracking-tight">
            {title}
          </h2>
          {showTabs && (
            <div role="group" aria-label="Filter by topic" className="flex gap-5">
              {CATEGORIES.map((cat) => {
                const active = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryChange(cat.key)}
                    aria-pressed={active}
                    className={`relative pb-1 text-sm font-medium transition-colors ${
                      active ? "text-ink" : "text-muted hover:text-ink"
                    }`}
                  >
                    {cat.label}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-[17px] left-0 h-[3px] w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out ${
                        active ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSearch} role="search" className="relative w-full sm:w-64">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            type="search"
            aria-label={`Search ${title}`}
            placeholder="Search stories"
            maxLength={100}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-full border border-transparent bg-sunken py-2 pl-9 pr-4 text-sm text-ink placeholder-muted outline-none transition focus:border-accent focus:bg-paper"
          />
        </form>
      </div>

      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-8 text-center">
          <p className="font-medium text-danger">{error}</p>
          <p className="mt-1 text-sm text-muted">Check your connection, then try again.</p>
          <button
            onClick={retry}
            className="mt-4 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:opacity-85 active:scale-[0.97]"
          >
            Try again
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl bg-surface p-10 text-center">
          <p className="font-serif text-xl">No stories match that search.</p>
          <p className="mt-1 text-sm text-muted">Try a different word, or switch topic.</p>
        </div>
      ) : (
        <>
          <ul className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, idx) => (
              <li
                key={`${article.url}-${idx}`}
                className="swap-in"
                style={{ "--i": idx } as React.CSSProperties}
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col"
                >
                  <div className="overflow-hidden rounded-md">
                    <ArticleImage
                      src={article.imageUrl}
                      label={sourceLabel(article.source)}
                      className="aspect-[3/2] w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                    <span className="font-semibold text-ink/80">{sourceLabel(article.source)}</span>
                    {timeAgo(article.publishedAt) && (
                      <>
                        <span aria-hidden="true">/</span>
                        <time dateTime={article.publishedAt} title={formatDate(article.publishedAt)}>
                          {timeAgo(article.publishedAt)}
                        </time>
                      </>
                    )}
                  </div>
                  <h3 className="mt-2 font-serif text-[22px] font-semibold leading-[1.2] tracking-tight">
                    <span className="hl">{article.title}</span>
                  </h3>
                  {article.summary && (
                    <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">
                      {article.summary}
                    </p>
                  )}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-5 border-t border-line pt-6">
              <button
                disabled={page <= 1}
                onClick={() => changePage(Math.max(1, page - 1))}
                className="rounded-full border border-line px-5 py-2 text-sm font-medium transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line"
              >
                Previous
              </button>
              <span className="text-sm text-muted" aria-live="polite">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={!hasNextPage}
                onClick={() => changePage(page + 1)}
                className="rounded-full border border-line px-5 py-2 text-sm font-medium transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
