import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Order } from "./types";
import { pushNotification } from "./notificationService";

const ORDERS_COLLECTION = "orders";

// Generate a sequential-looking order number like NK-1001, NK-1002
async function generateOrderNumber(): Promise<string> {
  const snapshot = await getCountFromServer(collection(db, ORDERS_COLLECTION));
  const count = snapshot.data().count;
  return `NK-${1001 + count}`;
}

// Create a new order (guest checkout allowed)
// Returns both the Firestore doc ID and the generated order number.
export async function createOrder(
  order: Omit<Order, "id">
): Promise<{ id: string; orderNumber: string }> {
  const orderNumber = await generateOrderNumber();
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...order,
    orderNumber,
  });

  // Notify admins of the new order (fire-and-forget — don't block checkout)
  pushNotification({
    type:     "new_order",
    title:    "New Order Received 🛍️",
    message:  `${order.customer.name} placed order ${orderNumber} — Rs. ${order.total.toLocaleString()}`,
    linkType: "order",
    linkId:   docRef.id,
  }).catch(() => {});

  return { id: docRef.id, orderNumber };
}

// Get all orders, sorted by createdAt descending
export async function getOrders(): Promise<Order[]> {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

// Get a single order by id
export async function getOrderById(id: string): Promise<Order | null> {
  const ref = doc(db, ORDERS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

// Update order status
export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<void> {
  const ref = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(ref, { status });

  // Notify admins of the status change
  const snap = await getDoc(ref);
  const order = snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
  const label = order ? `${order.orderNumber} (${order.customer.name})` : id;

  let type:    Parameters<typeof pushNotification>[0]["type"] = "order_status";
  let title   = `Order ${status} 📋`;
  let message = `Order ${label} changed to ${status}`;

  if (status === "Confirmed") {
    type    = "order_confirmed";
    title   = "Order Confirmed ✅";
    message = `Order ${label} has been confirmed`;
  } else if (status === "Cancelled") {
    type    = "order_cancelled";
    title   = "Order Cancelled ❌";
    message = `Order ${label} was cancelled`;
  }

  pushNotification({ type, title, message, linkType: "order", linkId: id }).catch(() => {});
}

// Get orders by customer phone (for order lookup feature)
export async function getOrdersByCustomerPhone(
  phone: string
): Promise<Order[]> {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("customer.phone", "==", phone),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
}

// Get a single order by orderNumber (e.g. "NK-1001")
export async function getOrderByNumber(
  orderNumber: string
): Promise<Order | null> {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("orderNumber", "==", orderNumber)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() } as Order;
}
