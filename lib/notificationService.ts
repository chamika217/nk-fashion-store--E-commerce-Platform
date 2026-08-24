import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
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
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification));
}

/** Real-time listener — returns an unsubscribe function */
export function subscribeToNotifications(
  callback: (notifications: Notification[]) => void
): Unsubscribe {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification))
    );
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export async function markAsRead(id: string): Promise<void> {
  await updateDoc(doc(db, COL, id), { read: true });
}

export async function markAllAsRead(): Promise<void> {
  const q    = query(collection(db, COL));
  const snap = await getDocs(q);
  if (snap.empty) return;
  const batch = writeBatch(db);
  snap.docs
    .filter((d) => !d.data().read)
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
