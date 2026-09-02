import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "The story behind NK Fashion Store — a Sri Lankan fashion boutique that " +
    "grew from a Facebook page in Tangalle into a full online store.",
};

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "500+", label: "Happy Customers" },
  { value: "200+", label: "Products" },
  { value: "24h",  label: "Order Confirmation" },
  { value: "9+",   label: "Provinces Delivered" },
];

const VALUES = [
  {
    icon: "✦",
    title: "Quality at Fair Prices",
    body: "We hand-pick every piece for fabric, finish, and fit — so you always get real value, not just a low price tag.",
    accent: "from-rose/10 to-rose/5",
    border: "border-rose/20",
  },
  {
    icon: "⚡",
    title: "Same-Day Confirmation",
    body: "Place your order and hear back from us the same day. No waiting in the dark wondering if it went through.",
    accent: "from-gold/10 to-gold/5",
    border: "border-gold/20",
  },
  {
    icon: "🚚",
    title: "Cash on Delivery",
    body: "No cards, no hassle. We deliver to your door anywhere in Sri Lanka and you pay when it arrives.",
    accent: "from-emerald-50 to-emerald-50/30",
    border: "border-emerald-200/60",
  },
  {
    icon: "❤",
    title: "Community First",
    body: "Hundreds of happy customers found us on Facebook first. Their word-of-mouth is still our biggest compliment.",
    accent: "from-rose/10 to-rose/5",
    border: "border-rose/20",
  },
];

