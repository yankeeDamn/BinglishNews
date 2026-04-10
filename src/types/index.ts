export type PostStatus = "pending" | "published" | "rejected";

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string | null;
  authorId: string;
  authorName: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Unified Article DTO (used by all news providers)                  */
/* ------------------------------------------------------------------ */

export interface Article {
  /** Unique URL of the article (used for dedup) */
  url: string;
  title: string;
  /** Short description / summary */
  summary: string;
  /** ISO-8601 published date */
  publishedAt: string;
  /** Thumbnail / social image URL */
  imageUrl: string;
  /** Source domain (e.g. "bbc.com") */
  source: string;
  /** Provider that supplied this article (e.g. "gdelt", "rss", "hackernews") */
  provider: string;
  /** Two-letter country code when available */
  region: string;
  /** Category tag (e.g. "world", "india", "tech") */
  category: string;
}

export interface NewsResponse {
  articles: Article[];
  page: number;
  pageSize: number;
  total: number;
  fetchedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Legacy GDELT types (kept for backward compat of /api/gdelt)       */
/* ------------------------------------------------------------------ */

export interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

export interface GdeltResponse {
  articles: GdeltArticle[];
  fetchedAt: string;
}
