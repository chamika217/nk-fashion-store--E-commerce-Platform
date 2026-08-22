"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, adminProfile, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !adminProfile) {
        router.replace("/admin/login");
      }
    }
  }, [loading, user, adminProfile, router]);

  // While auth state is resolving, show a neutral loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-ivory text-sm opacity-60">Loading…</p>
      </div>
    );
  }

  // Not authenticated or not an admin — return null while redirect fires
  if (!user || !adminProfile) return null;

  return <>{children}</>;
}
