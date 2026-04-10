import type { Article, NewsResponse } from "@/types";
import type { NewsProvider, FetchOptions } from "./provider";
import { GdeltProvider } from "./gdelt-provider";
import { RssProvider } from "./rss-provider";
import { HackerNewsProvider } from "./hackernews-provider";

/* ------------------------------------------------------------------ */
/*  De-duplication                                                     */
/* ------------------------------------------------------------------ */

/** Titles shorter than this are too generic for reliable dedup by title alone */
const MIN_TITLE_LENGTH_FOR_DEDUP = 10;

function normaliseTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function deduplicateArticles(articles: Article[]): Article[] {
  const seenUrls = new Set<string>();
  const seenTitles = new Set<string>();
  const result: Article[] = [];

  for (const article of articles) {
    if (!article.url && !article.title) continue;

    const url = article.url.split("?")[0].split("#")[0]; // strip query/hash
    if (url && seenUrls.has(url)) continue;

    const normTitle = normaliseTitle(article.title);
    if (normTitle && normTitle.length > MIN_TITLE_LENGTH_FOR_DEDUP && seenTitles.has(normTitle)) continue;

    if (url) seenUrls.add(url);
    if (normTitle && normTitle.length > MIN_TITLE_LENGTH_FOR_DEDUP) seenTitles.add(normTitle);
    result.push(article);
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Retry helper                                                       */
/* ------------------------------------------------------------------ */

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 1,
  delayMs = 500,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}

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

  // Choose which providers to query
  let activeProviders = providers;
  if (region === "IN" || category === "india") {
    // For India, prefer GDELT + RSS; skip HackerNews
    activeProviders = providers.filter((p) => p.name !== "hackernews");
  }

  // Fetch from all active providers with retry + fallback
  const allArticles: Article[] = [];
  const settledResults = await Promise.allSettled(
    activeProviders.map((provider) =>
      withRetry(() => provider.fetch({ ...options, page, pageSize }), 1, 400),
    ),
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

  // De-duplicate
  const deduped = deduplicateArticles(allArticles);

  // Filter by region/category if specified
  const MIN_FILTERED_RESULTS = 3;
  let filtered = deduped;
  if (region === "IN" || category === "india") {
    filtered = deduped.filter(
      (a) =>
        a.category === "india" ||
        a.region === "IN" ||
        (a.region && a.region.toLowerCase().includes("india")),
    );
    // If region filtering produces fewer than MIN_FILTERED_RESULTS articles,
    // fall back to showing all results rather than an empty/near-empty page.
    if (filtered.length < MIN_FILTERED_RESULTS) {
      filtered = deduped;
    }
  }

  // Sort by publishedAt desc (newest first)
  filtered.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  // Paginate the merged results
  const startIdx = (page - 1) * pageSize;
  const paginated = filtered.slice(startIdx, startIdx + pageSize);

  return {
    articles: paginated,
    page,
    pageSize,
    total: filtered.length,
    fetchedAt: new Date().toISOString(),
  };
}
