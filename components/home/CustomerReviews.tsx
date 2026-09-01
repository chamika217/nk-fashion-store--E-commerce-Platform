"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Star, CheckCircle2, Quote, Sparkles } from "lucide-react";

const REVIEWS = [
  {
    name: "Kavindu Wickramasinghe",
    city: "Colombo 07",
    shoeModel: "Classic Italian Leather Loafers",
    rating: 5,
    title: "Unbelievably comfortable sole cushioning",
    comment:
      "Ordered these for daily office wear and I was surprised by how soft the inner cushion is. Delivered within 2 days to Colombo via Cash on Delivery.",
    date: "Verified Buyer · 2 days ago",
  },
  {
    name: "Nethmi Alwis",
    city: "Kandy",
    shoeModel: "Elegance Ankle Strap Heels",
    rating: 5,
    title: "Perfect fit & premium finish",
    comment:
      "The color and leather finish are top notch. Wore them for a full wedding function without any blisters or foot fatigue. Highly recommended brand!",
    date: "Verified Buyer · 1 week ago",
  },
  {
    name: "Dinuka Perera",
    city: "Galle",
    shoeModel: "Urban Runner Streetwear Edition",
    rating: 5,
    title: "Best sneakers for the price in Sri Lanka",
    comment:
      "Lightweight, breathable, and looks even better in person than in the pictures. Their customer service also assisted me quickly with sizing advice.",
    date: "Verified Buyer · 2 weeks ago",
  },
];

export default function CustomerReviews() {
  const reduce = useReducedMotion();

  return (
    <section className="bg-ivory py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-light/60">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-rose">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trusted Across Sri Lanka</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Customer Reviews & Experiences
          </h2>
          <p className="text-sm text-gray-600 font-light">
            Over 2,500+ satisfied customers stepping out in style and comfort every single day.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {REVIEWS.map((rev, idx) => (
            <motion.div
              key={rev.name}
              initial={reduce ? {} : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex flex-col justify-between p-7 rounded-3xl bg-white border border-gray-light/60 shadow-2xs hover:shadow-lg transition-all duration-300 relative group"
            >
              <div className="space-y-4">
                {/* Rating stars & verified badge */}
                <div className="flex items-center justify-between">
                  <div className="flex text-gold">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    <CheckCircle2 className="w-3 h-3 text-green-600" />
                    Verified Order
                  </span>
                </div>

                {/* Review Text */}
                <div className="space-y-1.5">
                  <h3 className="font-serif font-bold text-base text-ink">
                    &ldquo;{rev.title}&rdquo;
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans font-light">
                    {rev.comment}
                  </p>
                </div>
              </div>

              {/* Customer footer info */}
              <div className="pt-6 mt-6 border-t border-gray-light/40 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">{rev.name}</p>
                  <p className="text-[11px] text-gray">{rev.city} · <span className="text-rose font-medium">{rev.shoeModel}</span></p>
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{rev.date.split(" · ")[1]}</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
