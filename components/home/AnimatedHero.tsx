"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";

// ── Image pools per slot ──────────────────────────────────────────────────────
const SLOT_IMAGES: string[][] = [
  ["/images/hero/animation1.jpg", "/images/hero/animation5.jpg", "/images/hero/animation3.jpg"],
  ["/images/hero/animation2.jpg", "/images/hero/animation6.jpg", "/images/hero/animation4.jpg"],
  ["/images/hero/animation3.jpg", "/images/hero/animation7.jpg", "/images/hero/animation1.jpg"],
  ["/images/hero/animation4.jpg", "/images/hero/animation2.jpg", "/images/hero/animation6.jpg"],
];

const START_DELAYS_MS   = [0, 600, 1200, 1800];
const CYCLE_INTERVAL_MS = 3600;

// ── Soft drifting gradient orbs decoration ────────────────────────────────────

function ElegantBackgroundOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Orb 1: Rose light */}
      <motion.div
        className="absolute rounded-full bg-rose-light/35 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] blur-[80px] sm:blur-[110px]"
        style={{ left: "-5%", top: "10%" }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Orb 2: Warm Gold */}
      <motion.div
        className="absolute rounded-full bg-gold/15 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] blur-[70px] sm:blur-[100px]"
        style={{ right: "15%", top: "5%" }}
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orb 3: Muted Rose */}
      <motion.div
        className="absolute rounded-full bg-rose/15 w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] blur-[90px] sm:blur-[120px]"
        style={{ left: "25%", bottom: "-10%" }}
        animate={{
          x: [0, 30, -40, 0],
          y: [0, 50, -20, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

// ── Single cycling image slot ─────────────────────────────────────────────────

function ImageSlot({ images, startDelay, paused, isStaggered }: {
  images: string[];
  startDelay: number;
  paused: boolean;
  isStaggered: boolean;
}) {
  const [idx, setIdx]   = useState(0);
  const pausedRef       = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (!pausedRef.current) setIdx((p) => (p + 1) % images.length);
      }, CYCLE_INTERVAL_MS);
    }, startDelay);
    return () => { clearTimeout(timeout); clearInterval(interval); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div 
      className={`relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-200 shadow-lg border border-white/20 transition-transform duration-700 ease-out ${
        isStaggered ? "translate-y-0 sm:translate-y-8" : "translate-y-0"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`img-${idx}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Image
            src={images[idx]}
            alt="NK Fashion Store premium collection"
            fill
            sizes="(max-width: 768px) 45vw, 20vw"
            className="object-cover"
          />
          {/* Elegant soft vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Hero section (text left + staggered image tray right) ─────────────────────

export default function AnimatedHero() {
  const reduce            = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };
  
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.215, 0.61, 0.355, 1] as [number, number, number, number] } },
  };
  
  const badgeVariant: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <section className="relative bg-ivory pt-20 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-gray-light/30">
      {/* Decorative Orbs */}
      {!reduce && <ElegantBackgroundOrbs />}
      
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

        {/* ── Left: Text content ── */}
        <motion.div
          className="flex-1 text-center lg:text-left z-10"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Premium Badge */}
          <motion.div variants={badgeVariant} className="mb-6 flex justify-center lg:justify-start">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-rose border border-rose/30 px-5 py-2 rounded-full bg-rose/5 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse" />
              The Seasonal Drop
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-[1.15]"
          >
            Timeless Style,
            <span className="block mt-1 bg-gradient-to-r from-rose via-gold to-rose bg-clip-text text-transparent italic font-normal">
              Sri Lankan Made
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg text-gray/90 max-w-md mx-auto lg:mx-0 leading-relaxed font-sans">
            Explore curated collections designed for modern elegance. Handcrafted styles for women, men, and kids.
          </motion.p>

          {/* Luxury CTA */}
          <motion.div variants={fadeUp} className="mt-10 flex justify-center lg:justify-start">
            <motion.div
              whileHover={reduce ? {} : { scale: 1.02 }}
              whileTap={reduce ? {} : { scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Link
                href="/shop"
                className="group relative inline-flex items-center gap-3 bg-ink hover:bg-rose text-ivory text-xs font-bold uppercase tracking-[0.2em] px-9 py-4.5 rounded-full shadow-lg transition-all duration-300 ease-out overflow-hidden"
              >
                <span className="relative z-10">Shop the Collection</span>
                <svg
                  className="w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                {/* Glossy overlay effect on hover */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Right: Shuffling image tray (Staggered Column Grid) ── */}
        <div
          className="w-full lg:flex-[1.3] max-w-2xl relative mt-4 lg:mt-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="relative z-10">
            {reduce ? (
              <div className="grid grid-cols-2 gap-4">
                {SLOT_IMAGES.slice(0, 4).map((imgs, i) => (
                  <div key={i} className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-200 shadow-md">
                    <Image src={imgs[0]} alt="NK Fashion product" fill sizes="25vw" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              // 4 columns: 2 shifted down on desktop to create a visual wave
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 sm:pb-12">
                {SLOT_IMAGES.map((imgs, slot) => (
                  <ImageSlot
                    key={slot}
                    images={imgs}
                    startDelay={START_DELAYS_MS[slot]}
                    paused={paused}
                    isStaggered={slot % 2 === 1}
                  />
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-[10px] text-gray/60 mt-4 uppercase tracking-[0.2em] select-none font-semibold">
            {paused ? "Paused" : "Hover to pause"}
          </p>
        </div>

      </div>
    </section>
  );
}

