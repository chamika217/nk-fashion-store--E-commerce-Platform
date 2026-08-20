"use client";

import { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import AdminShell from "@/components/admin/AdminShell";
import { getProducts } from "@/lib/productService";
import { getOrders } from "@/lib/orderService";

// ── Dashboard content ─────────────────────────────────────────────────────────

function DashboardContent() {
  const { adminProfile, role } = useAdminAuth();

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
    { label: "Total Products",  value: stats.totalProducts },
    { label: "Pending Orders",  value: stats.pendingOrders },
    { label: "Total Orders",    value: stats.totalOrders   },
    { label: "Low Stock Items", value: stats.lowStock      },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-1">
        Welcome back, {adminProfile?.name ?? "Admin"}
      </h1>
      <p className="text-sm text-gray mb-1">
        Here&apos;s a quick overview of your store.
      </p>
      {role && (
        <p className="text-xs text-white/60 bg-ink inline-block px-2 py-0.5 rounded-full mb-8 uppercase tracking-widest">
          {role.name}
        </p>
      )}

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
    </div>
  );
}

// AdminShell handles auth protection + sidebar nav
export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}
