"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Search,
  User,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Flame,
  Tag,
  Truck,
  ShieldCheck,
  PhoneCall,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import SearchModal from "@/components/SearchModal";

// ── Top Announcement Ticker Items ───────────────────────────────────────────────
const ANNOUNCEMENTS = [
  { text: "✨ NEW DROP: Handcrafted Footwear & Fashion Spring/Summer 2025", icon: "✨" },
  { text: "🚚 FREE Island-wide Delivery on orders over Rs. 15,000", icon: "🚚" },
  { text: "⚡ Use code NKFIRST for 10% OFF your first order", icon: "🏷️" },
  { text: "📦 Cash on Delivery (COD) Available Island-wide", icon: "💎" },
];

// ── Shop Mega-Menu Data ────────────────────────────────────────────────────────
const MEGA_COLLECTIONS = [
  {
    category: "Men's Footwear & Wear",
    href: "/shop?category=Men%27s+Wear",
    badge: "Popular",
    items: [
      { name: "Leather Loafers & Slip-ons", href: "/shop?category=Men%27s+Wear&sub=Loafers" },
      { name: "Casual & Running Sneakers", href: "/shop?category=Men%27s+Wear&sub=Sneakers" },
      { name: "Formal Dress Shoes", href: "/shop?category=Men%27s+Wear&sub=Formal" },
      { name: "Comfort Sandals & Slides", href: "/shop?category=Men%27s+Wear&sub=Sandals" },
      { name: "Premium Shirts & T-Shirts", href: "/shop?category=Men%27s+Wear&sub=Shirts" },
    ],
  },
  {
    category: "Women's Footwear & Wear",
    href: "/shop?category=Women%27s+Wear",
    badge: "Trending",
    items: [
      { name: "Elegant Heels & Pumps", href: "/shop?category=Women%27s+Wear&sub=Heels" },
      { name: "Comfort Flats & Loafers", href: "/shop?category=Women%27s+Wear&sub=Flats" },
      { name: "Fashion Sneakers & Walkers", href: "/shop?category=Women%27s+Wear&sub=Sneakers" },
      { name: "Dresses & Tops", href: "/shop?category=Women%27s+Wear&sub=Dresses" },
      { name: "Ethnic & Casual Bottoms", href: "/shop?category=Women%27s+Wear&sub=Ethnic" },
    ],
  },
  {
    category: "Kids & Special Drops",
    href: "/shop?category=Kids%27+Wear",
    badge: "New",
    items: [
      { name: "Kids' Casual Shoes", href: "/shop?category=Kids%27+Wear&sub=Boys" },
      { name: "Girls' Party & Daily Shoes", href: "/shop?category=Kids%27+Wear&sub=Girls" },
      { name: "Lightweight School & Play Wear", href: "/shop?category=Kids%27+Wear" },
      { name: "Bags & Leather Accessories", href: "/shop?category=Accessories" },
    ],
  },
];

const QUICK_LINKS = [
  { label: "New Arrivals", href: "/shop?sort=new", icon: Sparkles, color: "text-gold" },
  { label: "Best Sellers", href: "/shop?sort=popular", icon: Flame, color: "text-rose" },
  { label: "Flash Sale", href: "/shop?onSale=true", icon: Tag, color: "text-rose-light" },
];

