"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { hasPermission } from "@/lib/permissions";
import type { Permission } from "@/lib/types";
import ProtectedRoute from "@/components/admin/ProtectedRoute";

// Each nav link declares the permission needed to see it.
// undefined = always visible (Dashboard).
const ALL_NAV_LINKS: { label: string; href: string; icon: string; permission?: Permission }[] = [
  { label: "Dashboard",  href: "/admin/dashboard",  icon: "🏠" },
  { label: "Products",   href: "/admin/products",   icon: "👗", permission: "products:view"   },
  { label: "Categories", href: "/admin/categories", icon: "🗂️", permission: "categories:view" },
  { label: "Orders",     href: "/admin/orders",     icon: "📦", permission: "orders:view"     },
  { label: "Customers",  href: "/admin/customers",  icon: "👥", permission: "customers:view"  },
  { label: "Content",    href: "/admin/content",    icon: "📝", permission: "content:view"    },
  { label: "Reports",    href: "/admin/reports",    icon: "📊", permission: "reports:view"    },
  { label: "Users",      href: "/admin/users",      icon: "🔑", permission: "users:manage"    },
  { label: "Settings",   href: "/admin/settings",   icon: "⚙️" },
];

interface AdminShellProps {
  children: ReactNode;
}

// ── Hamburger icon ────────────────────────────────────────────────────────────
function HamburgerIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Shell({ children }: AdminShellProps) {
  const router            = useRouter();
  const pathname          = usePathname();
  const { adminProfile, role } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show a link if it has no permission requirement OR the current role has it
  const navLinks = ALL_NAV_LINKS.filter(
    (l) => !l.permission || hasPermission(role, l.permission)
  );

  async function handleLogout() {
    await signOut(auth);
    router.push("/admin/login");
  }

  // ── Sidebar content (shared between desktop + mobile drawer) ─────────────
  const SidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
        <Image
          src="/Logo.png"
          alt="NK Fashion Store"
          width={40}
          height={40}
          style={{ width: 40, height: 40 }}
          className="rounded-full object-cover shrink-0"
        />
        <div className="min-w-0">
          <p className="font-serif text-sm font-bold tracking-wide leading-snug text-ivory truncate">
            NK Fashion Store
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
            Admin Panel
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navLinks.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-white/15 text-ivory font-medium"
                  : "text-white/80 hover:bg-white/10 hover:text-ivory"
              }`}
            >
              <span className="text-base shrink-0">{link.icon}</span>
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
            <p className="text-xs text-white/40 truncate">{adminProfile.email}</p>
            {role && (
              <p className="text-[10px] uppercase tracking-widest text-white/30 mt-0.5">
                {role.name}
              </p>
            )}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full text-sm text-white/70 border border-white/20 rounded-lg py-2 hover:bg-white/10 hover:text-ivory transition-colors"
        >
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">

      {/* ── Desktop sidebar (md+) ─────────────────────────────────────────── */}
      <aside className="hidden md:flex w-60 shrink-0 bg-ink text-ivory flex-col">
        {SidebarContent}
      </aside>

      {/* ── Mobile sidebar backdrop ───────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile sidebar drawer (slide in from left) ────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-ink text-ivory flex flex-col
          transform transition-transform duration-250 ease-in-out md:hidden
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-white/60 hover:text-ivory hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <CloseIcon />
        </button>
        {SidebarContent}
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <main className="flex-1 bg-ivory min-h-screen min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-ink border-b border-white/10 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-white/70 hover:text-ivory hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <HamburgerIcon />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/Logo.png"
              alt="NK Fashion Store"
              width={28}
              height={28}
              style={{ width: 28, height: 28 }}
              className="rounded-full object-cover shrink-0"
            />
            <span className="font-serif text-sm font-bold text-ivory truncate">
              NK Admin
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>

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
