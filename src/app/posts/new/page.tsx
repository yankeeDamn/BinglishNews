"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createPost } from "@/lib/firestore";
import { uploadPostImage } from "@/lib/storage";
import RequireAuth from "@/components/RequireAuth";

export default function NewPostPage() {
  return (
    <RequireAuth>
      <NewPostForm />
    </RequireAuth>
  );
}

function NewPostForm() {
  const { user, profile } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null; // RequireAuth guarantees a user; narrows the type.

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
        authorName: profile?.displayName || user.displayName || "Anonymous",
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
      <h1 className="mb-6 text-2xl font-bold text-ink">
        Create a News Post
      </h1>

      <p className="mb-6 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-accent-text">
        Your post will be submitted for moderation and will appear publicly once
        approved by an admin.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1 text-sm font-medium text-ink/80">
          Title
          <input
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink/80">
          Summary
          <input
            type="text"
            required
            maxLength={500}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Brief summary (shown in card previews)"
            className="rounded-lg border border-line bg-surface px-3 py-2 text-ink placeholder-muted outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink/80">
          Content
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-ink outline-none transition focus:border-accent focus:ring-1 focus:ring-accent"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-ink/80">
          Cover Image (optional, max 5 MB)
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-muted file:mr-3 file:rounded file:border-0 file:bg-accent/20 file:px-3 file:py-1 file:text-accent-text file:cursor-pointer"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent py-2.5 font-semibold text-accent-ink transition hover:bg-accent-hover disabled:opacity-50"
        >
          {submitting ? "Submitting…" : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
