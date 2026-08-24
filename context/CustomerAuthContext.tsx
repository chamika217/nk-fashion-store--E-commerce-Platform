"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ── Types ────────────────────────────────────────────────────────────────────

interface CustomerAuthContextValue {
  user: User | null;
  loading: boolean;
}

// ── Context ──────────────────────────────────────────────────────────────────

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Security check: if the signed-in user is an admin, their session
        // must never be exposed on the public storefront. Firebase Auth uses a
        // single shared instance, so an admin login at /admin persists and
        // would otherwise be picked up here as a "customer" session.
        // We detect this by checking for a doc in the "admins" collection and,
        // if found, immediately sign out and treat the visitor as a guest.
        try {
          const adminSnap = await getDoc(doc(db, "admins", firebaseUser.uid));
          if (adminSnap.exists()) {
            // Admin session detected on the public storefront — sign out silently.
            await signOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
        } catch {
          // Firestore read failed (e.g. network error or rules) — fail safe:
          // do NOT expose any session, sign out to be safe.
          await signOut(auth).catch(() => {});
          setUser(null);
          setLoading(false);
          return;
        }

        // Confirmed not an admin — treat as a regular customer.
        setUser(firebaseUser);
      } else {
        setUser(null);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ user, loading }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used inside <CustomerAuthProvider>");
  }
  return ctx;
}
