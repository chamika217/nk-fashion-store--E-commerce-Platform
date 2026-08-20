import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Role, Permission } from "./types";

const ROLES_COL   = "roles";
const ADMINS_COL  = "admins";

// ── Default roles ─────────────────────────────────────────────────────────────

export const DEFAULT_ROLES: Omit<Role, "id">[] = [
  {
    name: "Super Admin",
    permissions: [
      "products:view", "products:manage",
      "orders:view",   "orders:manage",
      "categories:view", "categories:manage",
      "customers:view",
      "content:view",  "content:manage",
      "reports:view",
      "users:manage",
    ] as Permission[],
  },
  {
    name: "Inventory Manager",
    permissions: [
      "products:view", "products:manage",
      "categories:view", "categories:manage",
    ] as Permission[],
  },
  {
    name: "Order Manager",
    permissions: [
      "orders:view", "orders:manage",
      "customers:view",
    ] as Permission[],
  },
  {
    name: "Content Manager",
    permissions: [
      "content:view", "content:manage",
      "products:view", // needs product list to pick featured items
    ] as Permission[],
  },
  {
    // Customer Support can look up orders for customers but not change status.
    // Using orders:manage so support staff can update order status (e.g. confirm
    // cancellation requests) — change to orders:view only if read-only is preferred.
    name: "Customer Support",
    permissions: [
      "orders:view", "orders:manage",
      "customers:view",
    ] as Permission[],
  },
];

// ── CRUD ──────────────────────────────────────────────────────────────────────

export async function getRoles(): Promise<Role[]> {
  const snap = await getDocs(collection(db, ROLES_COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Role));
}

export async function getRoleById(id: string): Promise<Role | null> {
  const snap = await getDoc(doc(db, ROLES_COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Role;
}

export async function addRole(role: Omit<Role, "id">): Promise<string> {
  const ref = await addDoc(collection(db, ROLES_COL), role);
  return ref.id;
}

export async function updateRole(
  id: string,
  data: Partial<Omit<Role, "id">>
): Promise<void> {
  await updateDoc(doc(db, ROLES_COL, id), data);
}

export async function deleteRole(id: string): Promise<void> {
  // Guard: refuse if any admin still uses this role
  const q = query(collection(db, ADMINS_COL), where("roleId", "==", id));
  const snap = await getDocs(q);
  if (!snap.empty) {
    throw new Error(
      `Cannot delete: ${snap.size} admin account(s) are still assigned this role.`
    );
  }
  await deleteDoc(doc(db, ROLES_COL, id));
}

export async function seedDefaultRoles(): Promise<void> {
  const existing = await getRoles();
  if (existing.length > 0) {
    throw new Error("Roles collection is not empty — seed aborted.");
  }
  for (const role of DEFAULT_ROLES) {
    await addDoc(collection(db, ROLES_COL), role);
  }
}
