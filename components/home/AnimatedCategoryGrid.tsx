"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Category } from "@/lib/types";

interface AnimatedCategoryGridProps {
  categories: Pick<Category, "name" | "slug">[];
}

export default function AnimatedCategoryGrid({ categories }: AnimatedCategoryGridProps) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const card = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" as const },
    },
  };

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
          Shop by Category
        </motion.h2>

        {categories.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.slug || cat.name}
                variants={card}
                whileHover={reduce ? {} : { y: -4 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Link
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group flex items-center justify-center rounded-lg bg-rose-light px-4 py-10 text-center border border-transparent hover:border-rose overflow-hidden transition-colors duration-200 h-full relative"
                >
                  {/* Image scale effect layer (bg colour) */}
                  <motion.div
                    className="absolute inset-0 bg-rose-light"
                    whileHover={reduce ? {} : { scale: 1.06 }}
                    transition={{ duration: 0.35 }}
                  />
                  <span className="relative font-serif font-semibold text-ink text-base sm:text-lg group-hover:text-rose transition-colors duration-200 z-10">
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
