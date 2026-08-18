import type { Metadata } from "next";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = {
  title:       "Shop",
  description:
    "Browse the full NK Fashion Store collection — dresses, tops, ethnic wear, " +
    "kids' clothing and accessories. Sri Lankan fashion with island-wide delivery.",
};

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { category } = await searchParams;

  return (
    <main className="flex-1 bg-ivory py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Shop
          </h1>
          <p className="mt-2 text-gray text-sm">
            Browse our full collection
          </p>
        </div>
        <ShopClient initialCategory={category ?? ""} />
      </div>
    </main>
  );
}
