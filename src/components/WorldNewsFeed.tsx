"use client";

import { useEffect, useState } from "react";
import type { GdeltArticle } from "@/types";

function formatDate(seendate: string): string {
  if (!seendate || seendate.length < 8) return "";
  // GDELT seendate format: YYYYMMDDTHHMMSSZ — parse as UTC to avoid timezone drift
  const y = +seendate.slice(0, 4);
  const m = +seendate.slice(4, 6);
  const d = +seendate.slice(6, 8);
  const date = new Date(Date.UTC(y, m - 1, d));
  return isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export default function WorldNewsFeed() {
  const [articles, setArticles] = useState<GdeltArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/gdelt?q=world+news&max=12");
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        } else if (!res.ok) {
          setError("Could not load world news. Please try again later.");
        }
      } catch {
        setError("Could not load world news. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-900/10">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="text-center text-slate-500 dark:text-slate-400">
        No world news available right now. Check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, idx) => (
        <a
          key={`${article.url}-${idx}`}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
        >
          {article.socialimage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.socialimage}
              alt={article.title}
              className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600">
              <span className="text-4xl opacity-40">🌐</span>
            </div>
          )}

          <div className="flex flex-1 flex-col p-4">
            <h4 className="mb-3 line-clamp-3 text-sm font-semibold leading-snug text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400">
              {article.title}
            </h4>

            <div className="mt-auto flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="truncate font-medium text-slate-700 dark:text-slate-300">
                  {article.domain}
                </span>
                {article.sourcecountry && (
                  <>
                    <span>·</span>
                    <span>{article.sourcecountry}</span>
                  </>
                )}
              </div>
              {(() => {
                const dateStr = formatDate(article.seendate);
                return dateStr ? <span className="shrink-0">{dateStr}</span> : null;
              })()}
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}
