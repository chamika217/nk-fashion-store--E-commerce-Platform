import Link from "next/link";
import Image from "next/image";
import { Phone, Mail } from "lucide-react";
import { FacebookIcon, TikTokIcon } from "./icons/SocialIcons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ivory border-t border-gray-light mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Three-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/Logo.png"
                alt="NK Fashion Store"
                width={44}
                height={44}
                className="rounded-full object-cover"
              />
              <span className="font-serif font-bold text-lg text-ink leading-tight">
                NK Fashion Store
              </span>
            </Link>
            <p className="text-sm text-gray leading-relaxed">
              Sri Lankan fashion — dresses, tops, ethnic wear &amp; accessories.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
              Quick Links
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-gray hover:text-rose transition-colors"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray hover:text-rose transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray hover:text-rose transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/track-order"
                  className="text-sm text-gray hover:text-rose transition-colors"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="text-sm font-semibold text-ink uppercase tracking-wider mb-3">
              Connect
            </p>
            <ul className="flex flex-col gap-2">
              <li>
                <a
                  href="tel:0710179823"
                  className="flex items-center gap-2 text-sm text-gray hover:text-rose transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>071 017 9823</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:nimzkp@gmail.com"
                  className="flex items-center gap-2 text-sm text-gray hover:text-rose transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>nimzkp@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/share/1cNJSsvhvH/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray hover:text-rose transition-colors"
                >
                  <FacebookIcon className="w-4 h-4 shrink-0" />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@nimzkp?_r=1&_t=ZS-98qJIUVgBrp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-gray hover:text-rose transition-colors"
                >
                  <TikTokIcon className="w-4 h-4 shrink-0" />
                  <span>TikTok</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-light text-center">
          <p className="text-xs text-gray">
            &copy; {year} NK Fashion Store. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