export default function Navbar() {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState<string | null>("men");
  const [cartBouncing, setCartBouncing] = useState(false);

  const prevCartCount = useRef(0);
  const megaMenuTimeout = useRef<NodeJS.Timeout | null>(null);

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useCustomerAuth();
  const reduce = useReducedMotion();

  // Announcement ticker loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener for sticky blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart bounce trigger
  useEffect(() => {
    if (cartCount > prevCartCount.current) {
      setCartBouncing(true);
      const timer = setTimeout(() => setCartBouncing(false), 700);
      return () => clearTimeout(timer);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const handleMegaEnter = () => {
    if (megaMenuTimeout.current) clearTimeout(megaMenuTimeout.current);
    setMegaMenuOpen(true);
  };

  const handleMegaLeave = () => {
    megaMenuTimeout.current = setTimeout(() => {
      setMegaMenuOpen(false);
    }, 180);
  };

  return (
    <>
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-ink/95 backdrop-blur-xl shadow-xl shadow-black/20"
            : "bg-ink"
        }`}
      >
        {/* ── Top Announcement Bar ── */}
        <div className="bg-gradient-to-r from-ink via-ink/90 to-ink border-b border-white/10 text-ivory text-xs py-2 px-4 select-none relative overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Left Tag */}
            <div className="hidden lg:flex items-center gap-4 text-[11px] text-white/70">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-gold" />
                Express Island-wide Delivery
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-rose" />
                100% Authentic Quality
              </span>
            </div>

            {/* Center Dynamic Announcement Ticker */}
            <div className="flex-1 flex justify-center text-center overflow-hidden h-5 items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tickerIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="inline-flex items-center gap-2 font-medium text-[11px] sm:text-xs text-ivory tracking-wide"
                >
                  <span>{ANNOUNCEMENTS[tickerIndex].text}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Help / Hotline */}
            <div className="hidden md:flex items-center gap-3 text-[11px] text-white/70">
              <Link
                href="/track-order"
                className="hover:text-gold transition-colors"
              >
                Track Order
              </Link>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <a
                href="tel:+94770000000"
                className="flex items-center gap-1 hover:text-gold transition-colors"
              >
                <PhoneCall className="w-3 h-3 text-gold" />
                Hotline
              </a>
            </div>
          </div>
        </div>

        {/* ── Main Navigation Bar ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 transition-all duration-300">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-3 group shrink-0">
                <div className="relative">
                  <Image
                    src="/Logo.png"
                    alt="NK Fashion Store"
                    width={46}
                    height={46}
                    className="rounded-full object-cover ring-2 ring-gold/40 group-hover:ring-gold transition-all duration-300 shadow-md group-hover:scale-105"
                    priority
                  />
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-rose border-2 border-ink" />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-ivory group-hover:text-gold transition-colors leading-none">
                    NK FASHION
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.25em] text-white/60 font-semibold mt-1">
                    Shoes & Apparel
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 font-medium text-sm text-ivory/80">
              <Link
                href="/"
                className="px-3.5 py-2 rounded-full hover:text-ivory hover:bg-white/10 transition-all duration-200"
              >
                Home
              </Link>

              {/* Mega Menu Trigger */}
              <div
                className="relative"
                onMouseEnter={handleMegaEnter}
                onMouseLeave={handleMegaLeave}
              >
                <button
                  onClick={() => setMegaMenuOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-3.5 py-2 rounded-full transition-all duration-200 ${
                    megaMenuOpen
                      ? "text-gold bg-white/10 font-semibold"
                      : "hover:text-ivory hover:bg-white/10"
                  }`}
                >
                  <span>Collections</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      megaMenuOpen ? "rotate-180 text-gold" : ""
                    }`}
                  />
                </button>

                {/* ── Mega Menu Dropdown ── */}
                <AnimatePresence>
                  {megaMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="absolute -left-28 top-full mt-2 w-[840px] bg-ivory rounded-3xl shadow-2xl border border-gold/20 overflow-hidden z-50 text-ink"
                    >
                      {/* Top ribbon */}
                      <div className="bg-ink px-8 py-3.5 flex items-center justify-between border-b border-gold/20 text-ivory">
                        <div className="flex items-center gap-6">
                          {QUICK_LINKS.map((ql) => (
                            <Link
                              key={ql.label}
                              href={ql.href}
                              onClick={() => setMegaMenuOpen(false)}
                              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider hover:text-gold transition-colors"
                            >
                              <ql.icon className={`w-3.5 h-3.5 ${ql.color}`} />
                              {ql.label}
                            </Link>
                          ))}
                        </div>
                        <Link
                          href="/shop"
                          onClick={() => setMegaMenuOpen(false)}
                          className="text-xs text-gold hover:text-ivory transition-colors flex items-center gap-1"
                        >
                          View All Collections <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>

                      {/* Main Category Columns */}
                      <div className="p-8 grid grid-cols-3 gap-8 bg-ivory">
                        {MEGA_COLLECTIONS.map((col) => (
                          <div key={col.category} className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-light/60">
                              <Link
                                href={col.href}
                                onClick={() => setMegaMenuOpen(false)}
                                className="font-serif font-bold text-base text-ink hover:text-rose transition-colors"
                              >
                                {col.category}
                              </Link>
                              {col.badge && (
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose/10 text-rose">
                                  {col.badge}
                                </span>
                              )}
                            </div>
                            <ul className="space-y-2.5">
                              {col.items.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    href={item.href}
                                    onClick={() => setMegaMenuOpen(false)}
                                    className="text-xs text-gray-700 hover:text-rose flex items-center justify-between group transition-colors"
                                  >
                                    <span>{item.name}</span>
                                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-rose" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Bottom Promotional Footer Banner */}
                      <div className="bg-gradient-to-r from-rose/15 via-gold/10 to-rose/15 p-4 px-8 flex items-center justify-between border-t border-gray-light">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-rose text-ivory flex items-center justify-center font-bold text-xs shadow-sm">
                            %
                          </span>
                          <div>
                            <p className="text-xs font-bold text-ink">
                              Seasonal Footwear Clearance — Up to 35% Off
                            </p>
                            <p className="text-[11px] text-gray">
                              Handpicked leather shoes, sneakers, and casuals.
                            </p>
                          </div>
                        </div>
                        <Link
                          href="/shop?onSale=true"
                          onClick={() => setMegaMenuOpen(false)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-ink hover:bg-rose text-ivory text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                        >
                          Shop Sale <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/shop?category=Men%27s+Wear"
                className="px-3.5 py-2 rounded-full hover:text-ivory hover:bg-white/10 transition-all duration-200"
              >
                Men
              </Link>
              <Link
                href="/shop?category=Women%27s+Wear"
                className="px-3.5 py-2 rounded-full hover:text-ivory hover:bg-white/10 transition-all duration-200"
              >
                Women
              </Link>
              <Link
                href="/shop?category=Kids%27+Wear"
                className="px-3.5 py-2 rounded-full hover:text-ivory hover:bg-white/10 transition-all duration-200"
              >
                Kids
              </Link>
              <Link
                href="/shop?sort=new"
                className="px-3.5 py-2 rounded-full hover:text-ivory hover:bg-white/10 transition-all duration-200 flex items-center gap-1 text-gold"
              >
                <Sparkles className="w-3.5 h-3.5" />
                New
              </Link>
              <Link
                href="/shop?onSale=true"
                className="px-3.5 py-2 rounded-full hover:text-ivory hover:bg-white/10 transition-all duration-200 text-rose-light font-semibold"
              >
                Sale
              </Link>
              <Link
                href="/about"
                className="px-3.5 py-2 rounded-full hover:text-ivory hover:bg-white/10 transition-all duration-200"
              >
                About
              </Link>
            </nav>

            {/* Quick Action Icons (Search, Wishlist, Account, Cart, Mobile Menu) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <motion.button
                whileHover={reduce ? {} : { scale: 1.05 }}
                whileTap={reduce ? {} : { scale: 0.95 }}
                onClick={() => setSearchModalOpen(true)}
                className="p-2.5 text-ivory/80 hover:text-ivory hover:bg-white/10 rounded-full transition-all duration-200 relative group"
                aria-label="Search store"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">Search</span>
              </motion.button>

              {/* Wishlist Button with Badge */}
              <Link
                href="/shop"
                className="relative p-2.5 text-ivory/80 hover:text-rose hover:bg-white/10 rounded-full transition-all duration-200 group"
                aria-label={`Wishlist (${wishlistCount} items)`}
                title="Wishlist"
              >
                <motion.div
                  whileHover={reduce ? {} : { scale: 1.1 }}
                  whileTap={reduce ? {} : { scale: 0.9 }}
                >
                  <Heart className="w-5 h-5 group-hover:fill-rose transition-colors" />
                </motion.div>
                <AnimatePresence>
                  {wishlistCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 min-w-[17px] h-[17px] flex items-center justify-center bg-rose text-ivory text-[9px] font-bold rounded-full px-1 shadow-sm"
                    >
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* User Account / Profile */}
              <Link
                href={user ? "/account" : "/account/login"}
                className="p-2.5 text-ivory/80 hover:text-gold hover:bg-white/10 rounded-full transition-all duration-200 relative"
                aria-label={user ? "My Account" : "Sign In"}
                title={user ? "Account" : "Sign In"}
              >
                <motion.div
                  whileHover={reduce ? {} : { scale: 1.05 }}
                  whileTap={reduce ? {} : { scale: 0.95 }}
                >
                  <User className="w-5 h-5" />
                </motion.div>
                {user && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-400 ring-2 ring-ink" />
                )}
              </Link>

              {/* Cart Button with Animated Count Badge */}
              <Link
                href="/cart"
                className="relative p-2.5 text-ivory/80 hover:text-ivory hover:bg-white/10 rounded-full transition-all duration-200"
                aria-label={`Shopping Cart with ${cartCount} items`}
              >
                <motion.div
                  animate={
                    cartBouncing && !reduce
                      ? { scale: [1, 1.35, 0.9, 1.15, 1], rotate: [0, -10, 10, -5, 0] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.5 }}
                >
                  <ShoppingBag className="w-5 h-5" />
                </motion.div>
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-gold text-ink text-[10px] font-bold rounded-full px-1 shadow-md"
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Desktop CTA Pill */}
              <Link
                href="/shop"
                className="hidden xl:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose hover:bg-rose/90 text-ivory text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-md ml-2 hover:shadow-lg"
              >
                <span>Shop Drops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Mobile Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="lg:hidden p-2.5 text-ivory/80 hover:text-ivory hover:bg-white/10 rounded-full transition-colors ml-1"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Navigation Drawer ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
              />

              {/* Drawer Panel */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="fixed inset-y-0 right-0 w-[85vw] max-w-md bg-ink text-ivory z-50 flex flex-col shadow-2xl overflow-hidden lg:hidden border-l border-white/10"
              >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/Logo.png"
                      alt="NK Fashion Store"
                      width={38}
                      height={38}
                      className="rounded-full object-cover ring-2 ring-gold/40"
                    />
                    <div>
                      <p className="font-serif text-base font-bold text-ivory">NK Fashion</p>
                      <p className="text-[10px] text-white/50 uppercase tracking-widest">Store Navigation</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-ivory transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Search Input */}
                <div className="p-4 border-b border-white/10">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSearchModalOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/70 text-xs transition-colors border border-white/10"
                  >
                    <Search className="w-4 h-4 text-gold" />
                    <span>Search shoes, clothes, accessories…</span>
                  </button>
                </div>

                {/* Navigation Links Scroll area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Category Accordion */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gold px-3 mb-2">
                      Main Categories
                    </p>

                    {/* Men */}
                    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/5">
                      <button
                        onClick={() => setMobileCategoryOpen(mobileCategoryOpen === "men" ? null : "men")}
                        className="w-full flex items-center justify-between p-3.5 text-sm font-semibold hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <span>👞</span> Men&apos;s Shoes & Apparel
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileCategoryOpen === "men" ? "rotate-180 text-rose" : ""
                          }`}
                        />
                      </button>
                      {mobileCategoryOpen === "men" && (
                        <div className="p-3 pt-0 pl-8 space-y-2 text-xs text-white/70 border-t border-white/5 bg-black/20">
                          <Link
                            href="/shop?category=Men%27s+Wear"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-gold"
                          >
                            All Men&apos;s Collection
                          </Link>
                          <Link
                            href="/shop?category=Men%27s+Wear&sub=Loafers"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-gold"
                          >
                            Leather Loafers & Casual Shoes
                          </Link>
                          <Link
                            href="/shop?category=Men%27s+Wear&sub=Sneakers"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-gold"
                          >
                            Running & Casual Sneakers
                          </Link>
                          <Link
                            href="/shop?category=Men%27s+Wear&sub=Shirts"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-gold"
                          >
                            Shirts & Bottoms
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Women */}
                    <div className="rounded-xl overflow-hidden bg-white/5 border border-white/5">
                      <button
                        onClick={() => setMobileCategoryOpen(mobileCategoryOpen === "women" ? null : "women")}
                        className="w-full flex items-center justify-between p-3.5 text-sm font-semibold hover:bg-white/5 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <span>👠</span> Women&apos;s Shoes & Wear
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            mobileCategoryOpen === "women" ? "rotate-180 text-rose" : ""
                          }`}
                        />
                      </button>
                      {mobileCategoryOpen === "women" && (
                        <div className="p-3 pt-0 pl-8 space-y-2 text-xs text-white/70 border-t border-white/5 bg-black/20">
                          <Link
                            href="/shop?category=Women%27s+Wear"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-rose"
                          >
                            All Women&apos;s Collection
                          </Link>
                          <Link
                            href="/shop?category=Women%27s+Wear&sub=Heels"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-rose"
                          >
                            High Heels & Party Footwear
                          </Link>
                          <Link
                            href="/shop?category=Women%27s+Wear&sub=Dresses"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1 hover:text-rose"
                          >
                            Dresses & Ethnic Outfits
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Kids */}
                    <Link
                      href="/shop?category=Kids%27+Wear"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span>🧒</span> Kids&apos; Footwear & Clothing
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/40" />
                    </Link>
                  </div>

                  {/* Curated Drops */}
                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gold px-3 mb-2">
                      Special Highlights
                    </p>
                    <Link
                      href="/shop?sort=new"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-sm transition-colors text-gold"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" /> New Arrivals
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/shop?sort=popular"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-sm transition-colors text-rose"
                    >
                      <span className="flex items-center gap-2">
                        <Flame className="w-4 h-4" /> Best Sellers
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/shop?onSale=true"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/10 text-sm transition-colors text-rose-light font-bold"
                    >
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> Clearance & Offers
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* General Links */}
                  <div className="border-t border-white/10 pt-3 space-y-1 text-sm text-white/80">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Home Page
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      About Our Brand
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Customer Support
                    </Link>
                    <Link
                      href="/track-order"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block p-3 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      Track My Order
                    </Link>
                  </div>
                </div>

                {/* Footer Account CTA */}
                <div className="p-4 bg-white/5 border-t border-white/10 space-y-2">
                  <Link
                    href={user ? "/account" : "/account/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-ink font-bold text-xs uppercase tracking-wider shadow-md hover:bg-gold/90 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    {user ? "Go to My Account" : "Sign In / Register"}
                  </Link>
                  <p className="text-center text-[10px] text-white/50">
                    Island-wide Cash on Delivery available across Sri Lanka
                  </p>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
