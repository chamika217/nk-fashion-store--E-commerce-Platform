"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { createOrder } from "@/lib/orderService";
import { sendOrderConfirmationEmail } from "@/lib/sendOrderEmail";
import { trackPurchase } from "@/lib/pixels";
import { getStoreSettings } from "@/lib/settingsService";

// TODO: Replace with a value fetched from the "settings" collection in Firestore
// once an admin settings page is built.
const DELIVERY_FEE = 350;

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Full name is required.";
  if (!form.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{7,15}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number (digits only).";
  }
  if (!form.address.trim()) errors.address = "Delivery address is required.";
  if (!form.city.trim()) errors.city = "City is required.";
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useCustomerAuth();

  const [deliveryFee, setDeliveryFee] = useState(350);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
  });
  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load delivery fee from Firestore settings
  useEffect(() => {
    getStoreSettings().then((s) => setDeliveryFee(s.deliveryFee)).catch(() => {});
  }, []);

  // Redirect to cart if empty (runs after hydration)
  useEffect(() => {
    if (cartItems.length === 0) {
      router.replace("/cart");
    }
  }, [cartItems.length, router]);

  // Redirect guests to login — checkout requires authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/account/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  // Pre-fill form from logged-in customer profile (convenience only — form stays editable)
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "customers", user.uid))
      .then((snap) => {
        if (!snap.exists()) return;
        const data = snap.data() as { name?: string; email?: string; phone?: string };
        setForm((prev) => ({
          ...prev,
          name:  data.name  ?? prev.name,
          email: data.email ?? prev.email,
          phone: data.phone ?? prev.phone,
        }));
      })
      .catch(() => {/* pre-fill failure is non-critical */});
  }, [user]);

  // Don't render until we know cart has items (avoids flash)
  if (cartItems.length === 0) return null;

  // Don't render while auth is resolving or if user is not logged in
  // (the useEffect above will redirect guests to login)
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center text-sm text-gray">
        Loading…
      </div>
    );
  }

  const subtotal = cartTotal;
  const total = subtotal + DELIVERY_FEE;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the field error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        orderNumber: "",
        customer: {
          name:    form.name.trim(),
          phone:   form.phone.trim(),
          email:   form.email.trim() || undefined,
          address: form.address.trim(),
          city:    form.city.trim(),
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          name:      item.name,
          size:      item.size,
          color:     item.color,
          qty:       item.qty,
          price:     item.price,
        })),
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        paymentMethod: "COD" as const,
        isPaid:        false,
        status:        "Pending" as const,
        createdAt:     Date.now(),
      };

      const { orderNumber } = await createOrder(orderData);

      // Fire pixel purchase event
      trackPurchase({
        orderNumber,
        total,
        items: orderData.items.map((item) => ({
          productId: item.productId,
          name:      item.name,
          price:     item.price,
          quantity:  item.qty,
        })),
      });

      // Fire-and-forget confirmation email — helper catches its own errors,
      // so a slow/failed send never blocks the redirect.
      sendOrderConfirmationEmail({ ...orderData, id: "", orderNumber }).catch(() => {});

      // If customer is logged in, save their phone to profile for order history lookup.
      // Guest checkout is unaffected — this block is skipped entirely for guests.
      if (user) {
        setDoc(
          doc(db, "customers", user.uid),
          { phone: orderData.customer.phone },
          { merge: true }
        ).catch(() => {/* non-critical — silent fail */});
      }

      clearCart();
      router.push(`/order-confirmation/${orderNumber}`);
    } catch (err) {
      console.error("Order placement failed:", err);
      setSubmitError(
        "Something went wrong placing your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ── Shared input class ───────────────────────────────────────────────────
  const inputBase =
    "w-full rounded-lg border px-4 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors";

  return (
    <main className="flex-1 bg-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="font-serif text-3xl font-bold text-ink mb-8">
          Checkout
        </h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* ── Left: Delivery Details ── */}
            <div className="flex flex-col gap-5">
              <h2 className="font-serif text-xl font-bold text-ink">
                Delivery Details
              </h2>

              {!user && (
                <div className="bg-rose-light/25 border border-rose-light/50 rounded-xl p-4 text-xs sm:text-sm text-ink">
                  <span className="font-semibold text-rose">Returning Customer? </span>
                  <Link href="/account/login?redirect=/checkout" className="underline font-semibold hover:text-rose transition-colors">
                    Log in here
                  </Link> for a faster checkout with auto-filled profile info.
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Full Name <span className="text-rose">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nimal Karunaratne"
                  className={`${inputBase} ${errors.name ? "border-rose" : "border-gray-light"}`}
                />
                {errors.name && (
                  <p className="text-xs text-rose">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Phone Number <span className="text-rose">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="0771234567"
                  className={`${inputBase} ${errors.phone ? "border-rose" : "border-gray-light"}`}
                />
                {errors.phone && (
                  <p className="text-xs text-rose">{errors.phone}</p>
                )}
              </div>

              {/* Email (optional) */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Email{" "}
                  <span className="text-gray font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nimal@example.com"
                  className={`${inputBase} border-gray-light`}
                />
              </div>

              {/* Address */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  Delivery Address <span className="text-rose">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  placeholder="No. 12, Galle Road, Colombo 03"
                  className={`${inputBase} resize-none ${errors.address ? "border-rose" : "border-gray-light"}`}
                />
                {errors.address && (
                  <p className="text-xs text-rose">{errors.address}</p>
                )}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-ink uppercase tracking-wider">
                  City <span className="text-rose">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Colombo"
                  className={`${inputBase} ${errors.city ? "border-rose" : "border-gray-light"}`}
                />
                {errors.city && (
                  <p className="text-xs text-rose">{errors.city}</p>
                )}
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-ink text-ivory text-sm font-medium py-3 rounded-full hover:bg-rose transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? "Placing order…" : "Place Order (Cash on Delivery)"}
                </button>
                {submitError && (
                  <p className="text-xs text-rose text-center">{submitError}</p>
                )}
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div>
              <div className="sticky top-24 border border-gray-light rounded-xl p-6 flex flex-col gap-4 bg-ivory">
                <h2 className="font-serif text-xl font-bold text-ink">
                  Order Summary
                </h2>

                {/* Items list (read-only) */}
                <div className="flex flex-col divide-y divide-gray-light">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
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

                {/* Totals */}
                <div className="flex flex-col gap-2 pt-1 border-t border-gray-light">
                  <div className="flex justify-between text-sm text-ink">
                    <span>Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-ink">
                    <span>Delivery Fee</span>
                    <span>Rs. {DELIVERY_FEE.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-ink pt-1 border-t border-gray-light">
                    <span>Total</span>
                    <span>Rs. {total.toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-gray text-center pt-1">
                  Pay in cash when your order is delivered.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
