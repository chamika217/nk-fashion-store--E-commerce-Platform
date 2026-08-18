"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AdminUser } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminAuthContextValue {
  user: User | null;
  adminProfile: AdminUser | null;
  loading: boolean;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Look up the admin profile from the admins/{uid} Firestore doc
          const snap = await getDoc(doc(db, "admins", firebaseUser.uid));
          if (snap.exists()) {
            setAdminProfile({ uid: snap.id, ...snap.data() } as AdminUser);
          } else {
            // Authenticated but not in the admins collection — treat as no profile
            setAdminProfile(null);
          }
        } catch {
          setAdminProfile(null);
        }
      } else {
        setAdminProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, adminProfile, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  }
  return ctx;
}
