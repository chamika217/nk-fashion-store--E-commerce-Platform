"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ── Image pools per slot ──────────────────────────────────────────────────────
const SLOT_IMAGES: string[][] = [
  ["/images/hero/animation1.jpg", "/images/hero/animation5.jpg", "/images/hero/animation3.jpg"],
  ["/images/hero/animation2.jpg", "/images/hero/animation6.jpg", "/images/hero/animation4.jpg"],
  ["/images/hero/animation3.jpg", "/images/hero/animation7.jpg", "/images/hero/animation1.jpg"],
  ["/images/hero/animation4.jpg", "/images/hero/animation2.jpg", "/images/hero/animation6.jpg"],
];

const START_DELAYS_MS   = [0, 700, 1400, 2100];
const CYCLE_INTERVAL_MS = 3000;

// ── Floating bubbles decoration ───────────────────────────────────────────────

const BUBBLE_CONFIG = [
  { size: 40,  left: "5%",  delay: 0,    duration: 6,   color: "bg-rose/30"       },
  { size: 28,  left: "18%", delay: 1.2,  duration: 7.5, color: "bg-gold/25"       },
  { size: 55,  left: "32%", delay: 0.5,  duration: 5.5, color: "bg-rose-light/50" },
  { size: 22,  left: "45%", delay: 2,    duration: 8,   color: "bg-rose/20"       },
  { size: 38,  left: "55%", delay: 0.8,  duration: 6.5, color: "bg-gold/30"       },
  { size: 50,  left: "68%", delay: 1.6,  duration: 7,   color: "bg-rose-light/40" },
  { size: 24,  left: "78%", delay: 3,    duration: 9,   color: "bg-gold/20"       },
  { size: 32,  left: "88%", delay: 2.4,  duration: 6,   color: "bg-rose/25"       },
  { size: 18,  left: "25%", delay: 1,    duration: 8.5, color: "bg-rose-light/35" },
  { size: 44,  left: "95%", delay: 3.5,  duration: 7,   color: "bg-gold/35"       },
  { size: 30,  left: "12%", delay: 4,    duration: 6.5, color: "bg-rose/20"       },
  { size: 48,  left: "60%", delay: 2.8,  duration: 8,   color: "bg-rose-light/30" },
];

function FloatingBubbles() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {BUBBLE_CONFIG.map((b, i) => {
        // Random wandering path — different for each bubble
        const xPath  = i % 2 === 0
          ? [0, 18, -12, 22, -8, 14, 0]
          : [0, -16, 20, -10, 18, -6, 0];
        const yPath  = [0, -40, -90, -150, -210, -270, -320];
        const scPath = [0.5, 0.9, 1.1, 0.85, 1.0, 0.7, 0.4];
        const opPath = [0, 0.7, 0.9, 0.8, 0.6, 0.3, 0];

        return (
          <motion.div
            key={i}
            className={`absolute rounded-full ${b.color}`}
            style={{ width: b.size, height: b.size, left: b.left, bottom: "8%" }}
            animate={{ x: xPath, y: yPath, scale: scPath, opacity: opPath }}
            transition={{
              duration:   b.duration,
              delay:      b.delay,
              repeat:     Infinity,
              ease:       "easeInOut",
              times:      [0, 0.15, 0.3, 0.5, 0.7, 0.88, 1],
            }}
          />
        );
      })}
    </div>
  );
}

// ── Single cycling image slot ─────────────────────────────────────────────────

function ImageSlot({ images, startDelay, paused }: {
  images: string[];
  startDelay: number;
  paused: boolean;
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
    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-200 shadow-md">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`img-${idx}`}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
        >
          <Image
            src={images[idx]}
            alt="NK Fashion Store product"
            fill
            sizes="(max-width: 768px) 45vw, 20vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Hero section (text left + image tray right) ───────────────────────────────

export default function AnimatedHero() {
  const reduce            = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.14 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };
  const badgeVariant = {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
  };

  return (
    <section className="relative bg-ivory pt-16 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Bubbles span the full hero — behind both text and images */}
      {!reduce && <FloatingBubbles />}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 lg:gap-16">

        {/* ── Left: Text content ── */}
        <motion.div
          className="flex-1 text-center md:text-left"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={badgeVariant} className="mb-5 flex justify-center md:justify-start">
            <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-rose border border-rose/40 px-4 py-1.5 rounded-full bg-rose/5">
              The Seasonal Drop
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight"
          >
            Timeless Style,<br />Sri Lankan Made
          </motion.h1>

          {/* Subtext */}
          <motion.p variants={fadeUp} className="mt-5 text-base sm:text-lg text-gray max-w-md">
            Curated fashion for women, men &amp; kids — from everyday elegance
            to festive ethnic wear.
          </motion.p>

          {/* CTA */}
          <motion.div variants={fadeUp} className="mt-8 flex justify-center md:justify-start">
            <motion.div
              whileHover={reduce ? {} : { scale: 1.05, boxShadow: "0 8px 24px rgba(28,27,26,0.18)" }}
              whileTap={reduce ? {} : { scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="rounded-full"
            >
              <Link
                href="/shop"
                className="bg-ink text-ivory text-sm font-medium px-8 py-3 rounded-full hover:bg-rose transition-colors duration-200 block"
              >
                Shop Now
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Right: Shuffling image tray ── */}
        <div
          className="w-full md:flex-[1.4] max-w-2xl relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Image grid */}
          <div className="relative z-10">
          {reduce ? (
            <div className="grid grid-cols-2 gap-3">
              {SLOT_IMAGES.slice(0, 4).map((imgs, i) => (
                <div key={i} className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-neutral-200 shadow-md">
                  <Image src={imgs[0]} alt="NK Fashion product" fill sizes="25vw" className="object-cover" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SLOT_IMAGES.map((imgs, slot) => (
                <ImageSlot
                  key={slot}
                  images={imgs}
                  startDelay={START_DELAYS_MS[slot]}
                  paused={paused}
                />
              ))}
            </div>
          )}
          </div>

          <p className="text-center text-[10px] text-gray mt-3 uppercase tracking-widest select-none">
            {paused ? "Paused" : "Hover to pause"}
          </p>
        </div>

      </div>
    </section>
  );
}
