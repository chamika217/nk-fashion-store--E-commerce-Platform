"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { getOrdersByCustomerPhone } from "@/lib/orderService";
import type { Order } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

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

// ── Customer profile shape ────────────────────────────────────────────────────

interface CustomerProfile {
  name: string;
  email: string;
  phone?: string;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useCustomerAuth();

  const [profile, setProfile]   = useState<CustomerProfile | null>(null);
  const [orders, setOrders]     = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account/login");
    }
  }, [loading, user, router]);

  // Fetch customer profile + order history
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "customers", user.uid));
        if (snap.exists()) {
          const data = snap.data() as CustomerProfile;
          setProfile(data);

          // Look up orders by phone if we have one saved
          if (data.phone) {
            setOrdersLoading(true);
            try {
              const o = await getOrdersByCustomerPhone(data.phone);
              setOrders(o);
            } finally {
              setOrdersLoading(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load customer profile:", err);
      }
    }

    loadData();
  }, [user]);

  async function handleLogout() {
    await signOut(auth);
    router.push("/");
  }

  if (loading) {
    return (
      <main className="flex-1 bg-ivory flex items-center justify-center py-24">
        <p className="text-sm text-gray animate-pulse">Loading…</p>
      </main>
    );
  }

  if (!user) return null;

  const displayName = profile?.name || user.email || "Customer";

  return (
    <main className="flex-1 bg-ivory py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-serif text-3xl font-bold text-ink">My Account</h1>
            <p className="text-gray text-sm mt-1">
              Welcome back, {displayName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm border border-gray-light rounded-full px-5 py-2 text-ink hover:border-rose hover:text-rose transition-colors"
          >
            Log Out
          </button>
        </div>

        {/* My Orders */}
        <section>
          <h2 className="font-serif text-xl font-bold text-ink mb-4">My Orders</h2>

          {ordersLoading ? (
            <p className="text-sm text-gray animate-pulse">Loading orders…</p>
          ) : !profile?.phone ? (
            <div className="border border-gray-light rounded-xl p-6 text-center">
              <p className="text-sm text-gray">
                Place your first order to see your order history here.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block bg-ink text-ivory text-sm font-medium px-6 py-2.5 rounded-full hover:bg-rose transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-gray-light rounded-xl p-6 text-center">
              <p className="text-sm text-gray">No orders found yet.</p>
              <Link
                href="/shop"
                className="mt-4 inline-block bg-ink text-ivory text-sm font-medium px-6 py-2.5 rounded-full hover:bg-rose transition-colors"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/order-confirmation/${order.orderNumber}`}
                  className="border border-gray-light rounded-xl px-4 py-4 bg-ivory hover:border-rose transition-colors flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-bold text-ink">
                        {order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <span className="text-xs text-gray">{formatDate(order.createdAt)}</span>
                  </div>
                  <span className="text-sm font-semibold text-rose">
                    Rs. {order.total.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
