import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getStorageSafe } from "./firebase";

export async function uploadPostImage(
  file: File,
  userId: string,
): Promise<string> {
  const storageInstance = getStorageSafe();
  if (!storageInstance) throw new Error("Firebase Storage is not configured");

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `posts/${userId}/${timestamp}_${safeName}`;
  const storageRef = ref(storageInstance, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
