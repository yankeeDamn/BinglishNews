"use client";
import { useEffect, useRef } from "react";
import { useBookmarks } from "@/context/BookmarkContext";

export default function BookmarksDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { bookmarks, remove } = useBookmarks();
  useEffect(() => { const el = dialog.current; if (!el) return; if (open && !el.open) el.showModal(); else if (!open && el.open) el.close(); }, [open]);
  return <dialog ref={dialog} onClose={onClose} aria-labelledby="bookmarks-title" className="drawer">
    <div className="flex items-center justify-between border-b border-line pb-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-accent-text">Your reading list</p><h2 id="bookmarks-title" className="mt-2 font-serif text-3xl">Saved stories</h2></div><button onClick={onClose} className="drawer-close" aria-label="Close saved stories">✕</button></div>
    <p className="mt-4 text-sm text-muted">Saved on this device.</p>
    {bookmarks.length === 0 ? <p className="mt-12 font-serif text-xl text-muted">Save a story and find it here when you have a moment.</p> : <ul className="mt-5">{bookmarks.map((item) => <li key={item.key} className="border-b border-line py-5"><p className="text-xs font-semibold uppercase tracking-wide text-muted">{item.source}</p><a href={item.url} target={item.url.startsWith("/") ? undefined : "_blank"} rel={item.url.startsWith("/") ? undefined : "noopener noreferrer"} className="mt-2 block font-serif text-xl hover:text-accent-text">{item.title}</a><button onClick={() => remove(item.key)} className="mt-3 text-sm text-muted underline hover:text-ink">Remove</button></li>)}</ul>}
  </dialog>;
}
