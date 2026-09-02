"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/lib/types";

interface AnimatedCategoryGridProps {
  categories: Pick<Category, "name" | "slug">[];
}

const CATEGORY_IMAGES: Record<string, string> = {
  "womens-wear": "/images/hero/animation3.jpg",
  "mens-wear": "/images/hero/animation2.jpg",
  "kids-wear": "/images/hero/animation4.jpg",
  "accessories": "/images/hero/animation1.jpg",
};

const getCategoryImage = (name: string, slug?: string) => {
  const searchKey = (slug || name || "").toLowerCase().replace(/['\s]/g, "-");
  if (searchKey.includes("women")) return CATEGORY_IMAGES["womens-wear"];
  if (searchKey.includes("men")) return CATEGORY_IMAGES["mens-wear"];
  if (searchKey.includes("kid") || searchKey.includes("child")) return CATEGORY_IMAGES["kids-wear"];
  if (searchKey.includes("access")) return CATEGORY_IMAGES["accessories"];
  return "/images/hero/animation5.jpg"; // Fallback image
};

export default function AnimatedCategoryGrid({ categories }: AnimatedCategoryGridProps) {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const card: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" as const },
    },
  };

  return (
    <section className="bg-ivory py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.span
            className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose"
            initial={reduce ? {} : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Curated Collections
          </motion.span>
          <motion.h2
            className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2"
            initial={reduce ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            Shop by Category
          </motion.h2>
          <div className="w-12 h-[2px] bg-rose-light mx-auto mt-4" />
        </div>

        {categories.length > 0 && (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {categories.map((cat) => {
              const bgImg = getCategoryImage(cat.name, cat.slug);

              return (
                <motion.div
                  key={cat.slug || cat.name}
                  variants={card}
                  whileHover={reduce ? {} : { y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full"
                >
                  <Link
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className="group relative flex flex-col justify-end rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-gray-light/10 transition-shadow duration-300 bg-neutral-100 block w-full"
                    style={{ paddingBottom: "133.33%" /* fixed 3:4 aspect ratio via padding trick */ }}
                  >
                    {/* Absolute fill container */}
                    <div className="absolute inset-0">
                      {/* Category Image */}
                      <Image
                        src={bgImg}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                    </div>

                    {/* Text */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex flex-col">
                      <h3 className="font-serif text-base sm:text-lg font-bold text-ivory tracking-wide leading-tight">
                        {cat.name}
                      </h3>
                      <div className="overflow-hidden mt-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-light uppercase tracking-[0.15em] transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          Explore
                          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

