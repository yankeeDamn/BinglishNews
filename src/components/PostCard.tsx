import Link from "next/link";
import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {post.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-600">
          <span className="text-5xl opacity-30">📰</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/posts/${post.id}`}>
          <h3 className="mb-2 text-base font-bold leading-snug text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {post.title}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
          {post.summary}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            By {post.authorName}
          </span>
          <time dateTime={post.createdAt}>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </div>
      </div>
    </article>
  );
}
