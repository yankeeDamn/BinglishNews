import { NextResponse } from "next/server";
import { fetchAggregatedNews } from "@/lib/news";

export const dynamic = "force-dynamic";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE),
  );
  const region = searchParams.get("region")?.toUpperCase() ?? undefined;
  const category = searchParams.get("category")?.toLowerCase() ?? undefined;
  const query = searchParams.get("q") ?? undefined;

  try {
    const result = await fetchAggregatedNews({
      page,
      pageSize,
      region,
      category,
      query,
    });

    return NextResponse.json(result, {
      headers: {
        // Cache for 5 minutes (s-maxage), serve stale for 1 minute while revalidating
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("News aggregation error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch news",
        articles: [],
        page,
        pageSize,
        total: 0,
        fetchedAt: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
