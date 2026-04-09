import Link from "next/link";
import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="group rounded-xl border border-zinc-200 bg-white p-5 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      {post.imageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.imageUrl}
          alt={post.title}
          className="mb-4 h-48 w-full rounded-lg object-cover"
        />
      )}
      <Link href={`/posts/${post.id}`}>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 group-hover:text-blue-600 dark:text-white">
          {post.title}
        </h3>
      </Link>
      <p className="mb-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
        {post.summary}
      </p>
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>By {post.authorName}</span>
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleDateString()}
        </time>
      </div>
    </article>
  );
}
