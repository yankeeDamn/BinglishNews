"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPostById, updateOwnPendingPost } from "@/lib/firestore";
import { uploadPostImage } from "@/lib/storage";
import type { Post } from "@/types";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    async function load() {
      if (!params.id || !user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setLoadError(null);
      try {
        const found = await getPostById(params.id);
        if (!found) {
          setLoadError("Post not found.");
          return;
        }
        if (found.authorId !== user.uid) {
          setLoadError("You can only edit your own posts.");
          return;
        }
        if (found.status !== "pending") {
          setLoadError("Only pending posts can be edited.");
          return;
        }
        setPost(found);
        setTitle(found.title);
        setSummary(found.summary);
        setContent(found.content);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : "Failed to load post.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, user]);

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setImageFile(file);
    if (file) {
      setRemoveImage(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !post) return;

    setError(null);
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters.");
      return;
    }
    if (summary.trim().length < 10) {
      setError("Summary must be at least 10 characters.");
      return;
    }
    if (content.trim().length < 20) {
      setError("Content must be at least 20 characters.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = post.imageUrl;
      if (removeImage) {
        imageUrl = null;
      }
      if (imageFile) {
        imageUrl = await uploadPostImage(imageFile, user.uid);
      }
      await updateOwnPendingPost(post.id, user.uid, {
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        imageUrl,
      });
      router.push(`/posts/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update post.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[#888]">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <p className="text-[#aaa]">Sign in to edit your posts.</p>
        <Link href="/auth/signin" className="text-gold hover:underline">
          Sign In
        </Link>
      </div>
    );
  }

  if (!post || loadError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <p className="rounded-lg border border-red-900/30 bg-red-900/10 p-3 text-sm text-red-400">
          {loadError ?? "Post unavailable."}
        </p>
        <Link href="/posts/mine" className="mt-4 inline-block text-gold hover:underline">
          Back to My Posts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">Edit Post</h1>

      <p className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
        You can edit this post while it is pending moderation.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900/30 bg-red-900/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Title
          <input
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-white outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Summary
          <input
            type="text"
            required
            maxLength={500}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-white outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Content
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-white outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
          />
        </label>

        {post.imageUrl && !removeImage && (
          <div className="rounded-lg border border-[#2a2a2a] bg-[#141414] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt="Current post" className="mb-3 h-44 rounded object-cover" />
            <button
              type="button"
              onClick={() => setRemoveImage(true)}
              className="text-sm text-red-400 hover:underline"
            >
              Remove current image
            </button>
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Replace Image (optional, max 5 MB)
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-[#888] file:mr-3 file:rounded file:border-0 file:bg-gold/20 file:px-3 file:py-1 file:text-gold file:cursor-pointer"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gold px-5 py-2.5 font-semibold text-black transition hover:bg-gold-light disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Save Changes"}
          </button>
          <Link
            href={`/posts/${post.id}`}
            className="rounded-lg border border-[#2a2a2a] px-5 py-2.5 text-sm text-[#ccc] transition hover:border-gold hover:text-gold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
