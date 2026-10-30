import type { Article, NewsResponse } from "@/types";
import type { NewsProvider, FetchOptions } from "./provider";
import { GdeltProvider } from "./gdelt-provider";
import { RssProvider } from "./rss-provider";
import { HackerNewsProvider } from "./hackernews-provider";

import { selectNews } from "./results.mjs";

/* ------------------------------------------------------------------ */
/*  Provider registry                                                  */
/* ------------------------------------------------------------------ */

const providers: NewsProvider[] = [
  new GdeltProvider(),
  new RssProvider(),
  new HackerNewsProvider(),
];

/* ------------------------------------------------------------------ */
/*  Aggregator                                                         */
/* ------------------------------------------------------------------ */

export async function fetchAggregatedNews(
  options: FetchOptions & { page?: number; pageSize?: number },
): Promise<NewsResponse> {
  const { page = 1, pageSize = 20, region, category } = options;

  // Fetch a bounded, common first window from each provider, then paginate once.
  // The reported total is the size of this snapshot, not a global news count.
  const snapshotSize = 60;

  // Choose which providers to query
  let activeProviders = providers;
  if (region === "IN" || category === "india") {
    // For India, prefer GDELT + RSS; skip HackerNews
    activeProviders = providers.filter((p) => p.name !== "hackernews");
  }

  // Bound each upstream independently so one slow provider cannot hide others.
  const allArticles: Article[] = [];
  const settledResults = await Promise.allSettled(
    activeProviders.map(async (provider) => {
      const controller = new AbortController();
      const abort = () => controller.abort();
      options.signal?.addEventListener("abort", abort, { once: true });
      if (options.signal?.aborted) controller.abort();
      const timeout = setTimeout(abort, provider.name === "gdelt" ? 3500 : 4000);
      try {
        return await provider.fetch({ ...options, page: 1, pageSize: snapshotSize, signal: controller.signal });
      } finally {
        clearTimeout(timeout);
        options.signal?.removeEventListener("abort", abort);
      }
    }),
  );

  for (let i = 0; i < settledResults.length; i++) {
    const result = settledResults[i];
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    } else {
      console.error(
        `Provider "${activeProviders[i].name}" failed:`,
        result.reason,
      );
    }
  }

  const { articles: paginated, total } = selectNews(allArticles, { page, pageSize, region, category, query: options.query });

  return {
    articles: paginated,
    page,
    pageSize,
    total,
    fetchedAt: new Date().toISOString(),
  };
}
