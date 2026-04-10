import type { Article } from "@/types";
import type { NewsProvider, FetchOptions } from "./provider";
import RssParser from "rss-parser";

const parser = new RssParser({
  timeout: 8_000,
  headers: {
    "User-Agent": "BinglishNews/1.0",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

interface FeedConfig {
  url: string;
  category: string;
  region: string;
}

/** World-wide English RSS feeds */
const WORLD_FEEDS: FeedConfig[] = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "world", region: "" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", category: "world", region: "" },
  { url: "https://feeds.reuters.com/reuters/topNews", category: "world", region: "" },
];

/** India-focused RSS feeds */
const INDIA_FEEDS: FeedConfig[] = [
  { url: "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml", category: "india", region: "IN" },
  { url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms", category: "india", region: "IN" },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", category: "india", region: "IN" },
];

async function parseFeed(feed: FeedConfig): Promise<Article[]> {
  try {
    const result = await parser.parseURL(feed.url);
    return (result.items ?? []).map((item) => ({
      url: item.link ?? "",
      title: (item.title ?? "").trim(),
      summary: (item.contentSnippet ?? item.content ?? "").slice(0, 300).trim(),
      publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
      imageUrl:
        item.enclosure?.url ??
        (item["media:content"] as { $?: { url?: string } } | undefined)?.$?.url ??
        "",
      source: new URL(feed.url).hostname.replace("feeds.", "").replace("rss.", ""),
      provider: "rss",
      region: feed.region,
      category: feed.category,
    }));
  } catch (err) {
    console.error(`RSS fetch failed for ${feed.url}:`, err);
    return [];
  }
}

export class RssProvider implements NewsProvider {
  readonly name = "rss";

  async fetch(options: FetchOptions): Promise<Article[]> {
    const { region, page = 1, pageSize = 20 } = options;

    const feeds = region === "IN" ? INDIA_FEEDS : WORLD_FEEDS;

    const results = await Promise.allSettled(feeds.map(parseFeed));
    const articles: Article[] = [];

    for (const r of results) {
      if (r.status === "fulfilled") {
        articles.push(...r.value);
      }
    }

    // Sort newest first
    articles.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    // Paginate
    const startIdx = (page - 1) * pageSize;
    return articles.slice(startIdx, startIdx + pageSize);
  }
}
