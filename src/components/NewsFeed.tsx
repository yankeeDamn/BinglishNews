"use client";

import { useEffect, useState, useCallback } from "react";
import type { Article } from "@/types";

type Category = "all" | "world" | "india" | "tech";

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "all", label: "All News", emoji: "📰" },
  { key: "world", label: "World", emoji: "🌍" },
  { key: "india", label: "India", emoji: "🇮🇳" },
  { key: "tech", label: "Tech", emoji: "💻" },
];

function formatDate(iso: string): string {
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

function SkeletonGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton h-72 rounded-2xl" />
      ))}
    </div>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const colors: Record<string, string> = {
    gdelt: "bg-blue-900/40 text-blue-300",
    rss: "bg-emerald-900/40 text-emerald-300",
    hackernews: "bg-orange-900/40 text-orange-300",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${colors[provider] ?? "bg-[#2a2a2a] text-[#888]"}`}
    >
      {provider.toUpperCase()}
    </span>
  );
}

export default function NewsFeed({
  initialCategory = "all",
  id,
}: {
  initialCategory?: Category;
  id?: string;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<Category>(initialCategory);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 12;

  const fetchNews = useCallback(async () => {
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
      } else if (category === "tech") {
        params.set("category", "tech");
      } else if (category === "world") {
        params.set("category", "world");
      }
      if (search.trim()) {
        params.set("q", search.trim());
      }
      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) {
        setError("Could not load news. Please try again later.");
        return;
      }
      const data = await res.json();
      if (data.articles && data.articles.length > 0) {
        setArticles(data.articles);
        setTotal(data.total ?? 0);
      } else {
        setArticles([]);
        setTotal(0);
      }
    } catch {
      setError("Could not load news. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [category, page, search]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  const hasNextPage = page * pageSize < total;

  return (
    <section id={id} className="space-y-6">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === cat.key
                ? "bg-gold text-black shadow-md"
                : "bg-[#1a1a1a] text-[#ccc] hover:bg-[#2a2a2a] hover:text-white"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="search"
          placeholder="Search news..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-2.5 text-sm text-white placeholder-[#666] outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
        />
        <button
          type="submit"
          className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gold-light"
        >
          Search
        </button>
      </form>

      {/* Content */}
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="rounded-2xl border border-red-900/30 bg-red-900/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchNews}
            className="mt-3 rounded-lg bg-red-900/30 px-4 py-1.5 text-sm text-red-300 hover:bg-red-900/50"
          >
            Retry
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-10 text-center">
          <p className="text-[#888]">No articles found. Try a different search or category.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, idx) => (
              <a
                key={`${article.url}-${idx}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414]"
              >
                {article.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
                    <span className="text-4xl opacity-30">📰</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <h4 className="mb-3 line-clamp-3 text-sm font-semibold leading-snug text-white group-hover:text-gold transition">
                    {article.title}
                  </h4>
                  {article.summary && (
                    <p className="mb-3 line-clamp-2 text-xs text-[#888]">
                      {article.summary}
                    </p>
                  )}
                  <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-[#666]">
                    <span className="truncate font-medium text-[#aaa]">
                      {article.source}
                    </span>
                    <ProviderBadge provider={article.provider} />
                    {article.publishedAt && (
                      <span className="ml-auto shrink-0">
                        {formatDate(article.publishedAt)}
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-[#ccc] transition hover:bg-[#2a2a2a] hover:text-white disabled:opacity-30 disabled:hover:bg-[#1a1a1a]"
            >
              ← Previous
            </button>
            <span className="text-sm text-[#888]">
              Page {page}
            </span>
            <button
              disabled={!hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-medium text-[#ccc] transition hover:bg-[#2a2a2a] hover:text-white disabled:opacity-30 disabled:hover:bg-[#1a1a1a]"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
