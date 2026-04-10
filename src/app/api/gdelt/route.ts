import { NextResponse } from "next/server";
import type { GdeltArticle } from "@/types";

const GDELT_REQUEST_TIMEOUT_MS = 8000;
const MAX_RECORDS_LIMIT = 250;
const ALLOWED_MODES = new Set(["ArtList", "TimelineVol", "TimelineVolNorm", "TimelineTone", "TimelineSourceCountry"]);

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get("q") || "world news";
  const mode = searchParams.get("mode") || "ArtList";
  const maxRecordsRaw = parseInt(searchParams.get("max") || "20", 10);
  const maxRecords = String(Math.min(Math.max(1, isNaN(maxRecordsRaw) ? 20 : maxRecordsRaw), MAX_RECORDS_LIMIT));
  const format = "json";

  // Validate mode parameter
  if (!ALLOWED_MODES.has(mode)) {
    return NextResponse.json(
      { error: `Invalid mode. Allowed: ${[...ALLOWED_MODES].join(", ")}` },
      { status: 400 },
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
    gdeltUrl.searchParams.set("sourcelang", "eng");
    gdeltUrl.searchParams.set("sort", "DateDesc");

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      GDELT_REQUEST_TIMEOUT_MS,
    );

    let res: Response;
    try {
      res = await fetch(gdeltUrl.toString(), {
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

    return NextResponse.json(
      { articles, fetchedAt: new Date().toISOString(), cached: false },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
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
