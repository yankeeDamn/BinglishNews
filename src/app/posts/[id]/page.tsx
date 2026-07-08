"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPostById } from "@/lib/firestore";
import type { Post } from "@/types";

export default function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, profile, loading: authLoading } = useAuth();
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

  if (loading || authLoading) {
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

  if (!post) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[#888]">Post not found.</p>
      </div>
    );
  }

  const isAuthor = Boolean(user && post.authorId === user.uid);
  const isAdmin = profile?.role === "admin";
  const canView = post.status === "published" || isAuthor || isAdmin;

  if (!canView) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <p className="text-[#888]">
          This post is not publicly available.
        </p>
        {!user && (
          <Link href="/auth/signin" className="text-gold hover:underline">
            Sign In
          </Link>
        )}
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {post.status !== "published" && (
        <div className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
          This post is currently <strong>{post.status}</strong> and visible to you because you{" "}
          {isAdmin ? "are an admin" : "are the author"}.
        </div>
      )}
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
        {isAuthor && post.status === "pending" && (
          <>
            <span>·</span>
            <Link href={`/posts/${post.id}/edit`} className="text-gold hover:underline">
              Edit
            </Link>
          </>
        )}
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
