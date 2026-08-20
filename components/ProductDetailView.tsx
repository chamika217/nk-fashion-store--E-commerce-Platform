"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { trackViewContent, trackAddToCart } from "@/lib/pixels";
import type { Product } from "@/lib/types";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const { user, loading: authLoading } = useCustomerAuth();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // All unique sizes from variants
  const allSizes = useMemo(() => {
    const seen = new Set<string>();
    product.variants?.forEach((v) => seen.add(v.size));
    return Array.from(seen);
  }, [product.variants]);

  // Colors available for the selected size
  const availableColors = useMemo(() => {
    if (!selectedSize) return [];
    const seen = new Set<string>();
    product.variants
      ?.filter((v) => v.size === selectedSize)
      .forEach((v) => seen.add(v.color));
    return Array.from(seen);
  }, [product.variants, selectedSize]);

  // Stock for the selected size+color combo
  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return (
      product.variants?.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      ) ?? null
    );
  }, [product.variants, selectedSize, selectedColor]);

  // Reset color when size changes
  useEffect(() => {
    setSelectedColor("");
    setQty(1);
  }, [selectedSize]);

  // Clamp qty to stock when variant changes
  useEffect(() => {
    if (selectedVariant && qty > selectedVariant.stock) {
      setQty(Math.max(1, selectedVariant.stock));
    }
  }, [selectedVariant, qty]);

  // Check if a size has any stock at all
  function sizeHasStock(size: string): boolean {
    return (
      product.variants?.some((v) => v.size === size && v.stock > 0) ?? false
    );
  }

  // Check if a color has stock for selected size
  function colorHasStock(color: string): boolean {
    return (
      product.variants?.some(
        (v) => v.size === selectedSize && v.color === color && v.stock > 0
      ) ?? false
    );
  }

  const maxQty = selectedVariant?.stock ?? 1;
  const isOutOfStock =
    selectedVariant !== null && (selectedVariant?.stock ?? 0) === 0;
  const isLowStock =
    selectedVariant !== null &&
    selectedVariant.stock > 0 &&
    selectedVariant.stock <= (product.lowStockThreshold ?? 3);
  const canAddToCart =
    !!selectedSize &&
    !isOutOfStock &&
    selectedVariant !== null;

  // Auto-select color if only one available (or no color concept for this product)
  useEffect(() => {
    if (availableColors.length === 1 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  function handleAddToCart() {
    if (!canAddToCart || !selectedVariant) return;

    // Require login to add to cart
    if (!user) {
      router.push(`/account/login?redirect=/product/${product.id}`);
      return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images?.[0] ?? "",
      size: selectedSize,
      color: selectedColor,
      price: product.price,
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <main className="flex-1 bg-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Image Gallery ── */}
          <div className="flex flex-col gap-3">
            {/* Main image */}
            <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-light bg-gray-light">
              {product.images?.[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray text-sm">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      idx === activeImage
                        ? "border-rose"
                        : "border-gray-light hover:border-rose"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} thumbnail ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Details ── */}
          <div className="flex flex-col gap-5">
            {/* Name + price */}
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug">
                {product.name}
              </h1>
              <p className="mt-2 text-xl font-semibold text-rose">
                Rs. {product.price.toLocaleString()}
              </p>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size selector */}
            {allSizes.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => {
                    const hasStock = sizeHasStock(size);
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => hasStock && setSelectedSize(size)}
                        disabled={!hasStock}
                        className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                          isSelected
                            ? "bg-ink text-ivory border-ink"
                            : hasStock
                            ? "border-gray-light text-ink hover:border-rose"
                            : "border-gray-light text-gray cursor-not-allowed opacity-50"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color selector */}
            {selectedSize && availableColors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                  Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const hasStock = colorHasStock(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => hasStock && setSelectedColor(color)}
                        disabled={!hasStock}
                        className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                          isSelected
                            ? "bg-ink text-ivory border-ink"
                            : hasStock
                            ? "border-gray-light text-ink hover:border-rose"
                            : "border-gray-light text-gray cursor-not-allowed opacity-50"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock status */}
            {selectedVariant && (
              <p
                className={`text-sm font-medium ${
                  isOutOfStock ? "text-gray" : isLowStock ? "text-gold" : "text-gray"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : isLowStock
                  ? `Only ${selectedVariant.stock} left!`
                  : `In Stock`}
              </p>
            )}

            {/* Quantity stepper */}
            {canAddToCart && (
              <div>
                <p className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                  Quantity
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-light text-ink hover:border-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-medium text-ink">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                    className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-light text-ink hover:border-rose transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={!canAddToCart || authLoading}
              className={`mt-2 w-full sm:w-auto sm:px-12 py-3 rounded-full text-sm font-medium transition-colors duration-200 ${
                canAddToCart
                  ? added
                    ? "bg-rose text-ivory cursor-default"
                    : "bg-ink text-ivory hover:bg-rose"
                  : "bg-gray-light text-gray cursor-not-allowed"
              }`}
            >
              {added
                ? "Added to Cart ✓"
                : !user && canAddToCart
                ? "Login to Add to Cart"
                : "Add to Cart"}
            </button>

            {/* Metadata */}
            <p className="text-xs text-gray pt-1">
              {product.material && <span>Material: {product.material}</span>}
              {product.material && product.category && <span> · </span>}
              {product.category && (
                <span>
                  {product.category}
                  {product.subcategory && ` / ${product.subcategory}`}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
