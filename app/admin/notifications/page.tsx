"use client";

import { useRouter } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { useNotifications } from "@/context/NotificationContext";
import type { Notification } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff  = Date.now() - ts;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function typeIcon(type: Notification["type"]): string {
  switch (type) {
    case "new_order":       return "🛍️";
    case "order_confirmed": return "✅";
    case "order_cancelled": return "❌";
    case "order_status":    return "📋";
    case "low_stock":       return "⚠️";
    case "out_of_stock":    return "🚨";
    default:                return "🔔";
  }
}

function typeLabel(type: Notification["type"]): string {
  switch (type) {
    case "new_order":       return "New Order";
    case "order_confirmed": return "Confirmed";
    case "order_cancelled": return "Cancelled";
    case "order_status":    return "Status Change";
    case "low_stock":       return "Low Stock";
    case "out_of_stock":    return "Out of Stock";
    default:                return "Notification";
  }
}

function typeBadgeClass(type: Notification["type"]): string {
  switch (type) {
    case "new_order":       return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "order_confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "order_cancelled": return "bg-rose-light/30 text-rose border-rose/20";
    case "order_status":    return "bg-blue-50 text-blue-700 border-blue-200";
    case "low_stock":       return "bg-amber-50 text-amber-700 border-amber-200";
    case "out_of_stock":    return "bg-rose-light/30 text-rose border-rose/20";
    default:                return "bg-gray-light text-gray border-gray-light";
  }
}

function notifLink(n: Notification): string {
  if (!n.linkType || !n.linkId) return "";
  if (n.linkType === "order")   return `/admin/orders`;
  if (n.linkType === "product") return `/admin/products/${n.linkId}/edit`;
  return "";
}

// ── Page ──────────────────────────────────────────────────────────────────────

function NotificationsContent() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    remove,
    clearAll,
  } = useNotifications();

  async function handleClick(n: Notification) {
    if (!n.read) await markRead(n.id);
    const link = notifLink(n);
    if (link) router.push(link);
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="text-sm text-rose border border-rose/30 rounded-full px-4 py-1.5 hover:bg-rose hover:text-ivory transition-colors"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all notifications?")) clearAll();
              }}
              className="text-sm text-gray border border-gray-light rounded-full px-4 py-1.5 hover:border-rose hover:text-rose transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-light animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <span className="text-5xl">🔔</span>
          <p className="text-ink font-semibold">All caught up!</p>
          <p className="text-sm text-gray">No notifications yet. They will appear here when orders are placed or stock levels change.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
                !n.read
                  ? "bg-rose-light/10 border-rose/20 hover:bg-rose-light/20"
                  : "bg-ivory border-gray-light hover:bg-gray-light/40"
              }`}
              onClick={() => handleClick(n)}
            >
              {/* Icon */}
              <span className="text-2xl shrink-0 mt-0.5">{typeIcon(n.type)}</span>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className={`text-sm font-semibold text-ink ${!n.read ? "" : "opacity-80"}`}>
                    {n.title}
                  </p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeBadgeClass(n.type)}`}>
                    {typeLabel(n.type)}
                  </span>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-rose shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray">{n.message}</p>
                <p className="text-xs text-gray/50 mt-1">{timeAgo(n.createdAt)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                {!n.read && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="text-[11px] text-gray hover:text-rose transition-colors whitespace-nowrap"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => remove(n.id)}
                  className="p-1 rounded text-gray/50 hover:text-rose hover:bg-rose-light/20 transition-colors"
                  aria-label="Delete notification"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AdminShell>
      <NotificationsContent />
    </AdminShell>
  );
}
