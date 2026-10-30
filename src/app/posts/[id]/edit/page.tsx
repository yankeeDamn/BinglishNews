"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import { getPostById, updatePendingPost } from "@/lib/firestore";
import { uploadPostImage } from "@/lib/storage";
import type { Post } from "@/types";

export default function EditPostPage() { return <RequireAuth><EditPost /></RequireAuth>; }

function EditPost() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!user || !id) return;
    let active = true;
    getPostById(id).then((item) => {
      if (!active) return;
      if (!item || item.authorId !== user.uid || item.status !== "pending") setError("This story is unavailable or can no longer be edited.");
      else setPost(item);
    }).catch(() => { if (active) setError("Could not load this story."); });
    return () => { active = false; };
  }, [id, user]);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!post || !user) return;
    if (post.title.trim().length < 3 || post.summary.trim().length < 10 || post.content.trim().length < 20) { setError("Use at least 3 characters for the title, 10 for the summary and 20 for the story."); return; }
    if (file && file.size > 5 * 1024 * 1024) { setError("Image must be under 5 MB."); return; }
    setSaving(true); setError("");
    try {
      const imageUrl = file ? await uploadPostImage(file, user.uid) : removeImage ? null : post.imageUrl;
      await updatePendingPost(post.id, { title: post.title.trim(), summary: post.summary.trim(), content: post.content.trim(), imageUrl, sourceUrl: (post.sourceUrl || "").trim(), imageCredit: (post.imageCredit || "").trim() });
      router.push("/posts/mine");
    } catch { setError("Could not save this story. It may have already been moderated."); }
    finally { setSaving(false); }
  }
  const inputClass = "rounded-lg border border-line bg-surface px-3 py-2 text-ink";
  return <main className="mx-auto max-w-2xl px-4 py-12"><h1 className="font-serif text-4xl font-bold">Edit your story</h1>
    {error && <p role="alert" className="mt-4 text-danger">{error}</p>}
    {!post && !error && <p className="mt-4 text-muted">Loading story…</p>}
    {post && <form onSubmit={save} className="mt-6 flex flex-col gap-5">
      <label className="flex flex-col gap-1">Title<input className={inputClass} required maxLength={200} value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} /></label>
      <label className="flex flex-col gap-1">Summary<input className={inputClass} required maxLength={500} value={post.summary} onChange={(e) => setPost({ ...post, summary: e.target.value })} /></label>
      <label className="flex flex-col gap-1">Story<textarea className={inputClass} required rows={12} value={post.content} onChange={(e) => setPost({ ...post, content: e.target.value })} /></label>
      <label className="flex flex-col gap-1">Source link (optional)<input type="url" maxLength={2048} className={inputClass} value={post.sourceUrl || ""} onChange={(e) => setPost({ ...post, sourceUrl: e.target.value })} /></label>
      <label className="flex flex-col gap-1">Image credit (optional)<input maxLength={200} className={inputClass} value={post.imageCredit || ""} onChange={(e) => setPost({ ...post, imageCredit: e.target.value })} /></label>
      {post.imageUrl && <label><input type="checkbox" checked={removeImage} onChange={(e) => setRemoveImage(e.target.checked)} /> Remove current image</label>}
      <label className="flex flex-col gap-1">Replace cover image (optional, max 5 MB)<input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
      <button disabled={saving} className="rounded-lg bg-accent px-4 py-3 font-semibold text-accent-ink disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
    </form>}
  </main>;
}
