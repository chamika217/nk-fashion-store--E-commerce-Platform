import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Category } from "./types";

const CATEGORIES_COLLECTION = "categories";

// Get all categories, ordered by the order field
export async function getCategories(): Promise<Category[]> {
  const q = query(
    collection(db, CATEGORIES_COLLECTION),
    orderBy("order", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
}

// Add a new category
export async function addCategory(
  category: Omit<Category, "id">
): Promise<string> {
  const docRef = await addDoc(
    collection(db, CATEGORIES_COLLECTION),
    category
  );
  return docRef.id;
}

// Update an existing category
export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<void> {
  const ref = doc(db, CATEGORIES_COLLECTION, id);
  await updateDoc(ref, data);
}

// Delete a category
export async function deleteCategory(id: string): Promise<void> {
  const ref = doc(db, CATEGORIES_COLLECTION, id);
  await deleteDoc(ref);
}
