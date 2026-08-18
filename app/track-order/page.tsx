"use client";

import { useState } from "react";
import { getOrderByNumber, getOrdersByCustomerPhone } from "@/lib/orderService";
import type { Order } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

// Detect whether the input looks like an order number (e.g. NK-1001)
// or a phone number — keep heuristic simple per spec.
function isOrderNumber(input: string): boolean {
  return /^[A-Za-z]+-\d+$/.test(input.trim());
}

// ── Status badge ─────────────────────────────────────────────────────────────

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

// ── Status step tracker ───────────────────────────────────────────────────────

const STEPS: Order["status"][] = [
  "Pending", "Confirmed", "Processing", "Dispatched", "Delivered",
];

function StepTracker({ status }: { status: Order["status"] }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 py-3">
        <span className="w-3 h-3 rounded-full bg-rose shrink-0" />
        <p className="text-sm font-semibold text-rose">Order Cancelled</p>
      </div>
    );
  }

  const currentIdx = STEPS.indexOf(status);

  return (
    <div className="w-full overflow-x-auto py-2">
      <div className="flex items-center min-w-max gap-0">
        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const current = idx === currentIdx;
          const future  = idx > currentIdx;

          return (
            <div key={step} className="flex items-center">
              {/* Step dot + label */}
              <div className="flex flex-col items-center gap-1 w-24">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    done
                      ? "bg-ink border-ink"
                      : current
                      ? "bg-rose border-rose"
                      : "bg-ivory border-gray-light"
                  }`}
                >
                  {done && (
                    <svg className="w-2.5 h-2.5 text-ivory" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span
                  className={`text-[10px] text-center leading-tight ${
                    current ? "font-semibold text-ink" : future ? "text-gray" : "text-ink"
                  }`}
                >
                  {step}
                </span>
              </div>

              {/* Connector line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-8 -mt-4 ${
                    idx < currentIdx ? "bg-ink" : "bg-gray-light"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order result card ─────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="border border-gray-light rounded-xl overflow-hidden bg-ivory">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-light flex-wrap">
        <div>
          <p className="font-mono font-bold text-sm text-ink">{order.orderNumber}</p>
          <p className="text-xs text-gray mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Step tracker */}
      <div className="px-5 py-4 border-b border-gray-light">
        <StepTracker status={order.status} />
      </div>

      {/* Items */}
      <div className="px-5 py-4 border-b border-gray-light flex flex-col gap-2">
        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-1">
          Items
        </p>
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between gap-3 text-sm">
            <div>
              <p className="text-ink">{item.name}</p>
              {(item.size || item.color) && (
                <p className="text-xs text-gray">
                  {[item.size, item.color].filter(Boolean).join(" · ")} · ×{item.qty}
                </p>
              )}
            </div>
            <p className="shrink-0 text-ink font-medium">
              Rs. {(item.price * item.qty).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="px-5 py-4 border-b border-gray-light flex flex-col gap-1.5">
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

      {/* Delivery details */}
      <div className="px-5 py-4">
        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
          Delivery To
        </p>
        <div className="text-sm flex flex-col gap-0.5">
          <p className="text-ink font-medium">{order.customer.name}</p>
          <p className="text-gray">{order.customer.phone}</p>
          <p className="text-gray">{order.customer.address}, {order.customer.city}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type SearchState = "idle" | "loading" | "found" | "empty" | "error";

export default function TrackOrderPage() {
  const [input, setInput]     = useState("");
  const [state, setState]     = useState<SearchState>("idle");
  const [results, setResults] = useState<Order[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;

    setState("loading");
    setResults([]);

    try {
      let orders: Order[] = [];

      if (isOrderNumber(query)) {
        // Looks like an order number (e.g. NK-1001)
        const order = await getOrderByNumber(query.toUpperCase());
        if (order) orders = [order];
      } else {
        // Treat as phone number.
        // NOTE: Lookup is exact-string match against stored customer.phone values.
        // If customers enter phone numbers with spaces or country codes at checkout,
        // those would not match — this is a known limitation. Normalisation would
        // require a consistent phone-format strategy at the checkout form layer.
        orders = await getOrdersByCustomerPhone(query);
      }

      if (orders.length === 0) {
        setState("empty");
      } else {
        setResults(orders);
        setState("found");
      }
    } catch (err) {
      console.error("Order lookup failed:", err);
      setState("error");
    }
  }

  return (
    <main className="flex-1 bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* Heading */}
        <div className="text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Track Your Order
          </h1>
          <p className="text-gray text-sm mt-3">
            Enter your order number (e.g. NK-1001) or the phone number you
            used at checkout.
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="NK-1001 or 0771234567"
            className="flex-1 rounded-lg border border-gray-light px-4 py-2.5 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose transition-colors"
          />
          <button
            type="submit"
            disabled={state === "loading" || !input.trim()}
            className="shrink-0 bg-ink text-ivory text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-rose transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {state === "loading" ? "Searching…" : "Track Order"}
          </button>
        </form>

        {/* Results */}
        {state === "empty" && (
          <p className="text-center text-gray text-sm py-8">
            No orders found. Please check your order number or phone number
            and try again.
          </p>
        )}

        {state === "error" && (
          <p className="text-center text-rose text-sm py-8">
            Something went wrong. Please try again.
          </p>
        )}

        {state === "found" && (
          <div className="flex flex-col gap-6">
            {results.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
