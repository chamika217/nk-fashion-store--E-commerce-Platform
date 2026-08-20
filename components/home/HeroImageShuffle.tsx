"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ── Each slot has its own pool of images to cycle through ─────────────────────
const SLOT_IMAGES: string[][] = [
  // Slot 1 — Kids' Wear
  [
    "/images/hero/animation1.jpg",
    "/images/hero/animation5.jpg",
    "/images/hero/animation3.jpg",
  ],
  // Slot 2 — Men's Wear
  [
    "/images/hero/animation2.jpg",
    "/images/hero/animation6.jpg",
    "/images/hero/animation4.jpg",
  ],
  // Slot 3 — Women's Wear / Accessories
  [
    "/images/hero/animation3.jpg",
    "/images/hero/animation7.jpg",
    "/images/hero/animation1.jpg",
  ],
  // Slot 4 — Ethnic Wear / mixed
  [
    "/images/hero/animation4.jpg",
    "/images/hero/animation2.jpg",
    "/images/hero/animation6.jpg",
  ],
];

const START_DELAYS_MS  = [0, 700, 1400, 2100];
const CYCLE_INTERVAL_MS = 3000;

// ── Single auto-cycling image card ────────────────────────────────────────────

function ImageSlot({
  images,
  startDelay,
  paused,
}: {
  images: string[];
  startDelay: number;
  paused: boolean;
}) {
  const [idx, setIdx] = useState(0);

  // Keep a ref so the interval always reads the latest paused value
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    // Staggered start — card N doesn't fire until its offset has passed
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (!pausedRef.current) {
          setIdx((prev) => (prev + 1) % images.length);
        }
      }, CYCLE_INTERVAL_MS);
    }, startDelay);

    // Cleanup both timeout and interval on unmount
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount — intentional

  return (
    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-neutral-200 shadow-md">
      <AnimatePresence mode="wait" initial={false}>
        {/* key change triggers AnimatePresence to run exit → enter */}
        <motion.div
          key={`slot-img-${idx}`}
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
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function HeroImageShuffle() {
  const reduce = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);

  // Reduced-motion: show static grid, no animation
  if (reduce) {
    return (
      <section className="bg-ivory pt-2 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SLOT_IMAGES.map((imgs, i) => (
            <div
              key={i}
              className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-neutral-200 shadow-md"
            >
              <Image
                src={imgs[0]}
                alt="NK Fashion product"
                fill
                sizes="25vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      className="bg-ivory pt-2 pb-12 px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-5xl mx-auto">
        {/* Mobile: 2-column */}
        <div className="grid grid-cols-2 sm:hidden gap-3">
          {SLOT_IMAGES.slice(0, 2).map((imgs, slot) => (
            <ImageSlot
              key={slot}
              images={imgs}
              startDelay={START_DELAYS_MS[slot]}
              paused={paused}
            />
          ))}
        </div>

        {/* Desktop: 4-column */}
        <div className="hidden sm:grid grid-cols-4 gap-3">
          {SLOT_IMAGES.map((imgs, slot) => (
            <ImageSlot
              key={slot}
              images={imgs}
              startDelay={START_DELAYS_MS[slot]}
              paused={paused}
            />
          ))}
        </div>

        <p className="text-center text-[10px] text-gray mt-3 uppercase tracking-widest select-none">
          {paused ? "Paused" : "Hover to pause"}
        </p>
      </div>
    </section>
  );
}