const TIMELINE = [
  {
    year: "2020",
    title: "It Started on Facebook",
    body: "A small page from Tangalle sharing styles we loved — dresses, tops, ethnic pieces. The community responded immediately.",
  },
  {
    year: "2022",
    title: "TikTok & Growing",
    body: "Hauls, styling tips, and behind-the-scenes moments built a real following. People didn't just want products — they wanted a brand.",
  },
  {
    year: "2024",
    title: "NK Fashion Store Launched",
    body: "The same care, same pieces, now with the convenience of island-wide delivery, cash on delivery, and a proper home.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <main className="flex-1 bg-ivory overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-ink text-ivory overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-rose/10 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — text */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-rose" />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-rose">
                  Our Story
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ivory leading-tight">
                Fashion from the
                <span className="block text-gold">Heart of</span>
                Tangalle
              </h1>

              <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md">
                NK Fashion Store started the way most honest businesses do —
                with a passion and a phone. From a small Facebook page in
                Tangalle, we began sharing the styles we loved and the rest
                is a community story.
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-rose text-ivory text-sm font-semibold px-7 py-3 rounded-full hover:bg-rose/90 transition-colors"
                >
                  Shop Now
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link
                  href="/contact"
                  className="text-sm text-white/60 hover:text-ivory transition-colors underline underline-offset-4"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Right — brand image */}
            <div className="relative">
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <Image
                  src="/Brand.png"
                  alt="NK Fashion Store brand photo"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                {/* Overlay label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/80 to-transparent p-6">
                  <p className="font-serif text-lg font-bold text-ivory">NK Fashion Store</p>
                  <p className="text-xs text-white/60 mt-0.5">Tangalle, Sri Lanka</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-gold text-ink text-xs font-bold px-4 py-2 rounded-full shadow-lg">
                Est. 2020
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────── */}
      <section className="bg-rose text-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="font-serif text-3xl sm:text-4xl font-bold">
                  {s.value}
                </span>
                <span className="text-xs uppercase tracking-widest text-rose-light/80 font-medium">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BRAND STORY ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-rose">
              How We Got Here
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2">
              Our Journey
            </h2>
            <div className="w-12 h-0.5 bg-rose mx-auto mt-4" />
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line — desktop only */}
            <div className="hidden md:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-gray-light" />

            <div className="flex flex-col gap-10">
              {TIMELINE.map((item, idx) => (
                <div
                  key={item.year}
                  className={`relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0 ${
                    idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Content card */}
                  <div className="md:w-[calc(50%-2.5rem)] w-full">
                    <div
                      className={`bg-ivory border border-gray-light rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-rose/30 transition-all duration-300 ${
                        idx % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                      }`}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest text-rose">
                        {item.year}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-ink mt-1 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray leading-relaxed">{item.body}</p>
                    </div>
                  </div>

                  {/* Center dot — desktop */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-ink border-4 border-rose items-center justify-center text-ivory text-xs font-bold shadow-lg">
                    {idx + 1}
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block md:w-[calc(50%-2.5rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FULL BRAND STORY TEXT ─────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-ink text-ivory">
        <div className="max-w-3xl mx-auto text-center flex flex-col gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            In Our Own Words
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold">
            More Than a Store
          </h2>
          <div className="flex flex-col gap-4 text-white/70 text-sm sm:text-base leading-relaxed text-left">
            <p>
              Over time, what started as weekend posts turned into a
              full-fledged boutique. Our TikTok followers watched hauls,
              styling tips, and behind-the-scenes moments that showed we
              weren&apos;t just selling clothes — we were building a community
              around style that feels Sri Lankan, personal, and real.
            </p>
            <p>
              Every comment, every DM asking &ldquo;is this in stock?&rdquo; reminded us
              that people wanted more than a scroll — they wanted a proper
              store. This online store is our answer to that.
            </p>
            <p>
              The same pieces, the same care, and the same personal touch —
              now with the convenience of shopping from anywhere in the island,
              with cash on delivery and same-day confirmations. We&apos;re still
              the small team from Tangalle who picks every item with
              intention. We just have a proper home now.
            </p>
          </div>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-rose">
              Why Choose Us
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2">
              What We Stand For
            </h2>
            <div className="w-12 h-0.5 bg-rose mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className={`relative rounded-2xl border ${v.border} bg-gradient-to-br ${v.accent} p-7 flex gap-5 group hover:shadow-md transition-all duration-300`}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-ivory border border-gray-light flex items-center justify-center text-xl shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {v.icon}
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-serif text-base font-bold text-ink">
                    {v.title}
                  </h3>
                  <p className="text-sm text-gray leading-relaxed">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION & VISION ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-light/30 border-y border-gray-light">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-ivory rounded-3xl p-8 border border-gray-light shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose/10 border border-rose/20 flex items-center justify-center text-rose text-xl">
              🎯
            </div>
            <h3 className="font-serif text-xl font-bold text-ink">Our Mission</h3>
            <p className="text-sm text-gray leading-relaxed">
              To make quality Sri Lankan fashion accessible to everyone — at
              fair prices, with honest service, delivered to your doorstep
              anywhere on the island. We believe every customer deserves to
              feel confident, comfortable, and stylish without paying a
              premium.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-ink rounded-3xl p-8 border border-white/10 shadow-sm flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold text-xl">
              ✨
            </div>
            <h3 className="font-serif text-xl font-bold text-ivory">Our Vision</h3>
            <p className="text-sm text-white/70 leading-relaxed">
              To become the most trusted and loved online fashion destination
              in Sri Lanka — a brand known for its genuine community,
              curated style, and unwavering commitment to quality and
              customer satisfaction from Tangalle to the whole island.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 text-center bg-ivory">
        <div className="max-w-xl mx-auto flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center text-3xl">
            👗
          </div>
          <h2 className="font-serif text-3xl font-bold text-ink">
            Ready to Find Your Style?
          </h2>
          <p className="text-gray text-sm max-w-sm">
            Browse our full collection of curated fashion — women&apos;s wear,
            men&apos;s wear, kids&apos; clothing, and accessories. Island-wide delivery,
            cash on delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-ink text-ivory text-sm font-semibold px-10 py-3.5 rounded-full hover:bg-rose transition-colors duration-200 shadow-md"
            >
              Explore Collection
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="text-sm text-gray hover:text-rose transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
