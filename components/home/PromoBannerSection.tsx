"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Timer, Copy, Check, Sparkles, ArrowRight, Tag } from "lucide-react";

export default function PromoBannerSection() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 45,
    seconds: 30,
  });
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  // Ticking countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("NKFLASH15");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="bg-ivory py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-gray-light/60">
      <div className="max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-br from-ink via-neutral-900 to-ink text-ivory p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl border border-gold/30">
          
          {/* Subtle Ambient Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-rose/20 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gold/15 blur-[100px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose/20 text-rose border border-rose/30 text-[11px] font-bold uppercase tracking-widest">
                <Tag className="w-3.5 h-3.5" />
                <span>Limited Drop Promotion</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Flash Drop: Extra 15% Off
                <span className="block mt-1 text-gold italic font-normal">
                  On Premium Shoes & Wear
                </span>
              </h2>

              <p className="text-sm sm:text-base text-white/80 font-light max-w-lg mx-auto lg:mx-0">
                Unlock an instant discount at checkout. Applies across our latest footwear arrivals and apparel drops with Island-wide Cash on Delivery.
              </p>

              {/* Promo Code Box */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <div className="flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md">
                  <div className="text-left">
                    <p className="text-[9px] uppercase font-bold tracking-widest text-white/50">Voucher Code</p>
                    <p className="font-mono text-base font-bold text-gold tracking-widest">NKFLASH15</p>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-gold/20 hover:bg-gold text-gold hover:text-ink transition-all duration-200"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <Link
                  href="/shop?onSale=true"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gold hover:bg-gold/90 text-ink font-bold text-xs uppercase tracking-[0.18em] transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <span>Claim & Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {copied && (
                <p className="text-xs text-green-400 font-medium animate-fadeIn">
                  ✓ Code &quot;NKFLASH15&quot; copied to clipboard! Paste at checkout.
                </p>
              )}
            </div>

            {/* Right Countdown Widget */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full max-w-sm p-6 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl text-center space-y-6 shadow-xl">
                <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-gold">
                  <Timer className="w-4 h-4 animate-pulse" />
                  <span>Offer Expires In</span>
                </div>

                {/* Clock Digits */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-ink/70 border border-white/10">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-ivory">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-white/50 mt-1">Hours</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-ink/70 border border-white/10">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-ivory">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-white/50 mt-1">Mins</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-ink/70 border border-white/10">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-rose">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </span>
                    <span className="block text-[10px] uppercase font-semibold text-white/50 mt-1">Secs</span>
                  </div>
                </div>

                <p className="text-[11px] text-white/60">
                  ⚡ Free islandwide delivery applies automatically on orders over Rs. 15,000.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
