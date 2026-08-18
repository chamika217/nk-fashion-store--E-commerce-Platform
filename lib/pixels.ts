// ── Global type declarations ──────────────────────────────────────────────────
// Prevents TypeScript errors when referencing window.fbq / window.ttq,
// which are injected at runtime by the pixel loader scripts.

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq?: (...args: any[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ttq?: { track: (event: string, params?: Record<string, unknown>) => void };
  }
}

// ── Pixel helper functions ────────────────────────────────────────────────────
// Each function is a safe no-op if:
//   • The pixel script hasn't loaded (window.fbq / window.ttq undefined)
//   • An ad blocker is present
//   • The corresponding env var is empty (pixel was never initialised)

export function trackViewContent(params: {
  productId: string;
  name: string;
  price: number;
}): void {
  try {
    window.fbq?.("track", "ViewContent", {
      content_ids:  [params.productId],
      content_name: params.name,
      content_type: "product",
      value:        params.price,
      currency:     "LKR",
    });
    window.ttq?.track("ViewContent", {
      content_id:   params.productId,
      content_name: params.name,
      price:        params.price,
      currency:     "LKR",
    });
  } catch {
    // Silently ignore — tracking must never break the UI
  }
}

export function trackAddToCart(params: {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}): void {
  try {
    window.fbq?.("track", "AddToCart", {
      content_ids:  [params.productId],
      content_name: params.name,
      content_type: "product",
      value:        params.price * params.quantity,
      currency:     "LKR",
      num_items:    params.quantity,
    });
    window.ttq?.track("AddToCart", {
      content_id:   params.productId,
      content_name: params.name,
      quantity:     params.quantity,
      price:        params.price,
      currency:     "LKR",
    });
  } catch {
    // Silently ignore
  }
}

export function trackPurchase(params: {
  orderNumber: string;
  total: number;
  items: { productId: string; name: string; price: number; quantity: number }[];
}): void {
  try {
    window.fbq?.("track", "Purchase", {
      content_ids:  params.items.map((i) => i.productId),
      content_type: "product",
      value:        params.total,
      currency:     "LKR",
      num_items:    params.items.reduce((s, i) => s + i.quantity, 0),
      order_id:     params.orderNumber,
    });
    // TikTok's purchase-equivalent event is "CompletePayment"
    window.ttq?.track("CompletePayment", {
      order_id: params.orderNumber,
      value:    params.total,
      currency: "LKR",
      contents: params.items.map((i) => ({
        content_id:   i.productId,
        content_name: i.name,
        quantity:     i.quantity,
        price:        i.price,
      })),
    });
  } catch {
    // Silently ignore
  }
}
