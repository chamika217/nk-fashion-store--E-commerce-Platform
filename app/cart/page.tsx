"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

// NOTE: Guest checkout was intentionally removed. Adding to cart and viewing
// the cart now requires a signed-in customer account. Do not revert this
// without a deliberate product decision to re-allow guest checkout.

export default function CartPage() {
  const { cartItems, cartTotal, updateQty, removeFromCart } = useCart();
  const { user, loading } = useCustomerAuth();

  // While auth is resolving, avoid flash
  if (loading) {
    return (
      <main className="flex-1 bg-ivory flex items-center justify-center py-24">
        <p className="text-sm text-gray animate-pulse">Loading…</p>
      </main>
    );
  }

  // Not signed in — show login prompt (defense in depth)
  if (!user) {
    return (
      <main className="flex-1 bg-ivory flex flex-col items-center justify-center gap-5 px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Your Cart</h1>
        <p className="text-gray text-sm max-w-xs">
          Please log in to view your cart and proceed to checkout.
        </p>
        <Link
          href="/account/login?redirect=/cart"
          className="bg-ink text-ivory text-sm font-medium px-8 py-3 rounded-full hover:bg-rose transition-colors duration-200"
        >
          Log In
        </Link>
        <Link
          href="/account/signup?redirect=/cart"
          className="text-xs text-gray hover:text-rose transition-colors"
        >
          Don&apos;t have an account? Sign up
        </Link>
      </main>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <main className="flex-1 bg-ivory flex flex-col items-center justify-center gap-5 px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-ink">Your Cart</h1>
        <p className="text-gray">Your cart is empty.</p>
        <Link
          href="/shop"
          className="bg-ink text-ivory text-sm font-medium px-8 py-3 rounded-full hover:bg-rose transition-colors duration-200"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  // ── Cart with items ───────────────────────────────────────────────────────
  return (
    <main className="flex-1 bg-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-ink mb-8">
          Your Cart
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Line items ── */}
          <div className="flex-1 flex flex-col divide-y divide-gray-light">
            {cartItems.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="py-5 flex gap-4"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-24 shrink-0 rounded-lg overflow-hidden border border-gray-light bg-gray-light">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray text-xs">
                      —
                    </div>
                  )}
                </div>

                {/* Details + controls */}
                <div className="flex-1 flex flex-col gap-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-ink leading-snug line-clamp-2">
                      {item.name}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      aria-label="Remove item"
                      className="shrink-0 text-gray hover:text-rose transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <p className="text-xs text-gray">
                    {item.size} · {item.color}
                  </p>

                  <div className="flex items-center justify-between gap-3 mt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.productId, item.size, item.color, item.qty - 1)}
                        disabled={item.qty <= 1}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-light text-ink hover:border-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-sm text-ink">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.size, item.color, item.qty + 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-light text-ink hover:border-rose transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-rose">
                      Rs. {(item.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order summary panel ── */}
          <div className="lg:w-72 shrink-0">
            <div className="sticky top-24 border border-gray-light rounded-xl p-6 flex flex-col gap-4 bg-ivory">
              <h2 className="font-serif text-lg font-bold text-ink">Order Summary</h2>

              <div className="flex justify-between text-sm text-ink">
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>

              <p className="text-xs text-gray leading-relaxed">
                Delivery fee calculated at checkout.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <Link
                  href="/checkout"
                  className="bg-ink text-ivory text-sm font-medium text-center py-3 rounded-full hover:bg-rose transition-colors duration-200"
                >
                  Proceed to Checkout
                </Link>
                <Link
                  href="/shop"
                  className="text-sm text-center text-gray hover:text-rose transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
