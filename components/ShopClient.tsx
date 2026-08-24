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
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    searchParams.get("sub") ?? ""
  );
  const [sortMode, setSortMode] = useState<string>(
    searchParams.get("sort") ?? ""
  );
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(
    searchParams.get("onSale") === "true"
  );

  // Keep all URL-driven filters in sync when the URL changes
  // (e.g. user clicks a category/sub/sort link while already on the Shop page)
  useEffect(() => {
    const cat  = searchParams.get("category") ?? "";
    const sub  = searchParams.get("sub") ?? "";
    const sort = searchParams.get("sort") ?? "";
    const sale = searchParams.get("onSale") === "true";
    setSelectedCategories(cat ? [cat] : []);
    setSelectedSubcategory(sub);
    setSortMode(sort);
    setOnSaleOnly(sale);
  }, [searchParams]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (p.status === "hidden") return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
      // Subcategory filter — matches product.subcategory (case-insensitive)
      if (selectedSubcategory) {
        const sub = selectedSubcategory.toLowerCase();
        if (!p.subcategory || p.subcategory.toLowerCase() !== sub) return false;
      }
      if (selectedSizes.length > 0) {
        const productSizes = p.variants?.map((v) => v.size) ?? [];
        if (!selectedSizes.some((s) => productSizes.includes(s))) return false;
      }
      if (!matchesPrice(p.price, priceRange)) return false;
      if (inStockOnly && (p.totalStock === 0 || p.status === "out-of-stock")) return false;
      // onSale: show only in-stock products when onSale param is set
      // (no dedicated sale field in the data model — shows available items)
      if (onSaleOnly && (p.totalStock === 0 || p.status === "out-of-stock")) return false;
      return true;
    });

    // Sort
    if (sortMode === "new") {
      result = [...result].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    } else if (sortMode === "popular") {
      // No real popularity metric — keep server order (which is creation order)
      // but put in-stock items first so "Best Sellers" shows available stock
      result = [...result].sort((a, b) => {
        const aIn = a.totalStock > 0 ? 0 : 1;
        const bIn = b.totalStock > 0 ? 0 : 1;
        return aIn - bIn;
      });
    }

    return result;
  }, [products, selectedCategories, selectedSubcategory, selectedSizes, priceRange, inStockOnly, onSaleOnly, sortMode]);

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
    setSelectedSubcategory("");
    setSelectedSizes([]);
    setPriceRange("all");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setSortMode("");
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    !!selectedSubcategory ||
    selectedSizes.length > 0 ||
    priceRange !== "all" ||
    inStockOnly ||
    onSaleOnly ||
    !!sortMode;

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
        {/* Active filter badges — shows what's currently applied from the URL */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {selectedCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1 text-xs bg-rose-light/30 text-rose px-3 py-1 rounded-full border border-rose/20">
                {cat}
                <button onClick={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))} aria-label={`Remove ${cat}`} className="hover:text-ink ml-0.5">×</button>
              </span>
            ))}
            {selectedSubcategory && (
              <span className="inline-flex items-center gap-1 text-xs bg-rose-light/30 text-rose px-3 py-1 rounded-full border border-rose/20">
                {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory("")} aria-label="Remove subcategory" className="hover:text-ink ml-0.5">×</button>
              </span>
            )}
            {sortMode === "new" && (
              <span className="inline-flex items-center gap-1 text-xs bg-ink/10 text-ink px-3 py-1 rounded-full border border-ink/20">
                ✨ New Arrivals
                <button onClick={() => setSortMode("")} aria-label="Remove sort" className="hover:text-rose ml-0.5">×</button>
              </span>
            )}
            {sortMode === "popular" && (
              <span className="inline-flex items-center gap-1 text-xs bg-ink/10 text-ink px-3 py-1 rounded-full border border-ink/20">
                🔥 Best Sellers
                <button onClick={() => setSortMode("")} aria-label="Remove sort" className="hover:text-rose ml-0.5">×</button>
              </span>
            )}
            {onSaleOnly && (
              <span className="inline-flex items-center gap-1 text-xs bg-gold/10 text-gold px-3 py-1 rounded-full border border-gold/20">
                🏷️ Sale
                <button onClick={() => setOnSaleOnly(false)} aria-label="Remove sale filter" className="hover:text-ink ml-0.5">×</button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-gray hover:text-rose underline underline-offset-2 transition-colors ml-1">
              Clear all
            </button>
          </div>
        )}

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
