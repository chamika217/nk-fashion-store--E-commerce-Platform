"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const prevCount = useRef(0);

  const { cartCount } = useCart();
  const { user }      = useCustomerAuth();
  const reduce        = useReducedMotion();

  // Scroll detection for sticky shrink
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Cart badge bounce when item added
  useEffect(() => {
    if (cartCount > prevCount.current) {
      setCartBounce(true);
      const t = setTimeout(() => setCartBounce(false), 600);
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <motion.header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-ivory/95 backdrop-blur shadow-sm border-gray-light h-14"
          : "bg-ivory/95 backdrop-blur border-gray-light h-16"
      }`}
      initial={reduce ? {} : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <motion.div
            whileHover={reduce ? {} : { scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src="/Logo.png"
              alt="NK Fashion Store"
              width={44}
              height={44}
              style={{ width: scrolled ? 36 : 44, height: scrolled ? 36 : 44 }}
              className="rounded-full object-cover transition-all duration-300"
              priority
            />
          </motion.div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink hover:text-rose transition-colors duration-200 relative group"
            >
              {link.label}
              {/* underline slide-in */}
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-rose group-hover:w-full transition-all duration-200" />
            </Link>
          ))}

          <Link
            href={user ? "/account" : "/account/login"}
            className="text-sm text-ink hover:text-rose transition-colors duration-200 relative group"
          >
            {user ? "My Account" : "Login"}
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-rose group-hover:w-full transition-all duration-200" />
          </Link>

          {/* Cart with bounce badge */}
          <Link href="/cart" className="relative text-sm text-ink hover:text-rose transition-colors duration-200">
            <motion.span
              whileHover={reduce ? {} : { scale: 1.1 }}
              transition={{ duration: 0.15 }}
              className="inline-block"
            >
              Cart
            </motion.span>
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
                  className="absolute -top-2 -right-3 bg-rose text-ivory text-[10px] font-bold leading-none w-4 h-4 flex items-center justify-center rounded-full"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="relative text-sm text-ink hover:text-rose transition-colors duration-200">
            Cart
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={reduce ? {} : { scale: 0.5 }}
                  animate={cartBounce && !reduce
                    ? { scale: [1, 1.4, 0.9, 1] }
                    : { scale: 1 }
                  }
                  transition={{ duration: 0.4 }}
                  className="absolute -top-2 -right-3 bg-rose text-ivory text-[10px] font-bold leading-none w-4 h-4 flex items-center justify-center rounded-full"
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <motion.button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="p-1 text-ink hover:text-rose transition-colors"
            whileTap={reduce ? {} : { scale: 0.9 }}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={reduce ? {} : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-ivory border-t border-gray-light px-4 pb-4 pt-2 flex flex-col gap-3"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-sm text-ink hover:text-rose transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={user ? "/account" : "/account/login"}
              onClick={() => setMenuOpen(false)}
              className="text-sm text-ink hover:text-rose transition-colors py-1"
            >
              {user ? "My Account" : "Login"}
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
