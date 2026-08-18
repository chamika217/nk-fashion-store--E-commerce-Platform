"use client";

import { useState, useEffect, useMemo } from "react";
import { getOrders, updateOrderStatus } from "@/lib/orderService";
import type { Order } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Order["status"][] = [
  "Pending", "Confirmed", "Processing", "Dispatched", "Delivered", "Cancelled",
];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Color-coded status badge using existing palette + minimal extras
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

// ── Expanded order row ────────────────────────────────────────────────────────

function OrderDetail({
  order,
  onStatusChange,
}: {
  order: Order;
  onStatusChange: (id: string, status: Order["status"]) => void;
}) {
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveErr, setSaveErr]   = useState("");

  async function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Order["status"];
    setSaving(true);
    setSaved(false);
    setSaveErr("");
    try {
      await updateOrderStatus(order.id, newStatus);
      onStatusChange(order.id, newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaveErr("Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  const inp =
    "rounded-lg border border-gray-light px-3 py-1.5 text-sm text-ink bg-ivory focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

  return (
    <div className="bg-gray-light/30 border-t border-gray-light px-4 py-5 flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Items */}
        <div>
          <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Items</p>
          <div className="flex flex-col gap-1.5">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between gap-2 text-sm">
                <span className="text-ink">
                  {item.name}{" "}
                  <span className="text-gray text-xs">({item.size} · {item.color} · ×{item.qty})</span>
                </span>
                <span className="shrink-0 text-ink">Rs. {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-3 flex flex-col gap-1 border-t border-gray-light pt-3">
            <div className="flex justify-between text-xs text-gray">
              <span>Subtotal</span>
              <span>Rs. {order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-gray">
              <span>Delivery Fee</span>
              <span>Rs. {order.deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-ink">
              <span>Total</span>
              <span>Rs. {order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery + Status */}
        <div className="flex flex-col gap-4">
          {/* Delivery details */}
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Delivery</p>
            <div className="text-sm flex flex-col gap-0.5">
              <p className="text-ink font-medium">{order.customer.name}</p>
              <p className="text-gray">{order.customer.phone}</p>
              {order.customer.email && <p className="text-gray">{order.customer.email}</p>}
              <p className="text-gray">{order.customer.address}</p>
              <p className="text-gray">{order.customer.city}</p>
            </div>
          </div>

          {/* Status change */}
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Update Status</p>
            <select
              value={order.status}
              onChange={handleStatus}
              disabled={saving}
              className={inp}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {saved   && <p className="text-xs text-green-600 mt-1">Status updated ✓</p>}
            {saveErr && <p className="text-xs text-rose mt-1">{saveErr}</p>}
            {saving  && <p className="text-xs text-gray mt-1 animate-pulse">Saving…</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

function OrdersContent() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<Order["status"] | "All">("All");
  const [expanded, setExpanded]   = useState<string | null>(null);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  function handleStatusChange(id: string, status: Order["status"]) {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
  }

  const filtered = useMemo(() => {
    let list = orders;
    if (filter !== "All") list = list.filter((o) => o.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q)
      );
    }
    return list;
  }, [orders, filter, search]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-serif text-2xl font-bold text-ink">Orders</h1>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, name, phone…"
          className="w-full sm:w-72 rounded-lg border border-gray-light px-3 py-2 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as Order["status"] | "All")}
          className="rounded-lg border border-gray-light px-3 py-2 text-sm text-ink bg-ivory focus:outline-none focus:ring-2 focus:ring-rose transition-colors"
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray py-12 text-center">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray py-20">No orders yet.</p>
      ) : (
        <div className="rounded-xl border border-gray-light overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[130px_1fr_120px_120px_130px_40px] bg-gray-light/50 text-xs text-gray uppercase tracking-wider px-4 py-3 gap-2">
            <span>Order #</span>
            <span>Customer</span>
            <span>Date</span>
            <span className="text-right">Total</span>
            <span>Status</span>
            <span />
          </div>

          <div className="divide-y divide-gray-light bg-ivory">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray text-center py-10">
                No orders match your filters.
              </p>
            ) : (
              filtered.map((order) => (
                <div key={order.id}>
                  {/* Row */}
                  <button
                    onClick={() =>
                      setExpanded((prev) =>
                        prev === order.id ? null : order.id
                      )
                    }
                    className="w-full text-left px-4 py-3 hover:bg-rose-light/20 transition-colors"
                  >
                    {/* Desktop layout */}
                    <div className="hidden sm:grid grid-cols-[130px_1fr_120px_120px_130px_40px] items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-ink">
                        {order.orderNumber}
                      </span>
                      <span className="text-sm text-ink truncate">
                        {order.customer.name}
                      </span>
                      <span className="text-xs text-gray">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="text-sm text-ink text-right">
                        Rs. {order.total.toLocaleString()}
                      </span>
                      <span>
                        <StatusBadge status={order.status} />
                      </span>
                      <span className="text-gray text-sm">
                        {expanded === order.id ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Mobile layout */}
                    <div className="sm:hidden flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-ink">
                          {order.orderNumber}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-ink">{order.customer.name}</p>
                      <div className="flex items-center justify-between text-xs text-gray">
                        <span>{formatDate(order.createdAt)}</span>
                        <span className="font-semibold text-ink">
                          Rs. {order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expandable detail */}
                  {expanded === order.id && (
                    <OrderDetail
                      order={order}
                      onStatusChange={handleStatusChange}
                    />
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

export default function AdminOrdersPage() {
  return (
    <AdminShell>
      <OrdersContent />
    </AdminShell>
  );
}
