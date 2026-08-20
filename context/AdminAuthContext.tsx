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
import type { AdminUser, Role } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminAuthContextValue {
  user: User | null;
  adminProfile: AdminUser | null;
  role: Role | null;       // resolved Role document for the signed-in admin
  loading: boolean;
}

// ── Context ──────────────────────────────────────────────────────────────────

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminUser | null>(null);
  const [role, setRole]               = useState<Role | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // 1. Fetch admin profile
          const adminSnap = await getDoc(doc(db, "admins", firebaseUser.uid));
          if (adminSnap.exists()) {
            const profile = { uid: adminSnap.id, ...adminSnap.data() } as AdminUser;
            setAdminProfile(profile);

            // 2. Fetch the role document
            if (profile.roleId) {
              const roleSnap = await getDoc(doc(db, "roles", profile.roleId));
              if (roleSnap.exists()) {
                setRole({ id: roleSnap.id, ...roleSnap.data() } as Role);
              } else {
                setRole(null);
              }
            } else {
              // Legacy admins without roleId — treat as no role (access denied)
              // Set roleId manually via Firebase Console after seeding roles.
              setRole(null);
            }
          } else {
            setAdminProfile(null);
            setRole(null);
          }
        } catch {
          setAdminProfile(null);
          setRole(null);
        }
      } else {
        setAdminProfile(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, adminProfile, role, loading }}>
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
