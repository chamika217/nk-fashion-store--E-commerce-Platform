"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Category } from "@/lib/types";

interface CategoryBentoProps {
  categories: Pick<Category, "name" | "slug">[];
}

const BENTO_TILES = [
  {
    id: "mens",
    title: "Men's Footwear & Apparel",
    subtitle: "Loafers, Sneakers, Formal Shoes & Casuals",
    href: "/shop?category=Men%27s+Wear",
    image: "/images/hero/animation2.jpg",
    badge: "Most Popular",
    colSpan: "lg:col-span-8",
    rowSpan: "lg:row-span-1",
    aspect: "aspect-[16/9] sm:aspect-[21/9]",
  },
  {
    id: "womens",
    title: "Women's Collection",
    subtitle: "High Heels, Comfort Flats & Designer Dresses",
    href: "/shop?category=Women%27s+Wear",
    image: "/images/hero/animation3.jpg",
    badge: "Trending Now",
    colSpan: "lg:col-span-4",
    rowSpan: "lg:row-span-2",
    aspect: "aspect-[3/4] sm:aspect-[4/5] lg:aspect-auto lg:h-full",
  },
  {
    id: "kids",
    title: "Kids & Everyday Play",
    subtitle: "Durable & Comfortable Footwear for Little Explorers",
    href: "/shop?category=Kids%27+Wear",
    image: "/images/hero/animation4.jpg",
    badge: "New Drops",
    colSpan: "lg:col-span-4",
    rowSpan: "lg:row-span-1",
    aspect: "aspect-[4/3] sm:aspect-[16/9]",
  },
  {
    id: "sale",
    title: "Clearance & Special Offers",
    subtitle: "Up to 40% Off Selected Shoes & Fashion Pieces",
    href: "/shop?onSale=true",
    image: "/images/hero/animation1.jpg",
    badge: "Limited Quantities",
    colSpan: "lg:col-span-4",
    rowSpan: "lg:row-span-1",
    aspect: "aspect-[4/3] sm:aspect-[16/9]",
  },
];

export default function CategoryBento({ categories }: CategoryBentoProps) {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Collections</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink hover:text-rose transition-colors group"
          >
            <span>Explore All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {BENTO_TILES.map((tile, index) => (
            <motion.div
              key={tile.id}
              initial={reduce ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
              className={`${tile.colSpan} ${tile.rowSpan}`}
            >
              <Link
                href={tile.href}
                className={`group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-neutral-900 border border-gray-light/40 shadow-sm hover:shadow-xl transition-all duration-500 ${tile.aspect} min-h-[260px]`}
              >
                {/* Background Image */}
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-90"
                />

                {/* Gradient Shading */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent transition-opacity duration-300" />

                {/* Top Badge */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] sm:text-xs font-bold text-ivory uppercase tracking-wider shadow-sm">
                    {tile.badge}
                  </span>
                </div>

                {/* Bottom Content Info */}
                <div className="relative z-10 p-6 sm:p-8 space-y-2">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-ivory tracking-wide group-hover:text-gold transition-colors">
                    {tile.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-2 max-w-md font-light">
                    {tile.subtitle}
                  </p>

                  <div className="pt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-light group-hover:text-gold transition-colors">
                    <span>Discover Drop</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
