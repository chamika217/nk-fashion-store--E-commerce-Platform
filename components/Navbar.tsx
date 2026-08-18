"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user } = useCustomerAuth();

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur border-b border-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/Logo.png"
            alt="NK Fashion Store"
            width={48}
            height={48}
            style={{ width: 48, height: 48 }}
            className="rounded-full object-cover"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-ink hover:text-rose transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Account link */}
          <Link
            href={user ? "/account" : "/account/login"}
            className="text-sm text-ink hover:text-rose transition-colors"
          >
            {user ? "My Account" : "Login"}
          </Link>

          <Link
            href="/cart"
            className="relative text-sm text-ink hover:text-rose transition-colors"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-rose text-ivory text-[10px] font-bold leading-none w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Mobile: cart + hamburger */}
        <div className="flex items-center gap-4 md:hidden">
          <Link
            href="/cart"
            className="relative text-sm text-ink hover:text-rose transition-colors"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-rose text-ivory text-[10px] font-bold leading-none w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="p-1 text-ink hover:text-rose transition-colors"
          >
            {menuOpen ? (
              /* X icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className="md:hidden bg-ivory border-t border-gray-light px-4 pb-4 pt-2 flex flex-col gap-3">
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
        </nav>
      )}
    </header>
  );
}
