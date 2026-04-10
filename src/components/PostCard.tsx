import Link from "next/link";
import type { Post } from "@/types";

export default function PostCard({ post }: { post: Post }) {
  return (
    <article className="card-hover group flex flex-col overflow-hidden rounded-2xl border border-[#2a2a2a] bg-[#141414]">
      {post.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.imageUrl}
          alt={post.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a]">
          <span className="text-5xl opacity-20">📰</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/posts/${post.id}`}>
          <h3 className="mb-2 text-base font-bold leading-snug text-white group-hover:text-gold transition">
            {post.title}
          </h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-sm text-[#888]">
          {post.summary}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-[#666]">
          <span className="font-medium text-[#aaa]">
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
