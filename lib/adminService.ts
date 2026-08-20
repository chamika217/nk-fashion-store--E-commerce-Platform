import {
  collection,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AdminUser } from "./types";

const ADMINS_COL = "admins";

// Get all admin accounts
export async function getAdmins(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(db, ADMINS_COL));
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as AdminUser));
}

// Update an admin's assigned role
// NOTE: Requires users:manage permission — enforce this in the calling page,
// not here (Firestore rules enforce it at the DB level).
export async function updateAdminRole(uid: string, roleId: string): Promise<void> {
  await updateDoc(doc(db, ADMINS_COL, uid), { roleId });
}
