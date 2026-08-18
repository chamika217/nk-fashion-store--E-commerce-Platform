"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

const OWNER_LINKS = [
  { label: "Dashboard",  href: "/admin/dashboard"  },
  { label: "Products",   href: "/admin/products"   },
  { label: "Categories", href: "/admin/categories" },
  { label: "Orders",     href: "/admin/orders"     },
  { label: "Customers",  href: "/admin/customers"  },
  { label: "Reports",    href: "/admin/reports"    },
  { label: "Settings",   href: "/admin/settings"   },
];

const STAFF_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products",  href: "/admin/products"  },
  { label: "Orders",    href: "/admin/orders"    },
];

interface AdminShellProps {
  children: ReactNode;
}

function Shell({ children }: AdminShellProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const { adminProfile } = useAdminAuth();

  const navLinks = adminProfile?.role === "staff" ? STAFF_LINKS : OWNER_LINKS;

  async function handleLogout() {
    await signOut(auth);
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-ink text-ivory flex flex-col">
        {/* Logo */}
        <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
          <Image
            src="/Logo.png"
            alt="NK Fashion Store"
            width={40}
            height={40}
            className="rounded-full object-cover shrink-0"
          />
          <div>
            <p className="font-serif text-sm font-bold tracking-wide leading-snug text-ivory">
              NK Fashion Store
            </p>
            <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
              Admin Panel
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-white/15 text-ivory font-medium"
                    : "text-white/80 hover:bg-white/10 hover:text-ivory"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-5 border-t border-white/10 flex flex-col gap-3">
          {adminProfile && (
            <div className="px-1">
              <p className="text-sm font-medium text-ivory leading-snug truncate">
                {adminProfile.name}
              </p>
              <p className="text-xs text-white/40 truncate">
                {adminProfile.email}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">
                {adminProfile.role}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-sm text-white/70 border border-white/20 rounded-lg py-2 hover:bg-white/10 hover:text-ivory transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 bg-ivory px-6 py-8 overflow-y-auto min-h-screen">
        {children}
      </main>
    </div>
  );
}

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <ProtectedRoute>
      <Shell>{children}</Shell>
    </ProtectedRoute>
  );
}
