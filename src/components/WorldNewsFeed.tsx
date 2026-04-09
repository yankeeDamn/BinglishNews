"use client";

import { useEffect, useState } from "react";
import type { GdeltArticle } from "@/types";

export default function WorldNewsFeed() {
  const [articles, setArticles] = useState<GdeltArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/gdelt?q=world+news&max=12");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setArticles(data.articles ?? []);
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-56 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  if (articles.length === 0) {
    return (
      <p className="text-center text-zinc-500">No world news available.</p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, idx) => (
        <a
          key={`${article.url}-${idx}`}
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          {article.socialimage && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={article.socialimage}
              alt={article.title}
              className="mb-3 h-36 w-full rounded-lg object-cover"
            />
          )}
          <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white">
            {article.title}
          </h4>
          <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
            <span>{article.domain}</span>
            <span>{article.sourcecountry}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
