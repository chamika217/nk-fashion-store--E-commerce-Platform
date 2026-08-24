"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

// ── Shop mega-menu categories ─────────────────────────────────────────────────
const SHOP_CATEGORIES = [
  {
    label: "Women",
    href: "/shop?category=Women%27s+Wear",
    icon: "👗",
    sub: [
      { label: "Dresses",     href: "/shop?category=Women%27s+Wear&sub=Dresses"     },
      { label: "Tops",        href: "/shop?category=Women%27s+Wear&sub=Tops"        },
      { label: "Bottoms",     href: "/shop?category=Women%27s+Wear&sub=Bottoms"     },
      { label: "Ethnic Wear", href: "/shop?category=Women%27s+Wear&sub=Ethnic+Wear" },
    ],
  },
  {
    label: "Men",
    href: "/shop?category=Men%27s+Wear",
    icon: "👔",
    sub: [
      { label: "Shirts",   href: "/shop?category=Men%27s+Wear&sub=Shirts"   },
      { label: "T-Shirts", href: "/shop?category=Men%27s+Wear&sub=T-Shirts" },
      { label: "Bottoms",  href: "/shop?category=Men%27s+Wear&sub=Bottoms"  },
    ],
  },
  {
    label: "Kids",
    href: "/shop?category=Kids%27+Wear",
    icon: "🧒",
    sub: [
      { label: "Girls", href: "/shop?category=Kids%27+Wear&sub=Girls" },
      { label: "Boys",  href: "/shop?category=Kids%27+Wear&sub=Boys"  },
    ],
  },
  {
    label: "New Arrivals",
    href: "/shop?sort=new",
    icon: "✨",
    sub: [
      { label: "Latest Outfits",  href: "/shop?sort=new"                              },
      { label: "Seasonal Drops",  href: "/shop?sort=new"                              },
    ],
  },
  {
    label: "Best Sellers",
    href: "/shop?sort=popular",
    icon: "🔥",
    sub: [
      { label: "Trending",            href: "/shop?sort=popular" },
      { label: "Customer Favorites",  href: "/shop?sort=popular" },
    ],
  },
  {
    label: "Sale",
    href: "/shop?onSale=true",
    icon: "🏷️",
    sub: [
      { label: "Special Offers", href: "/shop?onSale=true" },
      { label: "Clearance",      href: "/shop?onSale=true" },
    ],
  },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

// ── Cart SVG icon ─────────────────────────────────────────────────────────────
function CartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className ?? "w-5 h-5"}>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

