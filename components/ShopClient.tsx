"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getProducts } from "@/lib/productService";
import { getCategories } from "@/lib/categoryService";
import type { Product, Category } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface ShopClientProps {
  initialCategory: string; // pre-selected from URL query param
}

const FALLBACK_CATEGORIES: Pick<Category, "name" | "slug">[] = [
  { name: "Women's Wear", slug: "womens-wear" },
  { name: "Men's Wear",   slug: "mens-wear"   },
  { name: "Kids' Wear",   slug: "kids-wear"   },
  { name: "Accessories",  slug: "accessories" },
];

type PriceRange = "all" | "under2k" | "2k-5k" | "above5k";

// ── Helpers ──────────────────────────────────────────────────────────────────

function priceLabel(range: PriceRange): string {
  switch (range) {
    case "under2k":  return "Under Rs. 2,000";
    case "2k-5k":   return "Rs. 2,000 – 5,000";
    case "above5k": return "Above Rs. 5,000";
    default:         return "All Prices";
  }
}

function matchesPrice(price: number, range: PriceRange): boolean {
  if (range === "under2k")  return price < 2000;
  if (range === "2k-5k")   return price >= 2000 && price <= 5000;
  if (range === "above5k") return price > 5000;
  return true;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ShopClient({
  initialCategory,
}: ShopClientProps) {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories]   = useState<Pick<Category, "name" | "slug">[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch products + categories client-side (avoids server-side gRPC issues)
  useEffect(() => {
    Promise.all([getProducts(), getCategories()])
      .then(([prods, cats]) => {
        setAllProducts(prods.filter((p) => p.status !== "hidden"));
        setCategories(cats.length > 0 ? cats : FALLBACK_CATEGORIES);
      })
      .catch(() => {
        setCategories(FALLBACK_CATEGORIES);
      })
      .finally(() => setDataLoading(false));
  }, []);

  const products = allProducts;

  // Derive unique sizes from all product variants
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants?.forEach((v) => v.size && set.add(v.size)));
    return Array.from(set).sort();
  }, [products]);

  // Filter state — seeded from URL query param so navigation always works
  const urlCategory = searchParams.get("category") ?? initialCategory ?? "";
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    urlCategory ? [urlCategory] : []
  );

  // Keep category filter in sync whenever the URL ?category param changes
  // (e.g. user clicks a category from the Home page or the Navbar while
  //  already on the Shop page — useState initialiser only runs once on mount)
  useEffect(() => {
    const cat = searchParams.get("category") ?? "";
    setSelectedCategories(cat ? [cat] : []);
  }, [searchParams]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtered products
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (p.status === "hidden") return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      if (selectedSizes.length > 0) {
        const productSizes = p.variants?.map((v) => v.size) ?? [];
        if (!selectedSizes.some((s) => productSizes.includes(s))) return false;
      }
      if (!matchesPrice(p.price, priceRange)) return false;
      if (inStockOnly && (p.totalStock === 0 || p.status === "out-of-stock")) return false;
      return true;
    });
  }, [products, selectedCategories, selectedSizes, priceRange, inStockOnly]);

  function toggleCategory(name: string) {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  }

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPriceRange("all");
    setInStockOnly(false);
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    priceRange !== "all" ||
    inStockOnly;

  // ── Filter panel (shared by sidebar + mobile drawer) ──────────────────────
  const FilterPanel = (
    <div className="flex flex-col gap-7">
      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
          Category
        </p>
        <ul className="flex flex-col gap-2">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.name)}
                  onChange={() => toggleCategory(cat.name)}
                  className="accent-rose h-4 w-4 rounded"
                />
                <span className="text-sm text-ink group-hover:text-rose transition-colors">
                  {cat.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Size */}
      {allSizes.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
            Size
          </p>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 text-xs rounded border transition-colors ${
                  selectedSizes.includes(size)
                    ? "bg-ink text-ivory border-ink"
                    : "bg-ivory text-ink border-gray-light hover:border-rose"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
          Price
        </p>
        <ul className="flex flex-col gap-2">
          {(["all", "under2k", "2k-5k", "above5k"] as PriceRange[]).map((range) => (
            <li key={range}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === range}
                  onChange={() => setPriceRange(range)}
                  className="accent-rose h-4 w-4"
                />
                <span className="text-sm text-ink group-hover:text-rose transition-colors">
                  {priceLabel(range)}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <div>
        <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
          Availability
        </p>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="accent-rose h-4 w-4 rounded"
          />
          <span className="text-sm text-ink group-hover:text-rose transition-colors">
            In Stock Only
          </span>
        </label>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-xs text-rose underline underline-offset-2 text-left hover:text-ink transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  if (dataLoading) {
    return (
      <p className="text-sm text-gray py-12 text-center animate-pulse">
        Loading products…
      </p>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* ── Mobile filter toggle ── */}
      <div className="md:hidden">
        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="flex items-center gap-2 border border-gray-light rounded-lg px-4 py-2 text-sm text-ink hover:border-rose transition-colors"
        >
          Filters
          <span className="text-xs">{filtersOpen ? "▲" : "▼"}</span>
        </button>
        {filtersOpen && (
          <div className="mt-4 p-4 border border-gray-light rounded-xl bg-ivory">
            {FilterPanel}
          </div>
        )}
      </div>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:block w-56 shrink-0">
        <div className="sticky top-24 p-4 border border-gray-light rounded-xl bg-ivory">
          {FilterPanel}
        </div>
      </aside>

      {/* ── Product grid ── */}
      <div className="flex-1">
        {/* Result count */}
        <p className="text-sm text-gray mb-5">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""}
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <p className="text-gray">No products match your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-rose underline underline-offset-2 hover:text-ink transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group flex flex-col bg-ivory border border-gray-light rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Image */}
                <div className="relative w-full aspect-[3/4] bg-gray-light">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray text-xs">
                      No image
                    </div>
                  )}
                  {/* Out of stock badge */}
                  {(product.totalStock === 0 || product.status === "out-of-stock") && (
                    <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                      <span className="bg-ivory text-ink text-xs font-semibold px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex flex-col gap-1">
                  <p className="text-sm font-medium text-ink line-clamp-2 leading-snug">
                    {product.name}
                  </p>
                  <p className="text-sm text-rose font-semibold">
                    Rs. {product.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
