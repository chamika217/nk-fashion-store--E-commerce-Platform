"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/productService";
import { getCategories } from "@/lib/categoryService";
import type { Category, Product } from "@/lib/types";

// Animated components
import AnimatedHero from "./home/AnimatedHero";
import AnimatedCategoryGrid from "./home/AnimatedCategoryGrid";
import BrandPhilosophy from "./home/BrandPhilosophy";
import AnimatedProductGrid from "./home/AnimatedProductGrid";
import AnimatedCtaStrip from "./home/AnimatedCtaStrip";

const FALLBACK_CATEGORIES: Pick<Category, "name" | "slug">[] = [
  { name: "Women's Wear", slug: "womens-wear" },
  { name: "Men's Wear",   slug: "mens-wear"   },
  { name: "Kids' Wear",   slug: "kids-wear"   },
  { name: "Accessories",  slug: "accessories" },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function HomeClient() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Pick<Category, "name" | "slug">[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods.filter((p) => p.status !== "hidden").slice(0, 8));
        setCategories(cats.length > 0 ? cats : FALLBACK_CATEGORIES);
      })
      .catch(() => {
        setCategories(FALLBACK_CATEGORIES);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = products;

  return (
    <main className="flex flex-col flex-1">
      {/* ── Section 1: Hero ── */}
      <AnimatedHero />

      {/* ── Section 2: Category Shortcuts ── */}
      <AnimatedCategoryGrid categories={categories} />

      {/* ── Section 3: Brand Philosophy / Trust indicators ── */}
      <BrandPhilosophy />

      {/* ── Section 4: Featured Products ── */}
      <AnimatedProductGrid products={featuredProducts} loading={loading} />

      {/* ── Section 5: CTA Strip ── */}
      <AnimatedCtaStrip />
    </main>
  );
}

