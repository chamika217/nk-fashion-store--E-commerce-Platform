"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import { getProducts } from "@/lib/productService";
import { getOrders } from "@/lib/orderService";

// ── Sidebar nav links (role-gated) ────────────────────────────────────────────
const OWNER_LINKS = [
  { label: "Dashboard",  href: "/admin/dashboard" },
  { label: "Products",   href: "/admin/products"  },
  { label: "Categories", href: "/admin/categories"},
  { label: "Orders",     href: "/admin/orders"    },
  { label: "Customers",  href: "/admin/customers" },
  { label: "Reports",    href: "/admin/reports"   },
  { label: "Settings",   href: "/admin/settings"  },
];

const STAFF_LINKS = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Products",  href: "/admin/products"  },
  { label: "Orders",    href: "/admin/orders"    },
];

// ── Dashboard shell ───────────────────────────────────────────────────────────

function DashboardShell() {
  const router = useRouter();
  const { adminProfile } = useAdminAuth();

  const navLinks = adminProfile?.role === "staff" ? STAFF_LINKS : OWNER_LINKS;

  // Real stat counts
  const [stats, setStats] = useState({
    totalProducts: "—",
    pendingOrders: "—",
    totalOrders:   "—",
    lowStock:      "—",
  });

  useEffect(() => {
    Promise.all([getProducts(), getOrders()])
      .then(([products, orders]) => {
        const totalProducts = products.length;
        const pendingOrders = orders.filter((o) => o.status === "Pending").length;
        const totalOrders   = orders.length;
        const lowStock      = products.filter(
          (p) => p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold ?? 3)
        ).length;

        setStats({
          totalProducts: String(totalProducts),
          pendingOrders: String(pendingOrders),
          totalOrders:   String(totalOrders),
          lowStock:      String(lowStock),
        });
      })
      .catch(() => {}); // Keep "—" on error
  }, []);

  const STAT_CARDS = [
    { label: "Total Products", value: stats.totalProducts },
    { label: "Pending Orders", value: stats.pendingOrders },
    { label: "Total Orders",   value: stats.totalOrders   },
    { label: "Low Stock Items", value: stats.lowStock      },
  ];

  async function handleLogout() {
    await signOut(auth);
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 bg-ink text-ivory flex flex-col">
        {/* Wordmark */}
        <div className="px-6 py-6 border-b border-white/10">
          <p className="font-serif text-lg font-bold tracking-wide leading-snug">
            NK Fashion Store
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5">
            Admin Panel
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-ivory transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Signed-in user + log out */}
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
      <main className="flex-1 bg-ivory px-8 py-10 overflow-y-auto">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-1">
          Welcome back, {adminProfile?.name ?? "Admin"}
        </h1>
        <p className="text-sm text-gray mb-10">
          Here&apos;s a quick overview of your store.
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="border border-gray-light rounded-xl p-6 flex flex-col gap-2 bg-ivory"
            >
              <p className="text-xs text-gray uppercase tracking-wider">
                {card.label}
              </p>
              <p className="font-serif text-3xl font-bold text-ink">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

// Wrap in ProtectedRoute so unauthenticated users are redirected to /admin/login
export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell />
    </ProtectedRoute>
  );
}
