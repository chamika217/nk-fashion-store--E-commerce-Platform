import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Notification, NotificationType } from "./types";

const COL = "notifications";

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createNotification(
  payload: Omit<Notification, "id">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), payload);
  return ref.id;
}

/** Convenience helper used by orderService / productService */
export async function pushNotification({
  type,
  title,
  message,
  linkType,
  linkId,
}: {
  type: NotificationType;
  title: string;
  message: string;
  linkType?: Notification["linkType"];
  linkId?: string;
}): Promise<void> {
  await createNotification({
    type,
    title,
    message,
    read: false,
    createdAt: Date.now(),
    ...(linkType ? { linkType } : {}),
    ...(linkId   ? { linkId   } : {}),
  });
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getNotifications(): Promise<Notification[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Notification))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

/** Real-time listener — returns an unsubscribe function */
export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  // Use collection-level listener without orderBy to avoid needing a
  // composite index. Sort client-side by createdAt descending.
  const q = collection(db, COL);
  return onSnapshot(
    q,
    (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Notification))
        .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      callback(data);
    },
    (err) => {
      console.error("[NotificationService] onSnapshot error:", err.code, err.message);
      onError?.(err);
    }
  );
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function markAsRead(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { read: true });
}

export async function markAllAsRead(): Promise<void> {
  const snap = await getDocs(collection(db, COL));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs
    .filter((d) => !(d.data() as DocumentData).read)
    .forEach((d) => batch.update(d.ref, { read: true }));
  await batch.commit();
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function clearAllNotifications(): Promise<void> {
  const snap  = await getDocs(collection(db, COL));
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
