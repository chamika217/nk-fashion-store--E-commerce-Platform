"use client";

import { motion, useReducedMotion } from "framer-motion";

const TEXT =
  "Free island-wide delivery via courier \u2014 Cash on Delivery available \u00a0\u00a0\u00a0\u2605\u00a0\u00a0\u00a0";

export default function AnimatedCtaStrip() {
  const reduce = useReducedMotion();

  // Duplicate text for seamless marquee loop
  const marqueeContent = `${TEXT}${TEXT}${TEXT}`;

  return (
    <section className="bg-ink text-ivory py-3 overflow-hidden">
      {reduce ? (
        // Static for reduced-motion users
        <p className="text-sm tracking-wide text-center px-4">{TEXT}</p>
      ) : (
        <div className="relative flex overflow-hidden">
          <motion.div
            className="flex whitespace-nowrap text-sm tracking-wide shrink-0"
            animate={{ x: ["0%", "-33.33%"] }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span className="mr-0">{marqueeContent}</span>
          </motion.div>
        </div>
      )}
    </section>
  );
}
