"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function AnimatedCtaStrip() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      className="bg-ink text-ivory py-5 px-4 text-center"
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
    >
      <p className="text-sm tracking-wide">
        Free island-wide delivery via courier &mdash; Cash on Delivery available
      </p>
    </motion.section>
  );
}
