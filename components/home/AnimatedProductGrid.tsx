"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";

interface AnimatedProductGridProps {
  products: Product[];
  loading: boolean;
}

export default function AnimatedProductGrid({ products, loading }: AnimatedProductGridProps) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  const card = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  };

  const isLowStock = (p: Product) =>
    p.totalStock > 0 && p.totalStock <= (p.lowStockThreshold ?? 3);

  return (
    <section className="bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-8 text-center"
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          New Arrivals
        </motion.h2>

        {loading ? (
          <p className="text-center text-gray py-12 animate-pulse">Loading…</p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray py-12">New arrivals coming soon.</p>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={card}
                whileHover={reduce ? {} : { y: -4, boxShadow: "0 12px 32px rgba(28,27,26,0.12)" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="h-full rounded-xl"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="group flex flex-col bg-ivory border border-gray-light rounded-xl overflow-hidden h-full"
                >
                  {/* Image wrapper */}
                  <div className="relative w-full aspect-[3/4] bg-gray-light overflow-hidden">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray text-xs">
                        No image
                      </div>
                    )}

                    {/* Out of stock overlay */}
                    {(product.totalStock === 0 || product.status === "out-of-stock") && (
                      <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                        <span className="bg-ivory text-ink text-xs font-semibold px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Low stock pulse badge */}
                    {isLowStock(product) && (
                      <motion.span
                        className="absolute top-2 left-2 bg-gold text-ivory text-[9px] font-bold uppercase px-2 py-0.5 rounded-full"
                        animate={reduce ? {} : { scale: [1, 1.08, 1] }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Low Stock
                      </motion.span>
                    )}

                    {/* "View Product" reveal on hover */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-ink/80 text-ivory text-xs font-medium text-center py-2"
                      initial={{ y: "100%" }}
                      whileHover={{ y: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                    >
                      View Product
                    </motion.div>
                  </div>

                  <div className="p-3 flex flex-col gap-1">
                    <p className="text-sm font-medium text-ink line-clamp-2 leading-snug">
                      {product.name}
                    </p>
                    <p className="text-sm text-rose font-semibold">
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
