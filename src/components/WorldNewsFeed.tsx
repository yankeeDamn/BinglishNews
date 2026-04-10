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
          <div key={i} className="skeleton h-64 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/30 bg-red-900/10 p-6 text-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <p className="text-center text-[#888]">
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
          className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414]"
        >
          {article.socialimage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.socialimage}
              alt={article.title}
              className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
              <span className="text-4xl opacity-30">🌐</span>
            </div>
          )}

          <div className="flex flex-1 flex-col p-4">
            <h4 className="mb-3 line-clamp-3 text-sm font-semibold leading-snug text-white group-hover:text-gold transition">
              {article.title}
            </h4>

            <div className="mt-auto flex items-center justify-between gap-2 text-xs text-[#666]">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="truncate font-medium text-[#aaa]">
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
