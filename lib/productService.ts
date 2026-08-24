import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Product } from "./types";
import { pushNotification } from "./notificationService";

const PRODUCTS_COLLECTION = "products";

// Get all products
export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// Get products by category
export async function getProductsByCategory(
  category: string
): Promise<Product[]> {
  const q = query(
    collection(db, PRODUCTS_COLLECTION),
    where("category", "==", category)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// Get a single product by id
export async function getProductById(id: string): Promise<Product | null> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

// Add a new product
export async function addProduct(
  product: Omit<Product, "id">
): Promise<string> {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product);
  return docRef.id;
}

// Update an existing product
export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(ref, data);

  // Check stock levels after update and push notifications if needed.
  // Only fire when the update actually includes stock-related fields.
  if (data.totalStock !== undefined || data.variants !== undefined) {
    try {
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const product = { id: snap.id, ...snap.data() } as Product;
      const threshold = product.lowStockThreshold ?? 3;

      if (product.totalStock === 0) {
        pushNotification({
          type:     "out_of_stock",
          title:    "Product Out of Stock 🚨",
          message:  `"${product.name}" is now out of stock (SKU: ${product.sku})`,
          linkType: "product",
          linkId:   id,
        }).catch(() => {});
      } else if (product.totalStock <= threshold) {
        pushNotification({
          type:     "low_stock",
          title:    "Low Stock Alert ⚠️",
          message:  `"${product.name}" has only ${product.totalStock} item${product.totalStock === 1 ? "" : "s"} left (SKU: ${product.sku})`,
          linkType: "product",
          linkId:   id,
        }).catch(() => {});
      }
    } catch {
      // Don't break the product save if notification fails
    }
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(ref);
}