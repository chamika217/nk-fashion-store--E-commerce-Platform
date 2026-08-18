"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export default function AnimatedHero() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
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
    <section className="bg-ivory py-24 px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        className="max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ink leading-tight"
          variants={itemVariants}
        >
          Timeless Style,<br />Sri Lankan Made
        </motion.h1>
        <motion.p
          className="mt-5 text-base sm:text-lg text-gray"
          variants={itemVariants}
        >
          Curated fashion for women, men &amp; kids — from everyday elegance
          to festive ethnic wear.
        </motion.p>
        <motion.div variants={itemVariants}>
          <motion.div
            className="mt-8 inline-block"
            whileHover={shouldReduceMotion ? {} : { scale: 1.03 }}
            transition={{ duration: 0.2, ease: "easeInOut" as const }}
          >
            <Link
              href="/shop"
              className="bg-ink text-ivory text-sm font-medium px-8 py-3 rounded-full hover:bg-rose transition-colors duration-300 block"
            >
              Shop Now
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
