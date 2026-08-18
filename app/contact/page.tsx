import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { FacebookIcon, TikTokIcon } from "@/components/icons/SocialIcons";

export const metadata: Metadata = {
  title:       "Contact",
  description:
    "Get in touch with NK Fashion Store. Ask us about orders, sizing, " +
    "or any of our pieces — we respond within 24 hours.",
};

const PHONE = "071 017 9823";
const EMAIL = "nimzkp@gmail.com";
const FACEBOOK_URL = "https://www.facebook.com/share/1cNJSsvhvH/";
const TIKTOK_URL =
  "https://www.tiktok.com/@nimzkp?_r=1&_t=ZS-98qJIUVgBrp";

export default function ContactPage() {
  return (
    <main className="flex-1 bg-ivory py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

          {/* ── Left: Contact Info ── */}
          <div className="flex flex-col gap-7">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
                Get in Touch
              </h1>
              <p className="mt-3 text-sm text-gray leading-relaxed">
                Have a question about an order, sizing, or a specific piece?
                We&apos;re a small team and we actually read every message — reach
                out and we&apos;ll get back to you personally.
              </p>
            </div>

            {/* Contact details */}
            <ul className="flex flex-col gap-5">
              {/* Phone / WhatsApp */}
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-0.5">
                    Phone / WhatsApp
                  </p>
                  <a
                    href="tel:0710179823"
                    className="text-sm text-ink hover:text-rose transition-colors"
                  >
                    Call or WhatsApp: {PHONE}
                  </a>
                </div>
              </li>

              {/* Email */}
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-0.5">
                    Email
                  </p>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-sm text-ink hover:text-rose transition-colors"
                  >
                    {EMAIL}
                  </a>
                </div>
              </li>

              {/* Facebook */}
              <li className="flex items-start gap-3">
                <FacebookIcon className="w-5 h-5 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-0.5">
                    Facebook
                  </p>
                  <a
                    href={FACEBOOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink hover:text-rose transition-colors"
                  >
                    Message us on Facebook
                  </a>
                </div>
              </li>

              {/* TikTok */}
              <li className="flex items-start gap-3">
                <TikTokIcon className="w-5 h-5 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-0.5">
                    TikTok
                  </p>
                  <a
                    href={TIKTOK_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-ink hover:text-rose transition-colors"
                  >
                    @nimzkp on TikTok
                  </a>
                </div>
              </li>

              {/* Location */}
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-0.5">
                    Location
                  </p>
                  <p className="text-sm text-gray">
                    Tangalle, Sri Lanka
                  </p>
                  <p className="text-xs text-gray mt-0.5">
                    Island-wide delivery available via courier.
                  </p>
                </div>
              </li>

              {/* Response time */}
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-rose mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-0.5">
                    Response Time
                  </p>
                  <p className="text-sm text-gray">
                    We respond to all messages within 24 hours.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* ── Right: Contact Form ── */}
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink mb-6">
              Send a Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
