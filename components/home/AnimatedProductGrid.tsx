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
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <section className="bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-8 text-center">
          New Arrivals
        </h2>

        {loading ? (
          <p className="text-center text-gray py-12 animate-pulse">
            Loading…
          </p>
        ) : products.length === 0 ? (
          <p className="text-center text-gray py-12">
            New arrivals coming soon.
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                className="h-full"
              >
                <Link
                  href={`/product/${product.id}`}
                  className="group flex flex-col bg-ivory border border-gray-light rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full"
                >
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
                    {/* Out of stock badge as a sibling (won't scale with the image) */}
                    {(product.totalStock === 0 || product.status === "out-of-stock") && (
                      <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                        <span className="bg-ivory text-ink text-xs font-semibold px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
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
