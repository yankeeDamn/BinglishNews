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
