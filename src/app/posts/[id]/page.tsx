"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPostById } from "@/lib/firestore";
import type { Post } from "@/types";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params.id) return;
      const p = await getPostById(params.id);
      setPost(p);
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="h-8 w-2/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-4 h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full animate-pulse rounded bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!post || post.status !== "published") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Post not found or not yet published.</p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {post.imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.imageUrl}
          alt={post.title}
          className="mb-6 h-72 w-full rounded-xl object-cover"
        />
      )}
      <h1 className="mb-3 text-3xl font-bold text-zinc-900 dark:text-white">
        {post.title}
      </h1>
      <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
        <span>By {post.authorName}</span>
        <span>·</span>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
      <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400 italic">
        {post.summary}
      </p>
      <div className="prose prose-zinc max-w-none dark:prose-invert whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
