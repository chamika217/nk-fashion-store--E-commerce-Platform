"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";

const VALUES = [
  {
    title: "Sri Lankan Heritage",
    description: "Proudly supporting local tailors and artisans, bringing Sri Lanka's finest craftsmanship and textiles straight to your wardrobe.",
    icon: (
      <svg className="w-6 h-6 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.64-.726-8.03-2.018m16.06 0C19.98 9.474 18.066 10 16 10c-2.268 0-4.36-.647-6.134-1.768M3.07 7.582C4.02 9.474 5.934 10 8 10c2.268 0 4.36-.647 6.134-1.768" />
      </svg>
    ),
  },
  {
    title: "Curated Quality",
    description: "We handpick every design, fabric, and stitch. Elevate your everyday elegance with pieces designed to fit well and last.",
    icon: (
      <svg className="w-6 h-6 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Island-wide Delivery",
    description: "Reliable door-to-door courier delivery across Sri Lanka. Shop with complete peace of mind using our flexible Cash on Delivery option.",
    icon: (
      <svg className="w-6 h-6 text-rose" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
  },
];

export default function BrandPhilosophy() {
  const reduce = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: "easeOut" as const },
    },
  };

  return (
    <section className="bg-ivory py-20 px-4 sm:px-6 lg:px-8 border-b border-gray-light/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {VALUES.map((val, idx) => (
            <motion.div
              key={idx}
              variants={itemVariant}
              className="flex flex-col items-center md:items-start text-center md:text-left p-6 sm:p-8 rounded-2xl bg-white border border-gray-light/20 shadow-xs hover:shadow-md transition-shadow duration-300"
            >
              {/* Icon Container */}
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-rose-light/20 mb-5 border border-rose-light/10">
                {val.icon}
              </div>

              {/* Title */}
              <h3 className="font-serif text-lg sm:text-xl font-bold text-ink mb-3">
                {val.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray/90 leading-relaxed font-sans">
                {val.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
