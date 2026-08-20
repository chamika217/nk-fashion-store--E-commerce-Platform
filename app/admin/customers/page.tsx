"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/orderService";
import type { Order } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { hasPermission } from "@/lib/permissions";

// ── Types ─────────────────────────────────────────────────────────────────────

interface DerivedCustomer {
  phone: string;
  name: string;
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: number;
  orders: Order[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveCustomersFromOrders(orders: Order[]): DerivedCustomer[] {
  const map = new Map<string, DerivedCustomer>();

  for (const order of orders) {
    const key = order.customer.phone;
    const existing = map.get(key);

    if (existing) {
      existing.orderCount   += 1;
      existing.totalSpent   += order.total;
      existing.orders.push(order);
      // Use name from most recent order (orders already sorted desc by createdAt)
      if (order.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = order.createdAt;
        existing.name          = order.customer.name;
        existing.city          = order.customer.city;
      }
    } else {
      map.set(key, {
        phone:         key,
        name:          order.customer.name,
        city:          order.customer.city,
        orderCount:    1,
        totalSpent:    order.total,
        lastOrderDate: order.createdAt,
        orders:        [order],
      });
    }
  }

  // Sort by lastOrderDate descending by default
  return Array.from(map.values()).sort(
    (a, b) => b.lastOrderDate - a.lastOrderDate
  );
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// ── Status badge (reused from orders page style) ──────────────────────────────

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles: Record<Order["status"], string> = {
    Pending:    "bg-gold/20 text-gold",
    Confirmed:  "bg-gray-light text-gray",
    Processing: "bg-rose-light text-rose",
    Dispatched: "bg-sky-100 text-sky-700",
    Delivered:  "bg-green-100 text-green-700",
    Cancelled:  "bg-rose/20 text-rose",
  };
  return (
    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

// ── Sortable column header ────────────────────────────────────────────────────

type SortKey = "orderCount" | "totalSpent";

function SortHeader({
  label,
  sortKey,
  current,
  direction,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey | null;
  direction: "asc" | "desc";
  onClick: (key: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <button
      onClick={() => onClick(sortKey)}
      className="flex items-center gap-1 text-xs font-semibold text-gray uppercase tracking-wider hover:text-ink transition-colors"
    >
      {label}
      <span className="text-[10px]">
        {active ? (direction === "asc" ? "▲" : "▼") : "⇅"}
      </span>
    </button>
  );
}

// ── Customer order history panel ──────────────────────────────────────────────

function CustomerOrders({ customer }: { customer: DerivedCustomer }) {
  const sorted = [...customer.orders].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  return (
    <div className="bg-gray-light/30 border-t border-gray-light px-4 py-5">
      <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
        Order History ({customer.orderCount})
      </p>
      <div className="flex flex-col gap-2">
        {sorted.map((order) => (
          <div
            key={order.id}
            className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-gray-light last:border-0"
          >
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/orders?search=${encodeURIComponent(order.orderNumber)}`}
                className="font-mono text-xs font-semibold text-rose hover:text-ink transition-colors"
              >
                {order.orderNumber}
              </Link>
              <span className="text-xs text-gray">{formatDate(order.createdAt)}</span>
              <StatusBadge status={order.status} />
            </div>
            <span className="text-sm font-medium text-ink">
              Rs. {order.total.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
      <p className="text-2xl">🔒</p>
      <p className="font-serif text-xl font-bold text-ink">Access Restricted</p>
      <p className="text-sm text-gray max-w-xs">
        You don&apos;t have permission to access this section.
      </p>
    </div>
  );
}

function CustomersContent() {
  const { adminProfile, role }  = useAdminAuth();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [sortKey, setSortKey]   = useState<SortKey | null>(null);
  const [sortDir, setSortDir]   = useState<"asc" | "desc">("desc");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  // ── Permission guard ────────────────────────────────────────────────────
  if (adminProfile && !hasPermission(role, "customers:view")) {
    return <AccessDenied />;
  }

  // Derived customers from orders
  const allCustomers = useMemo(
    () => deriveCustomersFromOrders(orders),
    [orders]
  );

  // Summary stats
  const stats = useMemo(() => {
    if (allCustomers.length === 0) return null;
    const totalOrders = allCustomers.reduce((s, c) => s + c.orderCount, 0);
    const totalSpent  = allCustomers.reduce((s, c) => s + c.totalSpent, 0);
    return {
      uniqueCustomers: allCustomers.length,
      avgOrders:       (totalOrders / allCustomers.length).toFixed(1),
      avgOrderValue:   Math.round(totalSpent / totalOrders).toLocaleString(),
    };
  }, [allCustomers]);

  // Search + sort
  const displayed = useMemo(() => {
    let list = allCustomers;

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }

    if (sortKey) {
      list = [...list].sort((a, b) =>
        sortDir === "asc"
          ? a[sortKey] - b[sortKey]
          : b[sortKey] - a[sortKey]
      );
    }

    return list;
  }, [allCustomers, search, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-1">
        <h1 className="font-serif text-2xl font-bold text-ink">Customers</h1>
        <p className="text-xs text-gray mt-1">
          Customer list derived from order history — no separate customer accounts.
        </p>
      </div>

      {/* Summary stats */}
      {!loading && stats && (
        <div className="grid grid-cols-3 gap-3 my-6">
          {[
            { label: "Unique Customers",    value: stats.uniqueCustomers },
            { label: "Avg Orders / Customer", value: stats.avgOrders    },
            { label: "Avg Order Value",      value: `Rs. ${stats.avgOrderValue}` },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-gray-light rounded-xl p-4 flex flex-col gap-1 bg-ivory"
            >
              <p className="text-xs text-gray uppercase tracking-wider">{s.label}</p>
              <p className="font-serif text-2xl font-bold text-ink">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {!loading && orders.length > 0 && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="w-full sm:w-72 rounded-lg border border-gray-light px-3 py-2 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose mb-5 transition-colors"
        />
      )}

      {loading ? (
        <p className="text-sm text-gray py-12 text-center">Loading customers…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray">No customers yet.</p>
          <p className="text-xs text-gray mt-2">
            Customers appear here once orders come in.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-light overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_130px_120px_140px_160px_120px_40px] bg-gray-light/50 px-4 py-3 gap-2 items-center">
            <span className="text-xs font-semibold text-gray uppercase tracking-wider">Name</span>
            <span className="text-xs font-semibold text-gray uppercase tracking-wider">Phone</span>
            <span className="text-xs font-semibold text-gray uppercase tracking-wider">City</span>
            <SortHeader label="Orders"      sortKey="orderCount" current={sortKey} direction={sortDir} onClick={handleSort} />
            <SortHeader label="Total Spent" sortKey="totalSpent" current={sortKey} direction={sortDir} onClick={handleSort} />
            <span className="text-xs font-semibold text-gray uppercase tracking-wider">Last Order</span>
            <span />
          </div>

          <div className="divide-y divide-gray-light bg-ivory">
            {displayed.length === 0 ? (
              <p className="text-sm text-gray text-center py-10">
                No customers match &ldquo;{search}&rdquo;.
              </p>
            ) : (
              displayed.map((customer) => (
                <div key={customer.phone}>
                  {/* Row */}
                  <button
                    onClick={() =>
                      setExpanded((prev) =>
                        prev === customer.phone ? null : customer.phone
                      )
                    }
                    className="w-full text-left px-4 py-3 hover:bg-rose-light/20 transition-colors"
                  >
                    {/* Desktop */}
                    <div className="hidden sm:grid grid-cols-[1fr_130px_120px_140px_160px_120px_40px] items-center gap-2">
                      <span className="text-sm font-medium text-ink truncate">
                        {customer.name}
                      </span>
                      <span className="text-xs text-gray font-mono">
                        {customer.phone}
                      </span>
                      <span className="text-xs text-gray">{customer.city}</span>
                      <span className="text-sm text-ink">
                        {customer.orderCount}{" "}
                        <span className="text-xs text-gray">
                          order{customer.orderCount !== 1 ? "s" : ""}
                        </span>
                      </span>
                      <span className="text-sm text-ink font-medium">
                        Rs. {customer.totalSpent.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray">
                        {formatDate(customer.lastOrderDate)}
                      </span>
                      <span className="text-gray text-sm">
                        {expanded === customer.phone ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-ink">{customer.name}</span>
                        <span className="text-xs text-gray">{customer.orderCount} orders</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray">
                        <span>{customer.phone} · {customer.city}</span>
                        <span className="font-semibold text-ink">
                          Rs. {customer.totalSpent.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expandable order history */}
                  {expanded === customer.phone && (
                    <CustomerOrders customer={customer} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCustomersPage() {
  return (
    <AdminShell>
      <CustomersContent />
    </AdminShell>
  );
}
