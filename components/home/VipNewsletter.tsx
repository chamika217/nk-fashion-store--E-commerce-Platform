"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, Sparkles, Check, ArrowRight, ShieldCheck } from "lucide-react";

export default function VipNewsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const reduce = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-ink text-ivory py-16 sm:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-rose/20 blur-[100px]" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-gold/15 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/30 text-[11px] font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>NK VIP Club</span>
        </div>

        <div className="space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Unlock Rs. 1,000 Off
            <span className="block mt-1 bg-gradient-to-r from-gold via-rose-light to-rose bg-clip-text text-transparent italic font-normal">
              Your First Pair of Shoes
            </span>
          </h2>
          <p className="text-sm sm:text-base text-white/70 font-light max-w-lg mx-auto leading-relaxed">
            Be the first to access limited shoe drops, private member sales, and seasonal style lookbooks directly in your inbox.
          </p>
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto">
          {subscribed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 rounded-3xl bg-white/10 border border-gold/30 backdrop-blur-md text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-full bg-gold text-ink flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5" />
              </div>
              <p className="font-serif font-bold text-lg text-ivory">
                Welcome to the NK VIP Circle!
              </p>
              <p className="text-xs text-gold">
                Use welcome code <strong className="font-mono bg-black/40 px-2 py-0.5 rounded">NKVIP1000</strong> at checkout for Rs. 1,000 off orders over Rs. 10,000.
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address…"
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 border border-white/20 text-ivory placeholder:text-white/40 text-sm outline-none focus:border-gold transition-colors font-sans"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 rounded-full bg-gold hover:bg-gold/90 text-ink font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-lg hover:scale-105 shrink-0"
              >
                Join VIP Club
              </button>
            </form>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-white/50">
            <ShieldCheck className="w-3.5 h-3.5 text-rose" />
            <span>Zero spam. Unsubscribe anytime with 1-click.</span>
          </div>
        </div>

      </div>
    </section>
  );
}
