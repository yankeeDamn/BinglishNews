import { NextResponse } from "next/server";
import { fetchAggregatedNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10) || 20),
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
