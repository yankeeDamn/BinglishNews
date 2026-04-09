import { NextResponse } from "next/server";
import type { GdeltArticle } from "@/types";

interface CacheEntry {
  data: GdeltArticle[];
  timestamp: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const GDELT_REQUEST_TIMEOUT_MS = 8000;
let cache: CacheEntry | null = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get("q") || "world news";
  const mode = searchParams.get("mode") || "ArtList";
  const maxRecords = searchParams.get("max") || "20";
  const format = "json";

  // Return cached data if still fresh and same default query
  if (
    cache &&
    Date.now() - cache.timestamp < CACHE_TTL_MS &&
    queryParam === "world news"
  ) {
    return NextResponse.json(
      { articles: cache.data, fetchedAt: new Date(cache.timestamp).toISOString(), cached: true },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
        },
      },
    );
  }

  try {
    const gdeltUrl = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
    // Ensure results are in English by appending sourcelang filter in query
    const queryWithLang = queryParam.includes("sourcelang:")
      ? queryParam
      : `${queryParam} sourcelang:english`;
    gdeltUrl.searchParams.set("query", queryWithLang);
    gdeltUrl.searchParams.set("mode", mode);
    gdeltUrl.searchParams.set("maxrecords", maxRecords);
    gdeltUrl.searchParams.set("format", format);
    // Additional sourcelang URL parameter for extra filtering certainty
    gdeltUrl.searchParams.set("sourcelang", "eng");

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      GDELT_REQUEST_TIMEOUT_MS,
    );

    let res: Response;
    try {
      res = await fetch(gdeltUrl.toString(), {
        next: { revalidate: 900 },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from GDELT", status: res.status },
        { status: 502 },
      );
    }

    const data = await res.json();

    interface GdeltRawArticle {
      url?: string;
      title?: string;
      seendate?: string;
      socialimage?: string;
      domain?: string;
      language?: string;
      sourcecountry?: string;
    }

    const articles: GdeltArticle[] = ((data.articles ?? []) as GdeltRawArticle[])
      .filter((a) => !a.language || a.language.toLowerCase() === "english")
      .map(
        (a) => ({
          url: a.url ?? "",
          title: a.title ?? "",
          seendate: a.seendate ?? "",
          socialimage: a.socialimage ?? "",
          domain: a.domain ?? "",
          language: a.language ?? "",
          sourcecountry: a.sourcecountry ?? "",
        }),
      );

    // Update in-memory cache for default query
    if (queryParam === "world news") {
      cache = { data: articles, timestamp: Date.now() };
    }

    return NextResponse.json(
      { articles, fetchedAt: new Date().toISOString(), cached: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
        },
      },
    );
  } catch (error) {
    console.error("GDELT fetch error:", error);
    const isTimeout =
      error instanceof DOMException && error.name === "AbortError";
    return NextResponse.json(
      {
        error: isTimeout
          ? "GDELT request timed out"
          : "Internal error fetching GDELT data",
        articles: [],
      },
      { status: isTimeout ? 504 : 500 },
    );
  }
}
