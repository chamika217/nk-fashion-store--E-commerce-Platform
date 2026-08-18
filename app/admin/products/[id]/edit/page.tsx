"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById, updateProduct } from "@/lib/productService";
import type { Product } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm, { type ProductFormData } from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

function EditProductContent({ id }: { id: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    getProductById(id)
      .then((p) => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: ProductFormData) {
    setError("");
    try {
      await updateProduct(id, {
        ...data,
        totalStock: data.totalStock,
      });
      router.push("/admin/products");
    } catch {
      setError("Failed to update product. Please try again.");
      throw new Error("rethrow");
    }
  }

  if (loading) {
    return (
      <p className="text-sm text-gray py-12 text-center">Loading product…</p>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <p className="text-gray">Product not found.</p>
        <Link
          href="/admin/products"
          className="text-sm text-rose underline underline-offset-2 hover:text-ink transition-colors"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/admin/products"
          className="text-xs text-gray hover:text-rose transition-colors"
        >
          ← Products
        </Link>
        <span className="text-gray-light">/</span>
        <h1 className="font-serif text-2xl font-bold text-ink">
          Edit Product
        </h1>
      </div>

      {error && <p className="text-sm text-rose mb-4">{error}</p>}

      <ProductForm
        initialProduct={product}
        onSubmit={handleSubmit}
        submitLabel="Update Product"
      />
    </div>
  );
}

export default function AdminEditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  return (
    <AdminShell>
      <EditProductContent id={id} />
    </AdminShell>
  );
}
