"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, TrendingUp, Sparkles, Tag } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCHES = [
  "Leather Loafers",
  "Running Sneakers",
  "Casual Canvas Shoes",
  "Formal Oxford Shoes",
  "High Heels",
  "Sandals & Slides",
  "Men's Casual Wear",
  "Women's Dresses",
];

const QUICK_CATEGORIES = [
  { label: "Men's Shoes", href: "/shop?category=Men%27s+Wear" },
  { label: "Women's Collection", href: "/shop?category=Women%27s+Wear" },
  { label: "Kids' Footwear", href: "/shop?category=Kids%27+Wear" },
  { label: "New Arrivals", href: "/shop?sort=new" },
  { label: "Best Sellers", href: "/shop?sort=popular" },
  { label: "Special Offers", href: "/shop?onSale=true" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSelectKeyword = (term: string) => {
    router.push(`/shop?q=${encodeURIComponent(term)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/75 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-ivory rounded-3xl shadow-2xl border border-gold/20 overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center px-6 py-5 border-b border-gray-light/60 bg-white"
            >
              <Search className="w-6 h-6 text-rose shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search premium shoes, collections, styles…"
                className="w-full bg-transparent text-ink placeholder:text-gray text-base sm:text-lg outline-none font-sans"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-gray hover:text-ink mr-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray hover:text-ink bg-gray-light/40 hover:bg-gray-light rounded-full transition-colors shrink-0 ml-1"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            {/* Quick content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto divide-y divide-gray-light/40">
              {/* Popular Searches */}
              <div className="pb-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray uppercase tracking-widest mb-3.5">
                  <TrendingUp className="w-3.5 h-3.5 text-gold" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectKeyword(term)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-light/60 text-ink hover:border-rose hover:text-rose hover:bg-rose-light/10 transition-all duration-200 shadow-2xs"
                    >
                      <Tag className="w-3 h-3 text-rose/70" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Categories */}
              <div className="pt-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray uppercase tracking-widest mb-3.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose" />
                  <span>Explore Collections</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => {
                        router.push(cat.href);
                        onClose();
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white hover:bg-rose/5 border border-gray-light/50 hover:border-rose/30 text-left transition-all duration-200 group"
                    >
                      <span className="text-xs font-medium text-ink group-hover:text-rose transition-colors">
                        {cat.label}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray group-hover:text-rose group-hover:translate-x-0.5 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom info strip */}
            <div className="bg-ink px-6 py-3 flex items-center justify-between text-[11px] text-ivory/70">
              <span>Press <kbd className="bg-white/15 px-1.5 py-0.5 rounded text-ivory font-mono">ENTER</kbd> to search</span>
              <span className="text-gold font-medium">Island-wide Free Delivery Available</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
