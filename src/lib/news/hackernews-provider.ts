import type { Article } from "@/types";
import type { NewsProvider, FetchOptions } from "./provider";

const HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM_URL = (id: number) =>
  `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
const HN_TIMEOUT_MS = 8_000;

interface HnItem {
  id: number;
  title?: string;
  url?: string;
  time?: number;
  score?: number;
  by?: string;
}

export class HackerNewsProvider implements NewsProvider {
  readonly name = "hackernews";

  async fetch(options: FetchOptions): Promise<Article[]> {
    const { page = 1, pageSize = 20 } = options;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HN_TIMEOUT_MS);

    try {
      const res = await fetch(HN_TOP_URL, { signal: controller.signal });
      if (!res.ok) return [];
      const ids: number[] = await res.json();

      // Select a page-sized window of IDs
      const startIdx = (page - 1) * pageSize;
      const selectedIds = ids.slice(startIdx, startIdx + pageSize);

      const items = await Promise.allSettled(
        selectedIds.map(async (id) => {
          const r = await fetch(HN_ITEM_URL(id), {
            signal: controller.signal,
          });
          if (!r.ok) return null;
          return (await r.json()) as HnItem;
        }),
      );

      const articles: Article[] = [];
      for (const result of items) {
        if (result.status !== "fulfilled" || !result.value) continue;
        const item = result.value;
        if (!item.url) continue; // skip Ask HN, Show HN without URLs

        articles.push({
          url: item.url,
          title: (item.title ?? "").trim(),
          summary: "",
          publishedAt: item.time
            ? new Date(item.time * 1000).toISOString()
            : new Date().toISOString(),
          imageUrl: "",
          source: item.url ? new URL(item.url).hostname : "news.ycombinator.com",
          provider: "hackernews",
          region: "",
          category: "tech",
        });
      }

      return articles;
    } finally {
      clearTimeout(timeout);
    }
  }
}
