"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/productService";
import type { Product } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Product["status"] }) {
  const styles = {
    active:       "bg-green-100 text-green-700",
    "out-of-stock": "bg-rose-light text-rose",
    hidden:       "bg-gray-light text-gray",
  };
  const labels = {
    active: "Active",
    "out-of-stock": "Out of Stock",
    hidden: "Hidden",
  };
  return (
    <span
      className={`inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
function ProductListContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await deleteProduct(product.id);
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="font-serif text-2xl font-bold text-ink">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-ink text-ivory text-sm font-medium px-5 py-2 rounded-full hover:bg-rose transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or SKU…"
        className="w-full sm:w-72 rounded-lg border border-gray-light px-3 py-2 text-sm text-ink bg-ivory placeholder:text-gray focus:outline-none focus:ring-2 focus:ring-rose mb-6 transition-colors"
      />

      {loading ? (
        <p className="text-sm text-gray py-12 text-center">Loading products…</p>
      ) : products.length === 0 ? (
        <div className="text-center py-20 flex flex-col items-center gap-3">
          <p className="text-gray">No products yet.</p>
          <Link
            href="/admin/products/new"
            className="text-sm text-rose underline underline-offset-2 hover:text-ink transition-colors"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-light">
            <table className="w-full text-sm">
              <thead className="bg-gray-light/50 text-xs text-gray uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">SKU</th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-light bg-ivory">
                {filtered.map((product) => {
                  const isLow =
                    product.totalStock > 0 &&
                    product.totalStock <= (product.lowStockThreshold ?? 3);
                  const isZero = product.totalStock === 0;
                  return (
                    <tr key={product.id} className="hover:bg-rose-light/20 transition-colors">
                      {/* Thumb + name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-16 rounded-lg overflow-hidden border border-gray-light bg-gray-light shrink-0">
                            {product.images?.[0] ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray text-[8px]">
                                —
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-ink line-clamp-2 max-w-[180px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray font-mono text-xs">
                        {product.sku}
                      </td>
                      <td className="px-4 py-3 text-gray">{product.category}</td>
                      <td className="px-4 py-3 text-right text-ink">
                        Rs. {product.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={
                            isZero
                              ? "font-semibold text-rose"
                              : isLow
                              ? "font-semibold text-gold"
                              : "text-ink"
                          }
                        >
                          {product.totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-xs text-ink border border-gray-light rounded-full px-3 py-1 hover:border-rose hover:text-rose transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-xs text-rose border border-rose/30 rounded-full px-3 py-1 hover:bg-rose hover:text-ivory transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((product) => {
              const isLow =
                product.totalStock > 0 &&
                product.totalStock <= (product.lowStockThreshold ?? 3);
              const isZero = product.totalStock === 0;
              return (
                <div
                  key={product.id}
                  className="border border-gray-light rounded-xl p-4 bg-ivory flex gap-3"
                >
                  <div className="relative w-14 h-16 rounded-lg overflow-hidden border border-gray-light bg-gray-light shrink-0">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-sm font-medium text-ink line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray font-mono">{product.sku}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-ink">
                        Rs. {product.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          isZero ? "text-rose" : isLow ? "text-gold" : "text-gray"
                        }`}
                      >
                        Stock: {product.totalStock}
                      </span>
                      <StatusBadge status={product.status} />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-xs text-ink border border-gray-light rounded-full px-3 py-1 hover:border-rose hover:text-rose transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-xs text-rose border border-rose/30 rounded-full px-3 py-1 hover:bg-rose hover:text-ivory transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && search && (
            <p className="text-center text-gray text-sm py-10">
              No products match &ldquo;{search}&rdquo;.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <AdminShell>
      <ProductListContent />
    </AdminShell>
  );
}
