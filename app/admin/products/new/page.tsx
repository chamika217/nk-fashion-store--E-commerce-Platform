"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { addProduct } from "@/lib/productService";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm, { type ProductFormData } from "@/components/admin/ProductForm";

function NewProductContent() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(data: ProductFormData) {
    setError("");
    try {
      await addProduct({
        ...data,
        createdAt: Date.now(),
      });
      router.push("/admin/products");
    } catch {
      setError("Failed to add product. Please try again.");
      throw new Error("rethrow"); // so ProductForm knows submit failed
    }
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
        <h1 className="font-serif text-2xl font-bold text-ink">Add Product</h1>
      </div>

      {error && (
        <p className="text-sm text-rose mb-4">{error}</p>
      )}

      <ProductForm onSubmit={handleSubmit} submitLabel="Add Product" />
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <AdminShell>
      <NewProductContent />
    </AdminShell>
  );
}
