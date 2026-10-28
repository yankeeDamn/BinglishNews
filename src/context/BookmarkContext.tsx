"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Article, Post } from "@/types";

export type Bookmark = { key: string; title: string; url: string; source: string; savedAt: number };
type BookmarkContextValue = { bookmarks: Bookmark[]; toggleArticle: (article: Article) => void; togglePost: (post: Post) => void; remove: (key: string) => void; has: (key: string) => boolean };
const BookmarkContext = createContext<BookmarkContextValue | null>(null);
const STORAGE_KEY = "binglish_bookmarks";
export const articleKey = (article: Article) => `article:${article.url}`;
export const postKey = (post: Post) => `post:${post.id}`;

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(parsed)) setBookmarks(parsed.filter((item): item is Bookmark => item && typeof item.key === "string" && typeof item.title === "string" && typeof item.url === "string" && typeof item.source === "string" && typeof item.savedAt === "number"));
    } catch { /* Storage can be blocked or contain invalid data. */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks)); } catch { /* Keep the list available for this session. */ } } }, [bookmarks, ready]);
  const toggle = useCallback((bookmark: Bookmark) => setBookmarks((items) => items.some((item) => item.key === bookmark.key) ? items.filter((item) => item.key !== bookmark.key) : [bookmark, ...items]), []);
  const remove = useCallback((key: string) => setBookmarks((items) => items.filter((item) => item.key !== key)), []);
  return <BookmarkContext.Provider value={{ bookmarks, toggleArticle: (a) => toggle({ key: articleKey(a), title: a.title, url: a.url, source: a.source, savedAt: Date.now() }), togglePost: (p) => toggle({ key: postKey(p), title: p.title, url: `/posts/${p.id}`, source: p.authorName, savedAt: Date.now() }), remove, has: (key) => bookmarks.some((item) => item.key === key) }}>{children}</BookmarkContext.Provider>;
}
export function useBookmarks() { const value = useContext(BookmarkContext); if (!value) throw new Error("BookmarkProvider is missing"); return value; }