// ── Search SVG icon ───────────────────────────────────────────────────────────
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className ?? "w-5 h-5"}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ── User SVG icon ─────────────────────────────────────────────────────────────
function UserIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className ?? "w-5 h-5"}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [shopOpen, setShopOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ]       = useState("");
  const prevCount = useRef(0);
  const shopRef   = useRef<HTMLDivElement>(null);

  const { cartCount } = useCart();
  const { user }      = useCustomerAuth();
  const reduce        = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  // Close shop dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQ.trim())}`;
    }
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ink/95 backdrop-blur shadow-lg h-14"
          : "bg-ink h-16"
      }`}
      initial={reduce ? {} : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" as const }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-rose via-gold to-rose" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <motion.div whileHover={reduce ? {} : { scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Image
              src="/Logo.png"
              alt="NK Fashion Store"
              width={scrolled ? 36 : 42}
              height={scrolled ? 36 : 42}
              style={{ width: scrolled ? 36 : 42, height: scrolled ? 36 : 42 }}
              className="rounded-full object-cover ring-2 ring-gold/30 transition-all duration-300"
              priority
            />
          </motion.div>
          <span className="hidden sm:block font-serif text-ivory text-sm font-semibold tracking-wide leading-tight">
            NK Fashion
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 text-sm text-ivory/80 hover:text-ivory hover:bg-white/10 rounded-lg transition-all duration-200 relative group"
            >
              {link.label}
            </Link>
          ))}

          {/* Shop with mega dropdown */}
          <div
            ref={shopRef}
            className="relative"
            onMouseEnter={() => setShopOpen(true)}
            onMouseLeave={() => setShopOpen(false)}
          >
            <button
              onClick={() => setShopOpen((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-ivory/80 hover:text-ivory hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              Shop
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-3.5 h-3.5 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Mega dropdown */}
            <AnimatePresence>
              {shopOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[650px] bg-ivory rounded-2xl shadow-2xl border border-gold/20 overflow-hidden z-50"
                >
                  {/* Dropdown header */}
                  <div className="bg-ink px-6 py-4 flex items-center justify-between border-b border-gold/10">
                    <p className="text-xs font-semibold text-gold uppercase tracking-widest">
                      Shop by Collection
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setShopOpen(false)}
                      className="text-xs text-ivory/70 hover:text-rose transition-colors"
                    >
                      Explore All Collections →
                    </Link>
                  </div>

                  {/* Categories grid */}
                  <div className="grid grid-cols-3 gap-6 p-6">
                    {SHOP_CATEGORIES.map((cat) => (
                      <div key={cat.label} className="flex flex-col gap-1.5">
                        <Link
                          href={cat.href}
                          onClick={() => setShopOpen(false)}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-rose-light/20 transition-all duration-200 group border border-transparent hover:border-rose-light/30"
                        >
                          <span className="text-xl bg-white p-1.5 rounded-lg shadow-xs group-hover:scale-110 transition-transform duration-250">{cat.icon}</span>
                          <span className="text-sm font-semibold text-ink group-hover:text-rose transition-colors">
                            {cat.label}
                          </span>
                        </Link>
                        {cat.sub.length > 0 && (
                          <div className="pl-3 flex flex-col gap-1.5">
                            {cat.sub.map((s) => (
                              <Link
                                key={s.label}
                                href={s.href}
                                onClick={() => setShopOpen(false)}
                                className="text-xs text-gray hover:text-rose transition-colors py-0.5 border-l border-gray-light hover:border-rose pl-3"
                              >
                                {s.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <div className="relative hidden sm:block">
            {searchOpen ? (
              <motion.form
                onSubmit={handleSearch}
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center bg-white/10 rounded-full px-3 overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search products…"
                  className="bg-transparent text-ivory text-sm placeholder:text-ivory/40 outline-none py-1.5 w-full"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-ivory/60 hover:text-ivory ml-1 shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </motion.form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-ivory/70 hover:text-ivory hover:bg-white/10 rounded-lg transition-all duration-200"
                aria-label="Search"
              >
                <SearchIcon />
              </button>
            )}
          </div>

          {/* Account */}
          <Link
            href={user ? "/account" : "/account/login"}
            className="p-2 text-ivory/70 hover:text-ivory hover:bg-white/10 rounded-lg transition-all duration-200"
            aria-label={user ? "My Account" : "Login"}
          >
            <UserIcon />
          </Link>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 text-ivory/70 hover:text-ivory hover:bg-white/10 rounded-lg transition-all duration-200" aria-label="Cart">
            <motion.div
              whileHover={reduce ? {} : { scale: 1.1 }}
              transition={{ duration: 0.15 }}
            >
              <CartIcon />
            </motion.div>
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={reduce ? {} : { scale: 0.5, opacity: 0 }}
                  animate={cartBounce && !reduce
                    ? { scale: [1, 1.4, 0.9, 1.1, 1], opacity: 1 }
                    : { scale: 1, opacity: 1 }
                  }
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute -top-0.5 -right-0.5 bg-rose text-ivory text-[9px] font-bold leading-none w-4 h-4 flex items-center justify-center rounded-full"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Mobile hamburger */}
          <motion.button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 text-ivory/70 hover:text-ivory hover:bg-white/10 rounded-lg transition-colors"
            whileTap={reduce ? {} : { scale: 0.9 }}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={reduce ? {} : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" as const }}
            className="md:hidden overflow-hidden bg-ink border-t border-white/10 px-4 pb-5 pt-3"
          >
            {/* Shop categories mobile */}
            <p className="text-[10px] text-gold uppercase tracking-widest mb-2 px-1">Shop</p>
            <div className="grid grid-cols-2 gap-1 mb-4">
              {SHOP_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-ivory/80 hover:text-ivory text-sm transition-colors"
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-white/10 pt-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2 text-sm text-ivory/70 hover:text-ivory hover:bg-white/10 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={user ? "/account" : "/account/login"}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2 text-sm text-ivory/70 hover:text-ivory hover:bg-white/10 rounded-lg transition-colors"
              >
                {user ? "My Account" : "Login"}
              </Link>
            </div>

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mt-3 flex items-center bg-white/10 rounded-full px-4 py-2 gap-2">
              <SearchIcon className="w-4 h-4 text-ivory/50 shrink-0" />
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search products…"
                className="bg-transparent text-ivory text-sm placeholder:text-ivory/40 outline-none flex-1"
              />
            </form>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
