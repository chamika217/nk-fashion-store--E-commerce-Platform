"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

interface AnimatedProductGridProps {
  products: Product[];
  loading: boolean;
}

export default function AnimatedProductGrid({ products, loading }: AnimatedProductGridProps) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const card: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" as const },
    },
  };

  const isLowStock = (p: Product) =>
    p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold ?? 3);

  return (
    <section className="bg-ivory py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-light/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose">
            Selected Pieces
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2">
            New Arrivals
          </h2>
          <div className="w-12 h-[2px] bg-rose-light mx-auto mt-4" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray tracking-widest uppercase">Loading Collection…</p>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray py-20 font-serif italic">New arrivals coming soon.</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={card}
                whileHover={reduce ? {} : { y: -8 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                className="h-full group"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="flex flex-col h-full"
                >
                  {/* Image wrapper */}
                  <div className="relative w-full aspect-[3/4] bg-neutral-100 overflow-hidden rounded-2xl shadow-xs group-hover:shadow-md transition-shadow duration-300">
                    {product.images?.[0] ? (
                      <>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className={`object-cover transition-transform duration-700 ease-out ${
                            product.images?.[1] ? "group-hover:opacity-0" : "group-hover:scale-105"
                          }`}
                          priority={index === 0}
                        />
                        {product.images?.[1] && (
                          <Image
                            src={product.images[1]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:scale-105"
                          />
                        )}
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray text-xs bg-gray-light/30">
                        No image
                      </div>
                    )}

                    {/* Out of stock overlay */}
                    {(product.totalStock === 0 || product.status === "out-of-stock") && (
                      <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-ivory text-ink text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {/* Low stock badge */}
                    {isLowStock(product) && (
                      <span className="absolute top-3 left-3 z-10 bg-gold text-ivory text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                        Low Stock
                      </span>
                    )}

                    {/* "Quick View" reveal on hover */}
                    <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 pointer-events-none">
                      <span className="bg-ivory/95 backdrop-blur-xs text-ink text-[11px] font-bold uppercase tracking-[0.15em] px-5 py-2.5 rounded-full shadow-md transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
                        Quick View
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="pt-4 pb-2 px-1 flex flex-col gap-1.5 flex-1">
                    <p className="text-[13px] sm:text-sm font-medium text-ink/90 group-hover:text-rose transition-colors duration-250 line-clamp-2 leading-relaxed">
                      {product.name}
                    </p>
                    <p className="text-sm text-rose font-bold mt-auto">
                      Rs. {product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

