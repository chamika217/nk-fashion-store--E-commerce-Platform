/**
 * One-off seed script for the categories collection.
 *
 * Run from an admin context (e.g. paste into a temporary admin page action,
 * or call seedCategories() from a server action / API route that is
 * protected behind auth).  Never expose this in a public route.
 *
 * Usage:
 *   import { seedCategories } from "@/lib/seedCategories";
 *   await seedCategories();
 */

import { addCategory } from "./categoryService";
import type { Category } from "./types";

const SEED_CATEGORIES: Omit<Category, "id">[] = [
  {
    name: "Women's Wear",
    slug: "womens-wear",
    subcategories: ["Dresses", "Tops", "Bottoms", "Ethnic Wear"],
    order: 1,
  },
  {
    name: "Men's Wear",
    slug: "mens-wear",
    subcategories: ["Shirts", "T-Shirts", "Bottoms"],
    order: 2,
  },
  {
    name: "Kids' Wear",
    slug: "kids-wear",
    subcategories: ["Girls", "Boys"],
    order: 3,
  },
  {
    name: "Accessories",
    slug: "accessories",
    subcategories: ["Bags", "Jewelry", "Footwear"],
    order: 4,
  },
];

export async function seedCategories(): Promise<void> {
  for (const category of SEED_CATEGORIES) {
    const id = await addCategory(category);
    console.log(`Seeded category "${category.name}" with id: ${id}`);
  }
  console.log("Category seeding complete.");
}
