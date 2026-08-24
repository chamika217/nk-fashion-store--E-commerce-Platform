"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getProductById } from "@/lib/productService";
import type { Product } from "@/lib/types";
import ProductDetailView from "@/components/ProductDetailView";

interface ProductDetailClientProps {
  id: string;
}

type LoadState = "loading" | "success" | "notfound" | "error";

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const [product, setProduct]   = useState<Product | null>(null);
  const [state, setState]       = useState<LoadState>("loading");
  const [retryCount, setRetryCount] = useState(0);

  const load = useCallback(() => {
    setState("loading");
    getProductById(id)
      .then((p) => {
        if (p) {
          setProduct(p);
          setState("success");
        } else {
          setState("notfound");
        }
      })
      .catch((err) => {
        console.warn("[ProductDetailClient] Firestore fetch failed:", err?.code ?? err);
        setState("error");
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load, retryCount]);

  if (state === "loading") {
    return (
      <main className="flex-1 bg-ivory flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-2 border-rose border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray">Loading product…</p>
      </main>
    );
  }

  if (state === "notfound") {
    return (
      <main className="flex-1 bg-ivory flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
        <p className="text-4xl">🔍</p>
        <h1 className="font-serif text-2xl font-bold text-ink">Product Not Found</h1>
        <p className="text-sm text-gray max-w-xs">
          This product may have been removed or the link is incorrect.
        </p>
        <Link
          href="/shop"
          className="bg-ink text-ivory text-sm font-medium px-8 py-3 rounded-full hover:bg-rose transition-colors"
        >
          Back to Shop
        </Link>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="flex-1 bg-ivory flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
        <p className="text-4xl">⚡</p>
        <h1 className="font-serif text-xl font-bold text-ink">Connection Issue</h1>
        <p className="text-sm text-gray max-w-xs">
          Couldn&apos;t load this product right now. Please check your connection and try again.
        </p>
        <button
          onClick={() => setRetryCount((c) => c + 1)}
          className="bg-ink text-ivory text-sm font-medium px-8 py-3 rounded-full hover:bg-rose transition-colors"
        >
          Try Again
        </button>
        <Link href="/shop" className="text-xs text-gray hover:text-rose transition-colors">
          Back to Shop
        </Link>
      </main>
    );
  }

  if (!product) return null;

  return <ProductDetailView product={product} />;
}
