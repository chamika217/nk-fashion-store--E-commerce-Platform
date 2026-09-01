"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Feather, Layers, Compass } from "lucide-react";

const SPECS = [
  {
    icon: Feather,
    title: "Featherlight Cloud Cushioning",
    desc: "Engineered ultra-responsive EVA midsole that absorbs ground shock, keeping your feet energized all day.",
  },
  {
    icon: Layers,
    title: "Handpicked Premium Leathers",
    desc: "Top-tier genuine leather and breathable micro-knit fabrics that mold naturally to your foot shape over time.",
  },
  {
    icon: Compass,
    title: "Anatomical Arch Support",
    desc: "Ergonomically contoured footbeds designed in consultation with shoe craft specialists to reduce pressure points.",
  },
  {
    icon: ShieldCheck,
    title: "Anti-Slip High Traction Outsole",
    desc: "Reinforced non-marking rubber tread patterns engineered for superior wet-and-dry surface grip.",
  },
];

export default function CraftsmanshipSpotlight() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ink text-ivory py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-white/10">
      {/* Background Decorative Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[450px] h-[450px] rounded-full bg-rose/15 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gold/15 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The NK Engineering Philosophy</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Crafted for Movement.
            <span className="block mt-1 bg-gradient-to-r from-gold via-rose-light to-rose bg-clip-text text-transparent italic font-normal">
              Designed for Distinction.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed">
            Every shoe in our collection is precision-crafted with high-performance cushioning, anatomical contours, and handcrafted luxury details.
          </p>
        </div>

        {/* Feature Grid & Centerpiece */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left 2 Specs */}
          <div className="lg:col-span-4 space-y-8">
            {SPECS.slice(0, 2).map((spec, i) => (
              <motion.div
                key={spec.title}
                initial={reduce ? {} : { opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-gold/40 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center">
                  <spec.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-ivory">
                  {spec.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  {spec.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Center Visual */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-[340px] aspect-[4/5] rounded-3xl overflow-hidden bg-white/5 border border-white/20 shadow-2xl group">
              <Image
                src="/images/hero/animation6.jpg"
                alt="Shoe Craftsmanship & Quality"
                fill
                sizes="(max-width: 768px) 90vw, 340px"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-ink/80 backdrop-blur-md border border-white/15 text-center">
                <p className="text-[10px] uppercase font-bold tracking-widest text-gold">Sri Lankan Craftsmanship</p>
                <p className="text-xs font-bold text-ivory mt-1">100% Quality Guaranteed</p>
              </div>
            </div>
          </div>

          {/* Right 2 Specs */}
          <div className="lg:col-span-4 space-y-8">
            {SPECS.slice(2, 4).map((spec, i) => (
              <motion.div
                key={spec.title}
                initial={reduce ? {} : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-rose/40 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose/15 text-rose flex items-center justify-center">
                  <spec.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-ivory">
                  {spec.title}
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  {spec.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>

        {/* Action Link */}
        <div className="text-center pt-4">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gold hover:text-ivory transition-colors group"
          >
            <span>Read More About Our Story & Materials</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
