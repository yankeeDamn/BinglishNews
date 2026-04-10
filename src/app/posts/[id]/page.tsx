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
      try {
        const p = await getPostById(params.id);
        setPost(p);
      } catch {
        // Post not found or Firestore not configured
      }
      setLoading(false);
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="skeleton h-8 w-2/3 rounded" />
        <div className="skeleton mt-4 h-4 w-1/3 rounded" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!post || post.status !== "published") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[#888]">Post not found or not yet published.</p>
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
      <h1 className="mb-3 text-3xl font-bold text-white">
        {post.title}
      </h1>
      <div className="mb-6 flex items-center gap-3 text-sm text-[#888]">
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
      <p className="mb-6 text-lg text-[#aaa] italic">
        {post.summary}
      </p>
      <div className="prose prose-invert max-w-none whitespace-pre-wrap text-[#ccc]">
        {post.content}
      </div>
    </article>
  );
}
