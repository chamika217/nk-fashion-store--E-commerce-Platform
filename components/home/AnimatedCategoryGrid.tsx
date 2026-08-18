"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Category } from "@/lib/types";

interface AnimatedCategoryGridProps {
  categories: Pick<Category, "name" | "slug">[];
}

export default function AnimatedCategoryGrid({ categories }: AnimatedCategoryGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
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
          Shop by Category
        </h2>
        {categories.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.slug || cat.name}
                variants={cardVariants}
                whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                transition={{ duration: 0.2, ease: "easeInOut" as const }}
                className="h-full"
              >
                <Link
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center justify-center rounded-lg bg-rose-light px-4 py-10 text-center border border-transparent hover:border-rose transition-all duration-300 h-full"
                >
                  <span className="font-serif font-semibold text-ink text-base sm:text-lg group-hover:text-rose transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
