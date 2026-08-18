"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getOrders } from "@/lib/orderService";
import { getProducts } from "@/lib/productService";
import type { Order, Product } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";
import { useAdminAuth } from "@/context/AdminAuthContext";

// ── Date range filter options ─────────────────────────────────────────────────
// Section 1 (summary cards) always shows ALL-TIME totals.
// Sections 2–4 respect the selected date range.
type Range = "7d" | "30d" | "all";

function rangeLabel(r: Range): string {
  return r === "7d" ? "Last 7 days" : r === "30d" ? "Last 30 days" : "All time";
}

function filterByRange(orders: Order[], range: Range): Order[] {
  if (range === "all") return orders;
  const ms = range === "7d" ? 7 * 86400_000 : 30 * 86400_000;
  const cutoff = Date.now() - ms;
  return orders.filter((o) => o.createdAt >= cutoff);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const NON_CANCELLED = (o: Order) => o.status !== "Cancelled";

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short",
  });
}

function formatRs(n: number): string {
  return `Rs. ${Math.round(n).toLocaleString()}`;
}

// Build daily revenue buckets for the last N days
function buildDailyRevenue(orders: Order[], days: number): { label: string; revenue: number }[] {
  const buckets: Record<string, number> = {};
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets[key] = 0;
  }

  orders.filter(NON_CANCELLED).forEach((o) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (key in buckets) buckets[key] += o.total;
  });

  return Object.entries(buckets).map(([key, revenue]) => ({
    label: formatDate(new Date(key).getTime()),
    revenue,
  }));
}

// ── Status colour map ─────────────────────────────────────────────────────────
const STATUS_COLORS: Record<Order["status"], string> = {
  Pending:    "bg-gold",
  Confirmed:  "bg-gray",
  Processing: "bg-rose",
  Dispatched: "bg-sky-400",
  Delivered:  "bg-green-500",
  Cancelled:  "bg-rose/40",
};

const ALL_STATUSES: Order["status"][] = [
  "Pending", "Confirmed", "Processing", "Dispatched", "Delivered", "Cancelled",
];

