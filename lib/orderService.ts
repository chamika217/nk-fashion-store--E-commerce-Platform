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
