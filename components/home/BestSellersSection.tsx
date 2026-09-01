"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Star, ShoppingBag, ArrowRight, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { useWishlist } from "@/context/WishlistContext";

interface BestSellersSectionProps {
  products: Product[];
  loading: boolean;
}

export default function BestSellersSection({
  products,
  loading,
}: BestSellersSectionProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const reduce = useReducedMotion();

  // Top 4 best sellers
  const bestSellers = products.slice(0, 4);

  return (
    <section className="bg-ivory py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-light/60">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose mb-2">
              <Flame className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              Best Sellers
            </h2>
          </div>
          <Link
            href="/shop?sort=popular"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink hover:text-rose transition-colors group"
          >
            <span>View All Top Rated</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Product Cards */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-neutral-200 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
            {bestSellers.map((product, idx) => {
              const wishlisted = isInWishlist(product.id);

              return (
                <motion.div
                  key={product.id}
                  initial={reduce ? {} : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="group flex flex-col bg-white rounded-3xl border border-gray-light/60 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 relative"
                >
                  <Link
                    href={`/product/${product.id}`}
                    className="flex flex-col h-full"
                  >
                    <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray text-xs">
                          No image
                        </div>
                      )}

                      {/* Rank Tag */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-gold text-ink font-bold text-[10px] uppercase tracking-wider shadow-sm">
                        <Flame className="w-3 h-3 text-ink" />
                        <span>#0{idx + 1} Best Seller</span>
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(product.id);
                        }}
                        className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/85 hover:bg-white text-ink hover:text-rose backdrop-blur-sm shadow-xs transition-transform hover:scale-110 active:scale-95"
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            wishlisted ? "fill-rose text-rose" : "text-gray-700"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="flex text-gold">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-gold text-gold"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] font-bold text-gray-500">
                            (5.0)
                          </span>
                        </div>

                        <h3 className="text-xs sm:text-sm font-semibold text-ink group-hover:text-rose transition-colors line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-gray-light/40 flex items-center justify-between">
                        <span className="font-serif text-sm sm:text-base font-bold text-rose">
                          Rs. {product.price.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-gold group-hover:underline">
                          View Pair →
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
