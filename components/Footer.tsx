import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { FacebookIcon, TikTokIcon } from "./icons/SocialIcons";

const SHOP_LINKS = [
  { label: "Women's Wear", href: "/shop?category=Women%27s+Wear" },
  { label: "Men's Wear",   href: "/shop?category=Men%27s+Wear"   },
  { label: "Kids' Wear",   href: "/shop?category=Kids%27+Wear"   },
  { label: "Accessories",  href: "/shop?category=Accessories"    },
  { label: "New Arrivals", href: "/shop"                          },
];

const HELP_LINKS = [
  { label: "Track Order",       href: "/track-order"     },
  { label: "Contact Us",        href: "/contact"         },
  { label: "About Us",          href: "/about"           },
  { label: "My Account",        href: "/account"         },
  { label: "My Orders",         href: "/account"         },
];

const PAYMENT_METHODS = ["COD", "Bank Transfer"];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-ivory/80">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="flex flex-col gap-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/Logo.png"
                alt="NK Fashion Store"
                width={48}
                height={48}
                className="rounded-full object-cover ring-2 ring-gold/40"
              />
              <div>
                <p className="font-serif font-bold text-ivory text-base leading-tight">
                  NK Fashion Store
                </p>
                <p className="text-[10px] text-gold uppercase tracking-widest">
                  Tangalle, Sri Lanka
                </p>
              </div>
            </Link>
            <p className="text-sm text-ivory/60 leading-relaxed">
              Timeless Sri Lankan fashion — dresses, tops, ethnic wear &amp; accessories. Island-wide Cash on Delivery.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.facebook.com/share/1cNJSsvhvH/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-rose/80 text-ivory/70 hover:text-ivory transition-all duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@nimzkp?_r=1&_t=ZS-98qJIUVgBrp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-rose/80 text-ivory/70 hover:text-ivory transition-all duration-200"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-4">
              Shop
            </p>
            <ul className="flex flex-col gap-2.5">
              {SHOP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ivory/60 hover:text-ivory hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-rose">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help / Customer Service column */}
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-4">
              Customer Service
            </p>
            <ul className="flex flex-col gap-2.5">
              {HELP_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ivory/60 hover:text-ivory hover:translate-x-1 transition-all duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 overflow-hidden transition-all duration-200 text-rose">›</span>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-4">
              Get in Touch
            </p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="tel:0710179823"
                  className="flex items-start gap-2.5 text-sm text-ivory/60 hover:text-ivory transition-colors group"
                >
                  <Phone className="w-4 h-4 shrink-0 mt-0.5 text-rose group-hover:text-gold transition-colors" />
                  <span>071 017 9823</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:nimzkp@gmail.com"
                  className="flex items-start gap-2.5 text-sm text-ivory/60 hover:text-ivory transition-colors group"
                >
                  <Mail className="w-4 h-4 shrink-0 mt-0.5 text-rose group-hover:text-gold transition-colors" />
                  <span>nimzkp@gmail.com</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-ivory/60">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-rose" />
                <span>Tangalle, Sri Lanka<br /><span className="text-xs text-ivory/40">Island-wide delivery</span></span>
              </li>
            </ul>

            {/* Payment methods */}
            <div className="mt-5">
              <p className="text-[10px] text-ivory/40 uppercase tracking-widest mb-2">We Accept</p>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <span key={m} className="text-[10px] font-semibold border border-white/20 rounded px-2 py-0.5 text-ivory/50">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ivory/30">
            &copy; {year} NK Fashion Store. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors">Privacy</Link>
            <Link href="/about" className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors">Terms</Link>
            <Link href="/contact" className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors">Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
