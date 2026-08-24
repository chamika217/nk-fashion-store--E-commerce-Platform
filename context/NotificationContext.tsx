"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  subscribeToNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "@/lib/notificationService";
import type { Notification } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markRead:     (id: string) => Promise<void>;
  markAllRead:  () => Promise<void>;
  remove:       (id: string) => Promise<void>;
  clearAll:     () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAdminAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);

  // Wait for auth to resolve, then subscribe only when admin is signed in.
  // Without checking authLoading we would see user=null briefly on mount
  // and never re-subscribe once auth resolves.
  useEffect(() => {
    // Auth still initialising — keep loading state, don't subscribe yet
    if (authLoading) return;

    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeToNotifications(
      (data) => {
        setNotifications(data);
        setLoading(false);
      },
      (err) => {
        console.error("[NotificationContext] Subscription error:", err.message);
        setNotifications([]);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user, authLoading]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead    = useCallback((id: string) => markAsRead(id), []);
  const markAllRead = useCallback(() => markAllAsRead(), []);
  const remove      = useCallback((id: string) => deleteNotification(id), []);
  const clearAll    = useCallback(() => clearAllNotifications(), []);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, markRead, markAllRead, remove, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationProvider>");
  return ctx;
}