// ── CSS bar chart ─────────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; revenue: number }[] }) {
  const max = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div className="flex items-end gap-1 h-40 w-full overflow-x-auto pb-1">
      {data.map((d) => {
        const pct = (d.revenue / max) * 100;
        return (
          <div
            key={d.label}
            className="flex flex-col items-center gap-1 flex-1 min-w-[28px] group"
          >
            {/* Bar */}
            <div className="relative w-full flex flex-col justify-end" style={{ height: "128px" }}>
              <div
                className="w-full bg-rose rounded-t-sm transition-all duration-300 group-hover:bg-gold relative"
                style={{ height: `${pct}%` }}
              >
                {/* Tooltip on hover */}
                {d.revenue > 0 && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-ink text-ivory text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    {formatRs(d.revenue)}
                  </div>
                )}
              </div>
            </div>
            {/* X-axis label */}
            <span className="text-[8px] text-gray rotate-45 origin-left translate-x-1 truncate max-w-[28px]">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Horizontal bar ────────────────────────────────────────────────────────────

function HorizBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-gray-light rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function ReportsContent() {
  const { adminProfile }       = useAdminAuth();
  const [orders, setOrders]    = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]  = useState(true);
  const [range, setRange]      = useState<Range>("30d");

  useEffect(() => {
    Promise.all([getOrders(), getProducts()])
      .then(([o, p]) => { setOrders(o); setProducts(p); })
      .finally(() => setLoading(false));
  }, []);

  // ── Owner guard ──────────────────────────────────────────────────────────
  if (adminProfile && adminProfile.role === "staff") {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <p className="text-2xl">🔒</p>
        <p className="font-serif text-xl font-bold text-ink">Access Restricted</p>
        <p className="text-sm text-gray max-w-xs">
          Reports & Analytics are available to store owners only.
        </p>
      </div>
    );
  }

  // ── Section 1: All-time summary (not range-filtered) ─────────────────────
  const activeOrders    = orders.filter(NON_CANCELLED);
  const totalRevenue    = activeOrders.reduce((s, o) => s + o.total, 0);
  const totalOrderCount = orders.length;
  const avgOrderValue   = activeOrders.length ? totalRevenue / activeOrders.length : 0;
  const pendingCount    = orders.filter((o) => o.status === "Pending").length;

  // ── Range-filtered orders for Sections 2–4 ───────────────────────────────
  const rangeOrders = useMemo(() => filterByRange(orders, range), [orders, range]);

  // Section 2: daily bar chart (14 buckets)
  const chartDays = range === "7d" ? 7 : 14;
  const dailyData = useMemo(
    () => buildDailyRevenue(rangeOrders, chartDays),
    [rangeOrders, chartDays]
  );

  // Section 3: best-selling products
  const bestSellers = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    rangeOrders.filter(NON_CANCELLED).forEach((o) => {
      o.items.forEach((item) => {
        const existing = map.get(item.productId);
        if (existing) {
          existing.qty     += item.qty;
          existing.revenue += item.qty * item.price;
        } else {
          map.set(item.productId, {
            name:    item.name,
            qty:     item.qty,
            revenue: item.qty * item.price,
          });
        }
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);
  }, [rangeOrders]);

  // Section 4: status breakdown
  const statusCounts = useMemo(() => {
    return ALL_STATUSES.map((s) => ({
      status: s,
      count:  rangeOrders.filter((o) => o.status === s).length,
    }));
  }, [rangeOrders]);
  const maxStatusCount = Math.max(...statusCounts.map((s) => s.count), 1);

  // Section 5: low stock (all-time, not range-filtered)
  const lowStock = products
    .filter((p) => p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold ?? 3))
    .sort((a, b) => a.totalStock - b.totalStock);

  const outOfStock = products.filter(
    (p) => p.totalStock === 0 || p.status === "out-of-stock"
  );

  // ── Stat card ─────────────────────────────────────────────────────────────
  const StatCard = ({
    label, value, sub,
  }: { label: string; value: string; sub?: string }) => (
    <div className="border border-gray-light rounded-xl p-5 flex flex-col gap-1 bg-ivory">
      <p className="text-xs text-gray uppercase tracking-wider">{label}</p>
      <p className="font-serif text-2xl font-bold text-ink">{value}</p>
      {sub && <p className="text-xs text-gray">{sub}</p>}
    </div>
  );

  // ── Section heading ───────────────────────────────────────────────────────
  const SectionHeading = ({ title }: { title: string }) => (
    <h2 className="font-serif text-lg font-bold text-ink mb-4">{title}</h2>
  );

  if (loading) {
    return <p className="text-sm text-gray py-12 text-center">Loading reports…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-24 flex flex-col items-center gap-3">
        <p className="text-gray">No orders yet.</p>
        <p className="text-xs text-gray">Reports will appear once orders come in.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink">Reports & Analytics</h1>
        <p className="text-xs text-gray mt-1">Summary stats are all-time. Charts and rankings respect the date filter.</p>
      </div>

      {/* ── Section 1: Summary Cards (all-time) ── */}
      <section>
        <SectionHeading title="All-Time Summary" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Revenue"    value={formatRs(totalRevenue)}         sub="excl. cancelled" />
          <StatCard label="Total Orders"     value={String(totalOrderCount)}        />
          <StatCard label="Avg Order Value"  value={formatRs(avgOrderValue)}        sub="excl. cancelled" />
          <StatCard label="Pending Orders"   value={String(pendingCount)}           sub="awaiting action" />
        </div>
      </section>

      {/* ── Date range toggle ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-gray uppercase tracking-wider mr-1">Period:</span>
        {(["7d", "30d", "all"] as Range[]).map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              range === r
                ? "bg-ink text-ivory border-ink"
                : "border-gray-light text-ink hover:border-rose"
            }`}
          >
            {rangeLabel(r)}
          </button>
        ))}
      </div>

      {/* ── Section 2: Sales Over Time ── */}
      <section>
        <SectionHeading title="Revenue Over Time" />
        <div className="border border-gray-light rounded-xl p-5 bg-ivory">
          {dailyData.every((d) => d.revenue === 0) ? (
            <p className="text-sm text-gray text-center py-6">
              No revenue in this period.
            </p>
          ) : (
            <>
              <BarChart data={dailyData} />
              <p className="text-[10px] text-gray mt-3 text-center">
                Hover bars to see daily revenue · Naturally more useful as order history grows
              </p>
            </>
          )}
        </div>
      </section>

      {/* ── Section 3: Best-Selling Products ── */}
      <section>
        <SectionHeading title="Best-Selling Products" />
        {bestSellers.length === 0 ? (
          <p className="text-sm text-gray">No sales in this period.</p>
        ) : (
          <div className="rounded-xl border border-gray-light overflow-hidden">
            <div className="hidden sm:grid grid-cols-[30px_1fr_120px_160px] bg-gray-light/50 px-4 py-3 gap-2 text-xs font-semibold text-gray uppercase tracking-wider">
              <span>#</span>
              <span>Product</span>
              <span className="text-right">Units Sold</span>
              <span className="text-right">Revenue</span>
            </div>
            <div className="divide-y divide-gray-light bg-ivory">
              {bestSellers.map((item, idx) => (
                <div
                  key={item.name + idx}
                  className="grid grid-cols-[30px_1fr_120px_160px] px-4 py-3 gap-2 items-center"
                >
                  <span className="text-xs text-gray font-mono">{idx + 1}</span>
                  <span className="text-sm text-ink font-medium truncate">{item.name}</span>
                  <span className="text-sm text-ink text-right">{item.qty}</span>
                  <span className="text-sm text-rose font-semibold text-right">
                    {formatRs(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Section 4: Order Status Breakdown ── */}
      <section>
        <SectionHeading title="Order Status Breakdown" />
        <div className="border border-gray-light rounded-xl p-5 bg-ivory flex flex-col gap-3">
          {statusCounts.map(({ status, count }) => {
            const pct = Math.round((count / Math.max(rangeOrders.length, 1)) * 100);
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-ink">{status}</span>
                <div className="flex-1">
                  <HorizBar pct={(count / maxStatusCount) * 100} color={STATUS_COLORS[status]} />
                </div>
                <span className="w-20 shrink-0 text-right text-xs text-gray">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Section 5: Low Stock Alerts ── */}
      <section>
        <SectionHeading title="Low Stock Alerts" />
        {lowStock.length === 0 && outOfStock.length === 0 ? (
          <p className="text-sm text-gray">All products are well-stocked.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Low stock */}
            {lowStock.length > 0 && (
              <div className="rounded-xl border border-gold/40 overflow-hidden">
                <div className="bg-gold/10 px-4 py-2 text-xs font-semibold text-gold uppercase tracking-wider">
                  Low Stock ({lowStock.length})
                </div>
                <div className="divide-y divide-gray-light bg-ivory">
                  {lowStock.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3 gap-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{p.name}</p>
                        <p className="text-xs text-gray">
                          Threshold: {p.lowStockThreshold ?? 3}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="text-sm font-bold text-gold">
                          {p.totalStock} left
                        </span>
                        <Link
                          href={`/admin/products/${p.id}/edit`}
                          className="text-xs border border-gray-light rounded-full px-3 py-1 text-ink hover:border-rose hover:text-rose transition-colors"
                        >
                          Restock
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Out of stock note */}
            {outOfStock.length > 0 && (
              <div className="rounded-xl border border-rose/30 overflow-hidden">
                <div className="bg-rose/10 px-4 py-2 text-xs font-semibold text-rose uppercase tracking-wider">
                  Out of Stock ({outOfStock.length})
                </div>
                <div className="divide-y divide-gray-light bg-ivory">
                  {outOfStock.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3 gap-4"
                    >
                      <p className="text-sm font-medium text-ink">{p.name}</p>
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="text-xs border border-rose/30 rounded-full px-3 py-1 text-rose hover:bg-rose hover:text-ivory transition-colors"
                      >
                        Update
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <AdminShell>
      <ReportsContent />
    </AdminShell>
  );
}
