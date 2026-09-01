"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Eye,
  Check,
  Star,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

interface NewArrivalsSectionProps {
  products: Product[];
  loading: boolean;
}

const TABS = [
  { id: "all", label: "All Drops" },
  { id: "mens", label: "Men's Shoes & Wear" },
  { id: "womens", label: "Women's Collection" },
  { id: "kids", label: "Kids & Accessories" },
];

export default function NewArrivalsSection({
  products,
  loading,
}: NewArrivalsSectionProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const reduce = useReducedMotion();

  // Filter products by active tab
  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products.slice(0, 8);
    if (activeTab === "mens") {
      return products
        .filter((p) => p.category.toLowerCase().includes("men"))
        .slice(0, 8);
    }
    if (activeTab === "womens") {
      return products
        .filter((p) => p.category.toLowerCase().includes("women"))
        .slice(0, 8);
    }
    if (activeTab === "kids") {
      return products
        .filter(
          (p) =>
            p.category.toLowerCase().includes("kid") ||
            p.category.toLowerCase().includes("access")
        )
        .slice(0, 8);
    }
    return products.slice(0, 8);
  }, [products, activeTab]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    const firstVariant = product.variants?.[0] || {
      size: "Standard",
      color: "Default",
      stock: product.totalStock,
    };

    addToCart({
      productId: product.id,
      name: product.name,
      size: firstVariant.size,
      color: firstVariant.color,
      price: product.price,
      image: product.images?.[0] || "",
      qty: 1,
    });

    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const handleToggleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  return (
    <section className="bg-ivory py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-light/60">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header with Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Off The Workshop</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              New Arrivals
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-white border border-gray-light/60 shadow-2xs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-ink text-ivory shadow-xs"
                    : "text-gray-600 hover:text-ink hover:bg-gray-light/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col rounded-3xl bg-white border border-gray-light/40 overflow-hidden animate-pulse"
              >
                <div className="aspect-[3/4] bg-neutral-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-3/4" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-gray-light/60 p-8">
            <p className="font-serif text-xl font-bold text-ink">
              New drops coming soon in this collection
            </p>
            <p className="text-sm text-gray">
              Check out all available footwear and clothing in our shop.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-ivory text-xs font-bold uppercase tracking-wider hover:bg-rose transition-colors"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7"
          >
            <AnimatePresence>
              {filteredProducts.map((product, idx) => {
                const wishlisted = isInWishlist(product.id);
                const isOutOfStock =
                  product.totalStock === 0 || product.status === "out-of-stock";
                const isLowStock =
                  !isOutOfStock &&
                  product.totalStock > 0 &&
                  product.totalStock <= (product.lowStockThreshold ?? 3);
                const isJustAdded = addedProductId === product.id;

                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    className="group flex flex-col bg-white rounded-3xl border border-gray-light/60 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 relative"
                  >
                    <Link
                      href={`/product/${product.id}`}
                      className="flex flex-col h-full"
                    >
                      {/* Image Container with secondary hover image */}
                      <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
                        {product.images?.[0] ? (
                          <>
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className={`object-cover transition-all duration-700 ease-out ${
                                product.images?.[1]
                                  ? "group-hover:opacity-0"
                                  : "group-hover:scale-105"
                              }`}
                            />
                            {product.images?.[1] && (
                              <Image
                                src={product.images[1]}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                              />
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray text-xs bg-neutral-100">
                            No image available
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                          {isOutOfStock && (
                            <span className="px-2.5 py-1 rounded-full bg-ink/90 backdrop-blur-sm text-ivory text-[9px] font-bold uppercase tracking-wider">
                              Sold Out
                            </span>
                          )}
                          {isLowStock && (
                            <span className="px-2.5 py-1 rounded-full bg-rose text-ivory text-[9px] font-bold uppercase tracking-wider shadow-sm animate-pulse">
                              Only {product.totalStock} Left
                            </span>
                          )}
                          {product.category && (
                            <span className="px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-ink text-[9px] font-semibold uppercase tracking-wider border border-gray-light/60">
                              {product.category}
                            </span>
                          )}
                        </div>

                        {/* Wishlist Heart Button */}
                        <button
                          onClick={(e) => handleToggleWishlist(e, product.id)}
                          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/85 hover:bg-white text-ink hover:text-rose backdrop-blur-sm shadow-xs transition-all duration-200 hover:scale-110 active:scale-95"
                          aria-label="Add to wishlist"
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors ${
                              wishlisted
                                ? "fill-rose text-rose"
                                : "text-gray-700"
                            }`}
                          />
                        </button>

                        {/* Quick View Floating Action Overlay on desktop */}
                        <div className="hidden sm:flex absolute inset-x-3 bottom-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 gap-2">
                          <button
                            disabled={isOutOfStock}
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="flex-1 py-2.5 rounded-2xl bg-ink/90 hover:bg-ink text-ivory text-xs font-bold uppercase tracking-wider backdrop-blur-md transition-colors flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-400" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 text-gold" />
                                <span>Quick Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3 bg-white">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-gold text-[11px]">
                            <Star className="w-3 h-3 fill-gold" />
                            <span className="font-bold text-ink">4.9</span>
                            <span className="text-gray-400">· Premium</span>
                          </div>

                          <h3 className="text-xs sm:text-sm font-semibold text-ink group-hover:text-rose transition-colors line-clamp-2 leading-snug">
                            {product.name}
                          </h3>
                        </div>

                        <div className="pt-2 border-t border-gray-light/40 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-gray uppercase font-semibold">
                              Price
                            </span>
                            <span className="font-serif text-sm sm:text-base font-bold text-rose">
                              Rs. {product.price.toLocaleString()}
                            </span>
                          </div>

                          {/* Mobile quick add button */}
                          <button
                            disabled={isOutOfStock}
                            onClick={(e) => handleQuickAdd(e, product)}
                            className="sm:hidden p-2 rounded-xl bg-ink text-ivory hover:bg-rose transition-colors disabled:opacity-50"
                            aria-label="Add to cart"
                          >
                            {isJustAdded ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <ShoppingBag className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Bottom CTA to Shop */}
        <div className="text-center pt-4">
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-ink hover:bg-rose text-ivory text-xs font-bold uppercase tracking-[0.18em] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span>View All New Drops</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}
