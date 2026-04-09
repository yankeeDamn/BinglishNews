"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPendingPosts, moderatePost } from "@/lib/firestore";
import type { Post } from "@/types";

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const pending = await getPendingPosts();
    setPosts(pending);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile?.role === "admin") {
      loadPosts();
    }
  }, [profile, loadPosts]);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-zinc-500">Loading…</p>
      </div>
    );
  }

  if (!user || profile?.role !== "admin") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-red-500 font-medium">
          Access denied. Admin privileges required.
        </p>
      </div>
    );
  }

  const handleModerate = async (
    postId: string,
    status: "published" | "rejected",
  ) => {
    setActionId(postId);
    try {
      await moderatePost(postId, status, user.uid);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Moderation error:", err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
        Moderation Dashboard
      </h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-zinc-500">No posts pending review. 🎉</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    By {post.authorName} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  Pending
                </span>
              </div>

              <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                {post.summary}
              </p>

              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-blue-600 hover:underline">
                  View full content
                </summary>
                <div className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-50 p-3 text-sm dark:bg-zinc-800">
                  {post.content}
                </div>
              </details>

              {post.imageUrl && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={post.imageUrl}
                  alt="Post image"
                  className="mb-4 h-40 rounded-lg object-cover"
                />
              )}

              <div className="flex gap-3">
                <button
                  disabled={actionId === post.id}
                  onClick={() => handleModerate(post.id, "published")}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {actionId === post.id ? "…" : "✓ Approve"}
                </button>
                <button
                  disabled={actionId === post.id}
                  onClick={() => handleModerate(post.id, "rejected")}
                  className="rounded-lg bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionId === post.id ? "…" : "✕ Reject"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
