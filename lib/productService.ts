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
}

// Delete a product
export async function deleteProduct(id: string): Promise<void> {
  const ref = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(ref);
}