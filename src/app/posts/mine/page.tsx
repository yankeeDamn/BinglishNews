"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUserPostsByStatuses } from "@/lib/firestore";
import type { Post, PostStatus } from "@/types";

const statusOrder: PostStatus[] = ["pending", "published", "rejected"];

const statusStyle: Record<PostStatus, string> = {
  pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  published: "border-green-500/40 bg-green-500/10 text-green-300",
  rejected: "border-red-500/40 bg-red-500/10 text-red-300",
};

export default function MyPostsPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) {
        setPosts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const all = await getUserPostsByStatuses(user.uid, statusOrder);
        setPosts(all);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load posts");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const grouped = useMemo(() => {
    return statusOrder.map((status) => ({
      status,
      posts: posts.filter((post) => post.status === status),
    }));
  }, [posts]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[#888]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-[#aaa]">Sign in to view and manage your posts.</p>
        <Link href="/auth/signin" className="text-gold hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">My Posts</h1>
        <Link
          href="/posts/new"
          className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold-light"
        >
          + Create New Post
        </Link>
      </div>

      <p className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
        Pending posts can be edited until an admin publishes or rejects them.
      </p>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-900/30 bg-red-900/10 p-3 text-sm text-red-400">
          {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#2a2a2a] bg-[#141414] p-8 text-center">
          <p className="text-[#888]">You haven&apos;t posted yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ status, posts: items }) => (
            <section key={status}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#aaa]">
                {status} ({items.length})
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-[#666]">No posts.</p>
              ) : (
                <div className="space-y-3">
                  {items.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4"
                    >
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle[post.status]}`}
                        >
                          {post.status}
                        </span>
                        <time className="text-xs text-[#666]" dateTime={post.updatedAt}>
                          Updated {new Date(post.updatedAt).toLocaleDateString()}
                        </time>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                      <p className="mt-1 text-sm text-[#999]">{post.summary}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <Link href={`/posts/${post.id}`} className="text-gold hover:underline">
                          View
                        </Link>
                        {post.status === "pending" && (
                          <Link
                            href={`/posts/${post.id}/edit`}
                            className="text-gold hover:underline"
                          >
                            Edit
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
