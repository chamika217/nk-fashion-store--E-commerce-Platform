"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Star, ShieldCheck, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: string;
  tag: string;
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  description: string;
  image: string;
  price: string;
  rating: string;
  reviewsCount: string;
  ctaText: string;
  ctaLink: string;
  accentColor: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    tag: "SPRING / SUMMER 2025 // SIGNATURE DROP",
    badge: "Handcrafted Luxury",
    titleLine1: "Elevate Every Step with",
    titleHighlight: "Mastercrafted Shoes",
    description:
      "Engineered for unparalleled all-day comfort and timeless Sri Lankan elegance. Premium leather loafers, runners, and lifestyle essentials.",
    image: "/images/hero/animation1.jpg",
    price: "From Rs. 4,850",
    rating: "4.9",
    reviewsCount: "2,480+ Reviews",
    ctaText: "Shop New Footwear",
    ctaLink: "/shop?sort=new",
    accentColor: "from-rose to-gold",
  },
  {
    id: "slide-2",
    tag: "STREETWEAR & RUNNERS // EDITION 02",
    badge: "Ultra-Light Cushioning",
    titleLine1: "Dynamic Movement,",
    titleHighlight: "Refined Aesthetics",
    description:
      "Discover modern urban sneakers engineered with breathable dual-knit mesh and high-resilience memory foam soles.",
    image: "/images/hero/animation2.jpg",
    price: "From Rs. 5,200",
    rating: "5.0",
    reviewsCount: "1,920+ Reviews",
    ctaText: "Explore Sneakers",
    ctaLink: "/shop?category=Men%27s+Wear",
    accentColor: "from-gold to-rose-light",
  },
  {
    id: "slide-3",
    tag: "WOMEN'S LUXURY // EXCLUSIVE COLLECTION",
    badge: "Couture & Comfort",
    titleLine1: "Sophisticated Glamour,",
    titleHighlight: "Everyday Grace",
    description:
      "Handpicked heels, comfortable flats, and artisan evening wear designed to turn heads wherever you step.",
    image: "/images/hero/animation3.jpg",
    price: "From Rs. 3,950",
    rating: "4.9",
    reviewsCount: "3,100+ Reviews",
    ctaText: "Shop Women's Drop",
    ctaLink: "/shop?category=Women%27s+Wear",
    accentColor: "from-rose to-rose-light",
  },
];

export default function HeroShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const reduce = useReducedMotion();

  // Auto-advance hero slides every 5.5s
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const current = HERO_SLIDES[activeIdx];

  return (
    <section
      className="relative bg-ink text-ivory overflow-hidden border-b border-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose/25 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-gold/15 blur-[140px]"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[560px]">
          
          {/* ── Left Column: Editorial Headline & Actions (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Top Badge & Tag */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 text-[11px] font-bold uppercase tracking-widest backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-gold animate-pulse" />
                    {current.badge}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-white/60 uppercase">
                    {current.tag}
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="font-serif text-3xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.12]">
                  {current.titleLine1}
                  <span className="block mt-1.5 bg-gradient-to-r from-gold via-rose-light to-rose bg-clip-text text-transparent italic font-normal">
                    {current.titleHighlight}
                  </span>
                </h1>

                {/* Subtext */}
                <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-light">
                  {current.description}
                </p>

                {/* Call-to-action Buttons & Starting Price */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href={current.ctaLink}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-gold hover:bg-gold/90 text-ink font-bold text-xs uppercase tracking-[0.18em] transition-all duration-300 shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] group"
                  >
                    <span>{current.ctaText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/shop"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-ivory border border-white/20 font-semibold text-xs uppercase tracking-[0.15em] transition-all duration-300 backdrop-blur-sm hover:border-gold/50"
                  >
                    <span>View Lookbook</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Trust & Social Proof Strip */}
                <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <div className="flex text-gold">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-gold text-gold" />
                      ))}
                    </div>
                    <span className="font-bold text-ivory">{current.rating}</span>
                    <span className="text-white/50">({current.reviewsCount})</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-white/80">
                    <ShieldCheck className="w-4 h-4 text-rose" />
                    <span>Cash on Delivery Available</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Right Column: Showcase Card & Image Switcher (5 cols) ── */}
          <div className="lg:col-span-5 relative z-10 flex flex-col items-center">
            {/* Main Stage Image Container */}
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/15 shadow-2xl group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={current.image}
                    alt="NK Fashion Premium Shoes & Apparel"
                    fill
                    sizes="(max-width: 768px) 90vw, 420px"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    priority
                  />
                  {/* Subtle Gradient vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              {/* Floating Price Pill */}
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-ink/85 backdrop-blur-md border border-white/15 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-gold">Featured Collection</p>
                  <p className="text-sm font-bold text-ivory mt-0.5">{current.titleHighlight}</p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-rose text-ivory text-xs font-bold shadow-xs">
                  {current.price}
                </span>
              </div>
            </div>

            {/* Slide Navigation Selectors */}
            <div className="mt-6 flex items-center gap-3">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${
                    activeIdx === idx
                      ? "bg-gold text-ink font-bold text-xs shadow-md"
                      : "bg-white/10 hover:bg-white/20 text-white/70 text-xs"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="text-[11px] font-medium">0{idx + 1}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
