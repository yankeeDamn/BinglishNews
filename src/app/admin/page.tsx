"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPendingPosts, moderatePost } from "@/lib/firestore";
import type { Post } from "@/types";
import RequireAuth from "@/components/RequireAuth";

export default function AdminPage() {
  return (
    <RequireAuth admin>
      <AdminDashboard />
    </RequireAuth>
  );
}

function AdminDashboard() {
  const { user, profile } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pending = await getPendingPosts();
      setPosts(pending);
    } catch (err) {
      console.error("Failed to load pending posts:", err);
      setError("Couldn't load pending posts. Check your connection and Firestore rules, then retry.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (profile?.role === "admin") {
      loadPosts();
    }
  }, [profile, loadPosts]);

  if (!user) return null; // RequireAuth guarantees an admin user.

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
      setError("That action failed. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-ink">
        Moderation Dashboard
      </h1>

      {error && (
        <div role="alert" className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          <span>{error}</span>
          <button onClick={loadPosts} className="shrink-0 rounded bg-danger/10 px-3 py-1 hover:bg-danger/10">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <p className="text-muted">No posts pending review. 🎉</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-line bg-surface p-5"
            >
              <div className="mb-2 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-ink">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">
                    By {post.authorName} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-text">
                  Pending
                </span>
              </div>

              <p className="mb-3 text-sm text-muted">
                {post.summary}
              </p>

              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-accent-text hover:underline">
                  View full content
                </summary>
                <div className="mt-2 whitespace-pre-wrap rounded-lg bg-paper p-3 text-sm text-ink/80">
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
                  className="rounded-lg bg-green-700 px-4 py-1.5 text-sm text-white transition hover:bg-green-600 disabled:opacity-50"
                >
                  {actionId === post.id ? "…" : "✓ Approve"}
                </button>
                <button
                  disabled={actionId === post.id}
                  onClick={() => handleModerate(post.id, "rejected")}
                  className="rounded-lg bg-red-700 px-4 py-1.5 text-sm text-white transition hover:bg-red-600 disabled:opacity-50"
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
