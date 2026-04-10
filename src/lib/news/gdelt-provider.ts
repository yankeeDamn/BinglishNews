import type { Article } from "@/types";
import type { NewsProvider, FetchOptions } from "./provider";

const GDELT_TIMEOUT_MS = 8_000;
const ROLLING_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Parse GDELT seendate format (YYYYMMDDTHHMMSSZ) to ISO-8601.
 */
function parseSeendate(sd: string): string {
  if (!sd || sd.length < 8) return new Date().toISOString();
  const y = sd.slice(0, 4);
  const m = sd.slice(4, 6);
  const d = sd.slice(6, 8);
  const hh = sd.length >= 11 ? sd.slice(9, 11) : "00";
  const mm = sd.length >= 13 ? sd.slice(11, 13) : "00";
  const ss = sd.length >= 15 ? sd.slice(13, 15) : "00";
  return `${y}-${m}-${d}T${hh}:${mm}:${ss}Z`;
}

interface GdeltRawArticle {
  url?: string;
  title?: string;
  seendate?: string;
  socialimage?: string;
  domain?: string;
  language?: string;
  sourcecountry?: string;
}

export class GdeltProvider implements NewsProvider {
  readonly name = "gdelt";

  async fetch(options: FetchOptions): Promise<Article[]> {
    const {
      query = "world news",
      region,
      page = 1,
      pageSize = 20,
    } = options;

    // Build GDELT query — append region/country filter when requested
    let q = query;
    if (region === "IN") {
      q = "india OR indian";
    }
    if (!q.includes("sourcelang:")) {
      q += " sourcelang:english";
    }

    // GDELT doesn't support real pagination but we can use startdatetime
    // to create a rolling window and request more records then slice.
    const totalToFetch = Math.min(page * pageSize + pageSize, 250);

    const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    url.searchParams.set("query", q);
    url.searchParams.set("mode", "ArtList");
    url.searchParams.set("maxrecords", String(totalToFetch));
    url.searchParams.set("format", "json");
    url.searchParams.set("sourcelang", "eng");
    url.searchParams.set("sort", "DateDesc");

    // Rolling 48-hour window
    const now = new Date();
    const start = new Date(now.getTime() - ROLLING_WINDOW_MS);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:T]/g, "").slice(0, 14);
    url.searchParams.set("startdatetime", fmt(start));
    url.searchParams.set("enddatetime", fmt(now));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GDELT_TIMEOUT_MS);

    try {
      const res = await fetch(url.toString(), { signal: controller.signal });
      if (!res.ok) return [];
      const data = await res.json();
      const raw: GdeltRawArticle[] = data.articles ?? [];

      const mapped: Article[] = raw
        .filter((a) => !a.language || a.language.toLowerCase() === "english")
        .map((a) => ({
          url: a.url ?? "",
          title: (a.title ?? "").trim(),
          summary: "",
          publishedAt: parseSeendate(a.seendate ?? ""),
          imageUrl: a.socialimage ?? "",
          source: a.domain ?? "",
          provider: "gdelt",
          region: a.sourcecountry ?? "",
          category: region === "IN" ? "india" : "world",
        }));

      // Simulate pagination by slicing
      const startIdx = (page - 1) * pageSize;
      return mapped.slice(startIdx, startIdx + pageSize);
    } finally {
      clearTimeout(timeout);
    }
  }
}
