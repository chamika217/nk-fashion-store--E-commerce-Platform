"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/productService";
import { getCategories } from "@/lib/categoryService";
import type { Category, Product } from "@/lib/types";

// Redesigned Home Page Components
import HeroShowcase from "./home/HeroShowcase";
import TrustFeatures from "./home/TrustFeatures";
import CategoryBento from "./home/CategoryBento";
import NewArrivalsSection from "./home/NewArrivalsSection";
import CraftsmanshipSpotlight from "./home/CraftsmanshipSpotlight";
import PromoBannerSection from "./home/PromoBannerSection";
import BestSellersSection from "./home/BestSellersSection";
import CustomerReviews from "./home/CustomerReviews";
import VipNewsletter from "./home/VipNewsletter";
import AnimatedCtaStrip from "./home/AnimatedCtaStrip";

const FALLBACK_CATEGORIES: Pick<Category, "name" | "slug">[] = [
  { name: "Men's Footwear & Wear",   slug: "mens-wear"   },
  { name: "Women's Footwear & Wear", slug: "womens-wear" },
  { name: "Kids' Footwear & Wear",   slug: "kids-wear"   },
  { name: "Accessories & Bags",      slug: "accessories" },
];

export default function HomeClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Pick<Category, "name" | "slug">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setProducts(prods.filter((p) => p.status !== "hidden"));
        setCategories(cats.length > 0 ? cats : FALLBACK_CATEGORIES);
      })
      .catch(() => {
        setCategories(FALLBACK_CATEGORIES);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex flex-col flex-1 w-full bg-ivory">
      {/* ── 1. Hero Showcase Section ── */}
      <HeroShowcase />

      {/* ── 2. Trust Pillars & Service Guarantees ── */}
      <TrustFeatures />

      {/* ── 3. Bento Category Showcase (Men, Women, Kids, Sale) ── */}
      <CategoryBento categories={categories} />

      {/* ── 4. Interactive New Arrivals with Tabs & Quick Actions ── */}
      <NewArrivalsSection products={products} loading={loading} />

      {/* ── 5. Craftsmanship & Comfort Engineering Spotlight ── */}
      <CraftsmanshipSpotlight />

      {/* ── 6. Flash Drop Promo Banner with Live Countdown & Voucher ── */}
      <PromoBannerSection />

      {/* ── 7. Best Sellers & Top Rated Leaderboard ── */}
      <BestSellersSection products={products} loading={loading} />

      {/* ── 8. Verified Customer Reviews & Testimonials ── */}
      <CustomerReviews />

      {/* ── 9. VIP Club Newsletter Signup ── */}
      <VipNewsletter />

      {/* ── 10. Continuous Marquee Ticker ── */}
      <AnimatedCtaStrip />
    </main>
  );
}
