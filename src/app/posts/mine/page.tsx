"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { getUserPosts } from "@/lib/firestore";
import type { Post, PostStatus } from "@/types";

export default function MyPostsPage() {
  return <RequireAuth><MyPosts /></RequireAuth>;
}

function MyPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) return;
    let active = true;
    getUserPosts(user.uid).then((items) => { if (active) setPosts(items); }).catch(() => { if (active) setError("Could not load your stories. Please try again."); });
    return () => { active = false; };
  }, [user]);
  return <main className="mx-auto max-w-3xl px-4 py-12">
    <p className="text-sm uppercase tracking-widest text-muted">Your newsroom</p>
    <h1 className="mt-2 font-serif text-4xl font-bold">My stories</h1>
    <Link href="/posts/new" className="mt-4 inline-block font-semibold text-accent-text">Write a story →</Link>
    {error && <p role="alert" className="mt-6 text-danger">{error}</p>}
    {!posts && !error && <p className="mt-6 text-muted">Loading stories…</p>}
    {posts && (["pending", "published", "rejected"] as PostStatus[]).map((status) => <section key={status} className="mt-10 border-t border-line pt-5">
      <h2 className="font-serif text-2xl capitalize">{status}</h2>
      {posts.filter((post) => post.status === status).length === 0 && <p className="mt-3 text-sm text-muted">No {status} stories.</p>}
      {posts.filter((post) => post.status === status).map((post) => <article key={post.id} className="flex items-center justify-between gap-4 border-b border-line py-4">
        <div><h3 className="font-serif text-xl">{post.title}</h3><p className="text-sm text-muted">{post.summary}</p></div>
        {status === "pending" ? <Link className="shrink-0 text-sm font-semibold text-accent-text" href={`/posts/${post.id}/edit`}>Edit</Link> : status === "published" ? <Link className="shrink-0 text-sm font-semibold text-accent-text" href={`/posts/${post.id}`}>Read</Link> : null}
      </article>)}
    </section>)}
  </main>;
}
