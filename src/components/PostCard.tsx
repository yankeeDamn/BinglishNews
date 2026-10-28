"use client";
import Link from "next/link";
import { postKey, useBookmarks } from "@/context/BookmarkContext";
import ArticleImage from "@/components/ArticleImage";
import { formatDate } from "@/lib/format";
import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }) {
  const date = formatDate(post.createdAt);
  const { has, togglePost } = useBookmarks();
  return (
    <article className="group relative flex h-full flex-col">
      <div className="overflow-hidden rounded-md">
        <ArticleImage
          src={post.imageUrl}
          label={post.authorName}
          className="aspect-[3/2] w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <span className="font-semibold text-ink/80">{post.authorName}</span>
        {date && (
          <>
            <span aria-hidden="true">/</span>
            <time dateTime={post.createdAt}>{date}</time>
          </>
        )}
      </div>
      <h3 className="mt-2 font-serif text-[22px] font-semibold leading-[1.2] tracking-tight">
        {/* Stretched link: the whole card is clickable, with one tab stop. */}
        <Link href={`/posts/${post.id}`} className="after:absolute after:inset-0">
          <span className="hl">{post.title}</span>
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">
        {post.summary}
      </p>
      <button type="button" onClick={() => togglePost(post)} className="relative z-10 mt-3 self-start text-sm font-semibold text-accent-text">{has(postKey(post)) ? "Saved ✓" : "Save story +"}</button>
    </article>
  );
}
