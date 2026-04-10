import type { Article } from "@/types";

export interface FetchOptions {
  query?: string;
  region?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Common interface for all news data providers.
 */
export interface NewsProvider {
  /** Human-readable name, e.g. "gdelt", "rss", "hackernews" */
  readonly name: string;

  /**
   * Fetch articles from this provider.
   * Implementations should respect the options (especially region/category)
   * and return a normalised Article[].
   */
  fetch(options: FetchOptions): Promise<Article[]>;
}
