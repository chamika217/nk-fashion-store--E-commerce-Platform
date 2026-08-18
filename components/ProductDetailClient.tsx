"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/productService";
import type { Product } from "@/lib/types";
import ProductDetailView from "@/components/ProductDetailView";

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    getProductById(id)
      .then((p) => setProduct(p))
      .catch(() => setProduct(null));
  }, [id]);

  // Loading state
  if (product === undefined) {
    return (
      <main className="flex-1 bg-ivory flex items-center justify-center py-24">
        <p className="text-sm text-gray animate-pulse">Loading…</p>
      </main>
    );
  }

  // Not found
  if (product === null) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
