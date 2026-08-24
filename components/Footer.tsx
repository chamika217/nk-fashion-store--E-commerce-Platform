import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { FacebookIcon, TikTokIcon } from "./icons/SocialIcons";

const SHOP_LINKS = [
  { label: "Women's Wear", href: "/shop?category=Women%27s+Wear" },
  { label: "Men's Wear",   href: "/shop?category=Men%27s+Wear"   },
  { label: "Kids' Wear",   href: "/shop?category=Kids%27+Wear"   },
  { label: "New Arrivals", href: "/shop"                          },
  { label: "Best Sellers", href: "/shop"                          },
  { label: "Sale",         href: "/shop?onSale=true"              },
];

const HELP_LINKS = [
  { label: "Contact Us",        href: "/contact" },
  { label: "FAQ / Support",     href: "/contact" },
  { label: "Track Your Order",  href: "/track-order" },
  { label: "Shipping & Returns",href: "/about" },
];

const ACCOUNT_LINKS = [
  { label: "My Profile",   href: "/account" },
  { label: "My Orders",    href: "/account" },
  { label: "Sign Up / Log In", href: "/account/login" },
];

const PAYMENT_METHODS = ["COD", "Bank Transfer", "Visa / MasterCard"];

export default function Footer() {
  const year = new Date().getFullYear();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Thank you for subscribing to our newsletter!");
  };

  return (
    <footer className="bg-ink text-ivory/80 border-t border-gold/10">
      {/* Newsletter Strip */}
      <div className="bg-ink border-b border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-ivory">Join our VIP Club</h3>
            <p className="text-xs text-gray mt-1">Subscribe for exclusive early access to drops and sales alerts.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2">
            <input
              type="email"
              required
              placeholder="Your email address"
              className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs sm:text-sm text-ivory outline-none focus:border-rose focus:ring-1 focus:ring-rose transition-colors"
            />
            <button
              type="submit"
              className="bg-rose text-ivory px-4 py-2 rounded-full text-xs font-semibold hover:bg-rose/90 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-3 h-3" />
              <span>Subscribe</span>
            </button>
          </form>
        </div>
      </div>

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
              Elevated, premium everyday wardrobe styles. Hand-picked fabrics, designed with care, delivered right to your doorstep.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.facebook.com/share/1cNJSsvhvH/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-rose text-ivory/70 hover:text-ivory border border-white/10 hover:border-transparent transition-all duration-200"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.tiktok.com/@nimzkp?_r=1&_t=ZS-98qJIUVgBrp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 hover:bg-rose text-ivory/70 hover:text-ivory border border-white/10 hover:border-transparent transition-all duration-200"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-4">
              Shop Collections
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

          {/* Customer Service column */}
          <div>
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-4">
              Customer Support
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
            
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mt-6 mb-3">
              My Account
            </p>
            <ul className="flex flex-col gap-2">
              {ACCOUNT_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-ivory/60 hover:text-ivory hover:translate-x-0.5 transition-all duration-150 inline-flex items-center gap-1"
                  >
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
              <div className="flex flex-wrap gap-2">
                {PAYMENT_METHODS.map((m) => (
                  <span key={m} className="text-[9px] font-semibold border border-white/10 bg-white/5 rounded px-2 py-0.5 text-ivory/50">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ivory/30">
            &copy; {year} NK Fashion Store. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-4 gap-y-2">
            <Link href="/about" className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors">Privacy Policy</Link>
            <Link href="/about" className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors">Terms of Use</Link>
            <Link href="/contact" className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors">Returns &amp; Exchanges</Link>
            <Link href="/track-order" className="text-xs text-ivory/30 hover:text-ivory/60 transition-colors">Track Order</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
