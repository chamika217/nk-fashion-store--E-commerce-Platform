"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/orderService";
import type { Order } from "@/lib/types";

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = use(params);
  const [order, setOrder] = useState<Order | null | undefined>(undefined);

  useEffect(() => {
    getOrderByNumber(orderNumber)
      .then((o) => setOrder(o))
      .catch(() => setOrder(null));
  }, [orderNumber]);

  if (order === undefined) {
    return (
      <main className="flex-1 bg-ivory flex items-center justify-center py-24">
        <p className="text-sm text-gray animate-pulse">Loading…</p>
      </main>
    );
  }

  if (order === null) {
    notFound();
  }

  const { customer, items, subtotal, deliveryFee, total } = order;

  return (
    <main className="flex-1 bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">

        {/* Success indicator */}
        <div className="w-16 h-16 rounded-full bg-rose-light flex items-center justify-center text-3xl">
          ✓
        </div>

        {/* Heading */}
        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-gray text-sm">
            Your order{" "}
            <span className="font-semibold text-ink">{order.orderNumber}</span>{" "}
            has been received.
          </p>
          <p className="mt-1 text-gray text-sm max-w-sm mx-auto">
            We&apos;ll contact you shortly to confirm delivery. Pay in cash when
            your order arrives.
          </p>
        </div>

        {/* Order summary card */}
        <div className="w-full border border-gray-light rounded-xl p-6 flex flex-col gap-5">
          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Items Ordered
            </p>
            <div className="flex flex-col divide-y divide-gray-light">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${idx}`}
                  className="py-3 flex justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="text-ink font-medium leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray mt-0.5">
                      {item.size} · {item.color} · Qty: {item.qty}
                    </p>
                  </div>
                  <p className="shrink-0 text-ink font-medium">
                    Rs. {(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-col gap-2 border-t border-gray-light pt-4">
            <div className="flex justify-between text-sm text-ink">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-ink">
              <span>Delivery Fee</span>
              <span>Rs. {deliveryFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ink border-t border-gray-light pt-2">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery details */}
          <div className="border-t border-gray-light pt-4">
            <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Delivery Details
            </p>
            <div className="text-sm text-ink flex flex-col gap-1">
              <p>{customer.name}</p>
              <p className="text-gray">{customer.phone}</p>
              {customer.email && <p className="text-gray">{customer.email}</p>}
              <p className="text-gray">{customer.address}</p>
              <p className="text-gray">{customer.city}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/shop"
            className="w-full sm:w-auto bg-ink text-ivory text-sm font-medium px-10 py-3 rounded-full text-center hover:bg-rose transition-colors duration-200"
          >
            Continue Shopping
          </Link>
          <Link href="/" className="text-sm text-gray hover:text-rose transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
