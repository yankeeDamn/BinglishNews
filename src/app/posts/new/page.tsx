"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/firestore";
import { uploadPostImage } from "@/lib/storage";

export default function NewPostPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-[#888]">Loading…</p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2">
        <p className="text-[#aaa]">
          You must be signed in to create a post.
        </p>
        <a href="/auth/signin" className="text-gold hover:underline">
          Sign In
        </a>
      </div>
    );
  }

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      return;
    }
    setImageFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadPostImage(imageFile, user.uid);
      }

      await createPost({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        imageUrl,
        authorId: user.uid,
        authorName: profile.displayName,
      });

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-white">
        Create a News Post
      </h1>

      <p className="mb-6 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
        Your post will be submitted for moderation and will appear publicly once
        approved by an admin.
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
            placeholder="Brief summary (shown in card previews)"
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-white placeholder-[#666] outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
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

        <label className="flex flex-col gap-1 text-sm font-medium text-[#ccc]">
          Cover Image (optional, max 5 MB)
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="rounded-lg border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-[#888] file:mr-3 file:rounded file:border-0 file:bg-gold/20 file:px-3 file:py-1 file:text-gold file:cursor-pointer"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-gold py-2.5 font-semibold text-black transition hover:bg-gold-light disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
