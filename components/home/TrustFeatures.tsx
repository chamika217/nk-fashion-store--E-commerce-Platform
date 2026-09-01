"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Truck, ShieldCheck, RefreshCw, Award, Headphones, Banknote } from "lucide-react";

const FEATURES = [
  {
    icon: Truck,
    title: "Island-wide Express Courier",
    desc: "Speedy door-to-door courier dispatch across all 25 districts in Sri Lanka with full tracking.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: Banknote,
    title: "Cash on Delivery Available",
    desc: "Shop with absolute peace of mind. Pay safely in cash right when your parcel reaches your doorstep.",
    color: "text-rose",
    bg: "bg-rose/10",
  },
  {
    icon: Award,
    title: "Artisan Quality & Comfort",
    desc: "Crafted from selected materials, ergonomic cushioning soles, and durable stitching made to last.",
    color: "text-gold",
    bg: "bg-gold/10",
  },
  {
    icon: RefreshCw,
    title: "Hassle-Free 7-Day Exchange",
    desc: "Wrong size or fit? Our quick and friendly exchange service ensures you always get your perfect pair.",
    color: "text-rose",
    bg: "bg-rose/10",
  },
];

export default function TrustFeatures() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-light/60">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((item, index) => (
            <motion.div
              key={item.title}
              initial={reduce ? {} : { opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-gray-light/60 shadow-2xs hover:shadow-md transition-all duration-300 group"
            >
              <div className={`p-3 rounded-xl ${item.bg} ${item.color} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif font-bold text-sm text-ink group-hover:text-rose transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed font-sans font-normal">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
