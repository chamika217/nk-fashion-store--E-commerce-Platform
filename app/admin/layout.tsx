import type { ReactNode } from "react";
import { AdminAuthProvider } from "@/context/AdminAuthContext";

// This nested layout applies to all /admin/* routes.
// It does NOT include the storefront Navbar/Footer —
// admin pages manage their own chrome.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <div className="min-h-screen bg-ivory">{children}</div>
    </AdminAuthProvider>
  );
}
