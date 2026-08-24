"use client";

import { useState, useMemo, useEffect, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { trackViewContent, trackAddToCart } from "@/lib/pixels";
import { getProductsByCategory, getProductById } from "@/lib/productService";
import type { Product } from "@/lib/types";

interface ProductDetailViewProps {
  product: Product;
}

// ── Size Guide data ───────────────────────────────────────────────────────────
const SIZE_GUIDE = [
  { size: "XS", chest: "32",  waist: "24", hip: "34" },
  { size: "S",  chest: "34",  waist: "26", hip: "36" },
  { size: "M",  chest: "36",  waist: "28", hip: "38" },
  { size: "L",  chest: "38",  waist: "30", hip: "40" },
  { size: "XL", chest: "40",  waist: "32", hip: "42" },
];

// ── Shipping strip icon SVGs ──────────────────────────────────────────────────
function TruckIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM1 3h12v11H1V3zm12 2l3 4h2v5h-5V5z" />
    </svg>
  );
}
function CashIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const { user } = useCustomerAuth();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // UI state for new features
  const [shippingOpen, setShippingOpen] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // "You May Also Like" state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Wishlist state
  const [wishlisted, setWishlisted] = useState(false);

  // Recently viewed state
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Wishlist toggle handler
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nk-wishlist");
      const list: string[] = stored ? JSON.parse(stored) : [];
      setWishlisted(list.includes(product.id));
    } catch {
      // Ignore storage errors
    }
  }, [product.id]);

  const toggleWishlist = () => {
    try {
      const stored = localStorage.getItem("nk-wishlist");
      let list: string[] = stored ? JSON.parse(stored) : [];
      if (list.includes(product.id)) {
        list = list.filter((id) => id !== product.id);
        setWishlisted(false);
      } else {
        list.push(product.id);
        setWishlisted(true);
      }
      localStorage.setItem("nk-wishlist", JSON.stringify(list));
    } catch {
      // Ignore storage errors
    }
  };

  // Recently Viewed logic
  useEffect(() => {
    if (!product || !product.id) return;
    try {
      const key = "nk-recently-viewed";
      const stored = localStorage.getItem(key);
      const list: string[] = stored ? JSON.parse(stored) : [];
      const updated = [product.id, ...list.filter((id) => id !== product.id)].slice(0, 5);
      localStorage.setItem(key, JSON.stringify(updated));

      // Fetch actual product profiles for other recently viewed items
      const fetchIds = updated.filter((id) => id !== product.id).slice(0, 4);
      Promise.all(fetchIds.map((id) => getProductById(id)))
        .then((res) => {
          setRecentlyViewed(res.filter((p): p is Product => p !== null && p !== undefined));
        })
        .catch(() => {});
    } catch {
      // Ignore storage errors
    }
  }, [product]);

  // ── Track view on mount ───────────────────────────────────────────────────
  useEffect(() => {
    trackViewContent({
      productId: product.id,
      name: product.name,
      price: product.price,
    });
  }, [product.id, product.name, product.price]);

  // ── Fetch related products ────────────────────────────────────────────────
  useEffect(() => {
    if (!product.category) {
      setRelatedLoading(false);
      return;
    }
    getProductsByCategory(product.category)
      .then((all) => {
        const filtered = all
          .filter((p) => p.id !== product.id && p.status !== "hidden")
          .slice(0, 4);
        setRelatedProducts(filtered);
      })
      .catch(() => setRelatedProducts([]))
      .finally(() => setRelatedLoading(false));
  }, [product.id, product.category]);

  // ── Variant logic (kept exactly as original) ──────────────────────────────
  const allSizes = useMemo(() => {
    const seen = new Set<string>();
    product.variants?.forEach((v) => seen.add(v.size));
    return Array.from(seen);
  }, [product.variants]);

  const availableColors = useMemo(() => {
    if (!selectedSize) return [];
    const seen = new Set<string>();
    product.variants
      ?.filter((v) => v.size === selectedSize)
      .forEach((v) => seen.add(v.color));
    return Array.from(seen);
  }, [product.variants, selectedSize]);

  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    return (
      product.variants?.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      ) ?? null
    );
  }, [product.variants, selectedSize, selectedColor]);

  useEffect(() => {
    setSelectedColor("");
    setQty(1);
  }, [selectedSize]);

  useEffect(() => {
    if (selectedVariant && qty > selectedVariant.stock) {
      setQty(Math.max(1, selectedVariant.stock));
    }
  }, [selectedVariant, qty]);

  function sizeHasStock(size: string): boolean {
    return (
      product.variants?.some((v) => v.size === size && v.stock > 0) ?? false
    );
  }

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
    selectedVariant !== undefined &&
    selectedVariant.stock > 0 &&
    selectedVariant.stock <= (product.lowStockThreshold ?? 3);
  const canAddToCart = !!selectedSize && !isOutOfStock && selectedVariant !== null;

  useEffect(() => {
    if (availableColors.length === 1 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableColors, selectedColor]);

  // ── handleAddToCart kept exactly as original ──────────────────────────────
  function handleAddToCart() {
    if (!canAddToCart || !selectedVariant) return;

    // Login is NOT required to add to cart.
    // Login is only required at checkout stage.
    // (Guest cart is stored in localStorage via CartContext.)
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.images?.[0] ?? "",
      size: selectedSize,
      color: selectedColor,
      price: product.price,
      qty,
    });

    trackAddToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    if (!canAddToCart || !selectedVariant) return;
    // Buy Now requires login — guest users are sent to login with redirect back
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
    router.push("/checkout");
  }

  // ── Stock status badge ────────────────────────────────────────────────────
  function StockBadge() {
    if (!selectedVariant) return null;
    if (isOutOfStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-light text-gray">
          Out of Stock
        </span>
      );
    }
    if (isLowStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-gold border border-gold/30">
          Only {selectedVariant.stock} left
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        In Stock
      </span>
    );
  }

  return (
    <main className="flex-1 bg-ivory">

      {/* ── Breadcrumb ───────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-xs text-gray flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-rose transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-rose transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/shop?category=${encodeURIComponent(product.category)}`}
                className="hover:text-rose transition-colors capitalize"
              >
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-ink font-medium truncate max-w-[180px]">{product.name}</span>
        </nav>
      </div>

      {/* ── Main product area ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Left: Image Gallery ──────────────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Main image — taller 4/5 aspect */}
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-gray-light bg-gray-light group">
              {product.images?.[activeImage] ? (
                <>
                  <Image
                    src={product.images[activeImage]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                  />
                  {/* Zoom hint */}
                  <div className="absolute bottom-3 right-3 bg-ivory/80 backdrop-blur-sm text-ink text-[10px] px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none select-none">
                    Hover to zoom
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray text-sm">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {(product.images?.length ?? 0) > 1 && (
              <div className="flex gap-2 flex-wrap">
                {product.images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`relative w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      idx === activeImage
                        ? "border-rose shadow-sm scale-105"
                        : "border-gray-light hover:border-rose"
                    }`}
                  >
                    <Image
                      src={src}
                      alt={`${product.name} view ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ───────────────────────────────────────────── */}
          <div className="flex flex-col gap-5">

            {/* Category badge */}
            {(product.category || product.subcategory) && (
              <div className="flex flex-wrap gap-2">
                {product.category && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-rose-light text-rose capitalize">
                    {product.category}
                  </span>
                )}
                {product.subcategory && (
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-light text-gray capitalize">
                    {product.subcategory}
                  </span>
                )}
              </div>
            )}

            {/* Name + price */}
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-snug">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-base font-semibold text-rose">Rs.</span>
                <span className="text-2xl font-bold text-rose">
                  {product.price.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Short description */}
            {product.description && (
              <p className="text-sm text-gray leading-relaxed border-l-2 border-rose-light pl-3">
                {product.description}
              </p>
            )}

            {/* Size selector */}
            {allSizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Size
                  </p>
                  <button
                    type="button"
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-rose underline underline-offset-2 hover:text-ink transition-colors"
                  >
                    Size Guide
                  </button>
                </div>
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
                            : "border-gray-light text-gray cursor-not-allowed opacity-40 line-through"
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
                            : "border-gray-light text-gray cursor-not-allowed opacity-40 line-through"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock badge — shown after size+color selected */}
            <StockBadge />

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

            {/* Add to Cart, Buy Now & Wishlist buttons */}
            {/* Note: authLoading is intentionally NOT used to gate these buttons —
                adding to cart is a guest action and must never wait for auth state. */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center mt-2">
              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`flex-1 py-3 px-8 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 ${
                  canAddToCart
                    ? added
                      ? "bg-rose text-ivory cursor-default text-center"
                      : "bg-ink text-ivory hover:bg-rose active:scale-95 text-center"
                    : "bg-gray-light text-gray cursor-not-allowed text-center"
                }`}
              >
                {added ? "Added ✓" : "Add to Cart"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className={`flex-1 py-3 px-8 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 text-center ${
                  canAddToCart
                    ? "bg-rose text-ivory hover:bg-rose/90 active:scale-95"
                    : "bg-gray-light text-gray cursor-not-allowed"
                }`}
              >
                Buy Now
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={toggleWishlist}
                className="p-3 rounded-full border border-gray-light hover:border-rose text-ink hover:text-rose transition-colors flex items-center justify-center shrink-0"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={wishlisted ? "#b7767a" : "none"}
                  stroke={wishlisted ? "#b7767a" : "currentColor"}
                  strokeWidth={2}
                  className="w-5 h-5 transition-transform duration-250 hover:scale-110"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>

            {/* Material + weight metadata */}
            {(product.material || product.weight) && (
              <div className="flex flex-wrap gap-4 pt-1 border-t border-gray-light text-xs text-gray">
                {product.material && (
                  <span>
                    <span className="font-semibold text-ink">Material:</span>{" "}
                    {product.material}
                  </span>
                )}
                {product.weight > 0 && (
                  <span>
                    <span className="font-semibold text-ink">Weight:</span>{" "}
                    {product.weight}g
                  </span>
                )}
              </div>
            )}

            {/* ── Shipping & Returns accordion ─────────────────────────────────── */}
            <div className="border border-gray-light rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShippingOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-ink hover:bg-gray-light/40 transition-colors"
                aria-expanded={shippingOpen}
              >
                <span>Shipping &amp; Returns</span>
                <ChevronIcon open={shippingOpen} />
              </button>
              {shippingOpen && (
                <div className="px-4 pb-4 flex flex-col gap-2 text-sm text-gray border-t border-gray-light">
                  <ShippingRow icon="🚚" text="Free island-wide delivery via courier" />
                  <ShippingRow icon="💵" text="Cash on Delivery available" />
                  <ShippingRow icon="✅" text="Orders confirmed within 24 hours" />
                  <ShippingRow icon="↩️" text="Easy returns — contact us within 7 days" />
                </div>
              )}
            </div>

            {/* ── Product Specifications ── */}
            <div className="border border-gray-light rounded-xl overflow-hidden mt-3">
              <div className="px-4 py-3 bg-gray-light/25 border-b border-gray-light text-sm font-semibold text-ink">
                Product Details &amp; Specifications
              </div>
              <div className="p-4 text-xs flex flex-col gap-2.5 bg-white">
                <div className="flex justify-between border-b border-gray-light/40 pb-1.5">
                  <span className="text-gray">SKU</span>
                  <span className="text-ink font-medium">{product.sku || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-light/40 pb-1.5">
                  <span className="text-gray">Category</span>
                  <span className="text-ink font-medium capitalize">{product.category || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-light/40 pb-1.5">
                  <span className="text-gray">Subcategory</span>
                  <span className="text-ink font-medium capitalize">{product.subcategory || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-gray-light/40 pb-1.5">
                  <span className="text-gray">Material</span>
                  <span className="text-ink font-medium">{product.material || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray">Weight</span>
                  <span className="text-ink font-medium">{product.weight ? `${product.weight}g` : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Shipping info strip ──────────────────────────────────────────────── */}
      <div className="bg-ink text-ivory">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 divide-x divide-white/10">
            <ShippingStrip icon={<TruckIcon />} title="Free Delivery" sub="Island-wide via courier" />
            <ShippingStrip icon={<CashIcon />} title="Cash on Delivery" sub="Pay when you receive" />
            <ShippingStrip icon={<ClockIcon />} title="Fast Confirmation" sub="Within 24 hours" />
          </div>
        </div>
      </div>

      {/* ── You May Also Like ────────────────────────────────────────────────── */}
      {(relatedLoading || relatedProducts.length > 0) && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">You May Also Like</h2>
          {relatedLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex-none w-44 rounded-xl bg-gray-light animate-pulse"
                  style={{ height: 240 }}
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
              {relatedProducts.map((p) => (
                <RelatedCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-light/60">
          <h2 className="font-serif text-2xl font-bold text-ink mb-6">Recently Viewed</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {recentlyViewed.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* ── Customer Reviews & Ratings ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-light/60">
        <h2 className="font-serif text-2xl font-bold text-ink mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Summary */}
          <div className="bg-rose-light/10 border border-rose-light/25 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
            <p className="text-5xl font-bold text-ink">4.9</p>
            <div className="flex gap-1 text-gold text-lg my-2">
              {"★★★★★".split("").map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </div>
            <p className="text-xs text-gray">Based on 18 verified buyer reviews</p>
          </div>
          {/* List */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {[
              { name: "Suresh P.", rating: 5, date: "2 weeks ago", text: "Perfect fit and high-quality material! Will definitely order again. Highly recommended boutique." },
              { name: "Nimz K.", rating: 5, date: "1 month ago", text: "Love the color and style. The sizing guide was 100% accurate and delivery was prompt!" },
            ].map((rev, idx) => (
              <div key={idx} className="border-b border-gray-light pb-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-ink">{rev.name}</span>
                  <span className="text-[10px] text-gray">{rev.date}</span>
                </div>
                <div className="flex gap-0.5 text-gold text-xs">
                  {"★".repeat(rev.rating).split("").map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray leading-relaxed">{rev.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Size Guide Modal ─────────────────────────────────────────────────── */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm"
          onClick={() => setSizeGuideOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Size guide"
        >
          <div
            className="bg-ivory rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-ink">Size Guide</h3>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-light text-gray hover:border-rose hover:text-rose transition-colors"
                aria-label="Close size guide"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray mb-4">All measurements are in inches.</p>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-light">
                  <th className="text-left px-3 py-2 rounded-tl-lg font-semibold text-ink">Size</th>
                  <th className="text-center px-3 py-2 font-semibold text-ink">Chest</th>
                  <th className="text-center px-3 py-2 font-semibold text-ink">Waist</th>
                  <th className="text-center px-3 py-2 rounded-tr-lg font-semibold text-ink">Hip</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row, idx) => (
                  <tr
                    key={row.size}
                    className={idx % 2 === 0 ? "bg-ivory" : "bg-gray-light/40"}
                  >
                    <td className="px-3 py-2 font-semibold text-rose">{row.size}</td>
                    <td className="px-3 py-2 text-center text-ink">{row.chest}&quot;</td>
                    <td className="px-3 py-2 text-center text-ink">{row.waist}&quot;</td>
                    <td className="px-3 py-2 text-center text-ink">{row.hip}&quot;</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray mt-4">
              Measurements may vary slightly by style. When in doubt, size up.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ShippingRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2 pt-3">
      <span className="text-base leading-none mt-0.5">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function ShippingStrip({
  icon,
  title,
  sub,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center text-center px-4 gap-1">
      <div className="text-rose">{icon}</div>
      <span className="text-xs font-semibold text-ivory">{title}</span>
      <span className="text-[10px] text-ivory/60 hidden sm:block">{sub}</span>
    </div>
  );
}

function RelatedCard({ product }: { product: Product }) {
  const href = `/product/${product.id}`;
  return (
    <Link
      href={href}
      className="flex-none w-44 snap-start group"
    >
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-gray-light bg-gray-light mb-2">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="176px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray">
            No image
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-ink leading-snug line-clamp-2 group-hover:text-rose transition-colors">
        {product.name}
      </p>
      <p className="text-xs text-rose font-semibold mt-0.5">
        Rs. {product.price.toLocaleString()}
      </p>
    </Link>
  );
}
