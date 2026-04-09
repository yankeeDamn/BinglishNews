import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { getDbSafe } from "./firebase";
import type { Post, PostStatus, UserProfile } from "@/types";

function requireDb() {
  const d = getDbSafe();
  if (!d) throw new Error("Firestore is not configured");
  return d;
}

/* ------------------------------------------------------------------ */
/*  User Profiles                                                     */
/* ------------------------------------------------------------------ */

export async function createUserProfile(
  uid: string,
  email: string,
  displayName: string,
): Promise<void> {
  const db = requireDb();
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid,
      email,
      displayName,
      role: "user",
      createdAt: serverTimestamp(),
    });
  }
}

export async function getUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
  } as UserProfile;
}

/* ------------------------------------------------------------------ */
/*  Posts                                                              */
/* ------------------------------------------------------------------ */

function toPost(id: string, data: Record<string, unknown>): Post {
  const ts = (v: unknown) =>
    v instanceof Timestamp ? v.toDate().toISOString() : (v as string) ?? "";
  return {
    id,
    title: data.title as string,
    summary: data.summary as string,
    content: data.content as string,
    imageUrl: (data.imageUrl as string) ?? null,
    authorId: data.authorId as string,
    authorName: data.authorName as string,
    status: data.status as PostStatus,
    createdAt: ts(data.createdAt),
    updatedAt: ts(data.updatedAt),
    moderatedBy: data.moderatedBy as string | undefined,
    moderatedAt: ts(data.moderatedAt),
  };
}

export async function createPost(
  post: Omit<Post, "id" | "createdAt" | "updatedAt" | "status">,
): Promise<string> {
  const db = requireDb();
  const ref = await addDoc(collection(db, "posts"), {
    ...post,
    status: "pending" as PostStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getPublishedPosts(): Promise<Post[]> {
  const db = requireDb();
  const q = query(
    collection(db, "posts"),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

export async function getPendingPosts(): Promise<Post[]> {
  const db = requireDb();
  const q = query(
    collection(db, "posts"),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}

export async function getPostById(id: string): Promise<Post | null> {
  const db = requireDb();
  const snap = await getDoc(doc(db, "posts", id));
  if (!snap.exists()) return null;
  return toPost(snap.id, snap.data());
}

export async function moderatePost(
  postId: string,
  status: "published" | "rejected",
  moderatorId: string,
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, "posts", postId), {
    status,
    moderatedBy: moderatorId,
    moderatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserPosts(uid: string): Promise<Post[]> {
  const db = requireDb();
  const q = query(
    collection(db, "posts"),
    where("authorId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => toPost(d.id, d.data()));
}
