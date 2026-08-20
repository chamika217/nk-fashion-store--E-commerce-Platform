import emailjs from "@emailjs/browser";
import type { Order } from "./types";

// EmailJS credentials are read from env vars so real IDs are never hardcoded.
const SERVICE_ID  = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID  ?? "";
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "";
const PUBLIC_KEY  = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY  ?? "";

/**
 * Sends an order confirmation email via EmailJS.
 *
 * - Returns immediately (no-op) if the customer didn't provide an email
 *   address — missing email is not an error.
 * - Catches all EmailJS / network failures internally so that a failed send
 *   never blocks or rolls back the completed order.
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  // Skip silently if no recipient address
  if (!order.customer.email?.trim()) {
    console.log("[EmailJS] Skipped — no customer email address");
    return;
  }

  console.log("[EmailJS] Sending to:", order.customer.email, "Order:", order.orderNumber);
  console.log("[EmailJS] SERVICE_ID:", SERVICE_ID ? "✅ set" : "❌ missing");
  console.log("[EmailJS] TEMPLATE_ID:", TEMPLATE_ID ? "✅ set" : "❌ missing");
  console.log("[EmailJS] PUBLIC_KEY:", PUBLIC_KEY ? "✅ set" : "❌ missing");

  // OrderItem does not carry an image URL — leave image_url as empty string.
  // If the type is extended with images in future, replace "" with item.imageUrl.
  const templateParams = {
    email:    order.customer.email.trim(),
    order_id: order.orderNumber,
    orders:   order.items.map((item) => ({
      name:      item.name,
      units:     item.qty,
      price:     item.price * item.qty,   // line total
      image_url: "",
    })),
    cost: {
      shipping: order.deliveryFee,
      total:    order.total,
    },
  };

  try {
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, {
      publicKey: PUBLIC_KEY,
    });
  } catch (err) {
    // Log a warning but never propagate — email failure must not affect order flow
    console.warn("[EmailJS] Order confirmation email failed:", err);
    if (err && typeof err === "object" && "text" in err) {
      console.warn("[EmailJS] Error detail:", (err as { text: string }).text);
    }
  }
}
