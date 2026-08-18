"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";

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
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
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
