"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";
import type { Notification } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
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

function notifLink(n: Notification): string {
  if (!n.linkType || !n.linkId) return "/admin/notifications";
  if (n.linkType === "order")   return `/admin/orders`;
  if (n.linkType === "product") return `/admin/products/${n.linkId}/edit`;
  return "/admin/notifications";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markRead, markAllRead, remove } =
    useNotifications();
  const router          = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef        = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleClick(n: Notification) {
    if (!n.read) await markRead(n.id);
    setOpen(false);
    router.push(notifLink(n));
  }

  const preview = notifications.slice(0, 5);

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-white/70 hover:text-ivory hover:bg-white/10 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        {/* Bell icon */}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose text-ivory text-[10px] font-bold rounded-full px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-ivory rounded-2xl shadow-2xl border border-gray-light z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-light bg-ink">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ivory">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold bg-rose text-ivory px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-[11px] text-white/60 hover:text-ivory transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-white/50 hover:text-ivory transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-light">
            {loading ? (
              <p className="text-sm text-gray text-center py-8 animate-pulse">Loading…</p>
            ) : preview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-3xl">🔔</span>
                <p className="text-sm text-gray">No notifications yet</p>
              </div>
            ) : (
              preview.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-rose-light/20 transition-colors cursor-pointer ${
                    !n.read ? "bg-rose-light/10" : ""
                  }`}
                  onClick={() => handleClick(n)}
                >
                  {/* Icon */}
                  <span className="text-xl shrink-0 mt-0.5">{typeIcon(n.type)}</span>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-semibold text-ink" : "font-medium text-ink/80"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-gray mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray/60 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-rose shrink-0 mt-1.5" />
                  )}

                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(n.id); }}
                    className="shrink-0 text-gray/40 hover:text-rose transition-colors mt-0.5"
                    aria-label="Dismiss"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-light bg-gray-light/20 flex items-center justify-between">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-rose hover:text-ink transition-colors font-medium"
              >
                View all {notifications.length} notifications →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
