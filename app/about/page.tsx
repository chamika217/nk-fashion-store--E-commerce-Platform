import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title:       "About Us",
  description:
    "The story behind NK Fashion Store — a Sri Lankan fashion boutique that " +
    "grew from a Facebook page in Tangalle into a full online store.",
};

const VALUES = [
  {
    title: "Quality at Fair Prices",
    body: "We hand-pick every piece for fabric, finish, and fit — so you always get real value, not just a low price tag.",
  },
  {
    title: "Same-Day Order Confirmation",
    body: "Place your order and hear back from us the same day. No waiting in the dark wondering if it went through.",
  },
  {
    title: "Cash on Delivery, Island-Wide",
    body: "No cards, no hassle. We deliver to your door anywhere in Sri Lanka and you pay when it arrives.",
  },
  {
    title: "Trusted by Our Community",
    body: "Hundreds of happy customers found us on Facebook first. Their word-of-mouth is still our biggest compliment.",
  },
];

export default function AboutPage() {
  return (
    <main className="flex-1 bg-ivory">

      {/* ── Hero / Our Story ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-ink mb-10 text-center">
            Our Story
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Brand narrative */}
            <div className="flex flex-col gap-5 text-sm sm:text-base text-gray leading-relaxed">
              <p>
                NK Fashion Store started the way most honest businesses do — with
                a passion and a phone. From a small Facebook page based in
                Tangalle, we began sharing the styles we loved: flowing dresses,
                everyday tops, ethnic pieces for festive seasons, and accessories
                that finish a look. The response from our community was
                immediate, warm, and kept us going.
              </p>
              <p>
                Over time, what started as weekend posts turned into a
                full-fledged boutique. Our TikTok followers watched hauls,
                styling tips, and behind-the-scenes moments that showed we
                weren&apos;t just selling clothes — we were building a community
                around style that feels Sri Lankan, personal, and real. Every
                comment, every DM asking &ldquo;is this in stock?&rdquo; reminded us that
                people wanted more than a scroll — they wanted a proper store.
              </p>
              <p>
                This online store is our answer to that. The same pieces, the
                same care, and the same personal touch — now with the convenience
                of shopping from anywhere in the island, with cash on delivery
                and same-day confirmations. We&apos;re still the small team from
                Tangalle who picks every item with intention. We just have a
                proper home now.
              </p>
            </div>

            {/* Brand photo */}
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-gray-light">
              <Image
                src="/Brand.png"
                alt="NK Fashion Store brand photo"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── What We Offer ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 bg-ivory border-t border-gray-light">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-8 text-center">
            What We Offer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-gray-light p-6 flex flex-col gap-2 hover:border-rose transition-colors duration-200"
              >
                <p className="font-semibold text-ink text-sm">{v.title}</p>
                <p className="text-sm text-gray leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="py-16 px-4 text-center">
        <p className="text-gray text-sm mb-6">
          Ready to find something you love?
        </p>
        <Link
          href="/shop"
          className="bg-ink text-ivory text-sm font-medium px-10 py-3 rounded-full hover:bg-rose transition-colors duration-200"
        >
          Explore Our Collection
        </Link>
      </section>
    </main>
  );
}
