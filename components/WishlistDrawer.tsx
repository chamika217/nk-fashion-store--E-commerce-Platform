"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { getProducts } from "@/lib/productService";
import type { Product } from "@/lib/types";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { wishlist, toggleWishlist, clearWishlist } = useWishlist();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getProducts()
        .then((prods) => setAllProducts(prods))
        .catch(() => {})
        .finally(() => setLoading(false));
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const wishlistedProducts = allProducts.filter((p) => wishlist.includes(p.id));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 right-0 w-[90vw] max-w-md bg-ivory text-ink z-50 flex flex-col shadow-2xl overflow-hidden border-l border-gray-light"
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-light bg-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose/10 text-rose">
                  <Heart className="w-5 h-5 fill-rose" />
                </div>
                <div>
                  <h2 className="font-serif text-base font-bold text-ink">My Wishlist</h2>
                  <p className="text-[11px] text-gray">
                    {wishlist.length} item{wishlist.length !== 1 ? "s" : ""} saved
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 text-gray hover:text-ink transition-colors"
                aria-label="Close wishlist"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {loading ? (
                <div className="py-20 text-center text-gray text-xs space-y-2 animate-pulse">
                  <Heart className="w-8 h-8 mx-auto text-rose/40 animate-bounce" />
                  <p>Loading your saved items…</p>
                </div>
              ) : wishlistedProducts.length === 0 ? (
                <div className="py-24 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose/10 text-rose flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-serif text-lg font-bold text-ink">Your wishlist is empty</p>
                    <p className="text-xs text-gray max-w-xs mx-auto">
                      Save your favorite shoes and outfits to view them later or check back for drops.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-ivory text-xs font-bold uppercase tracking-wider hover:bg-rose transition-colors"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-gray-light/70 shadow-2xs hover:shadow-xs transition-shadow relative group"
                    >
                      <Link
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        className="relative w-16 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0"
                      >
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray">
                            No Img
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="text-xs font-bold text-ink hover:text-rose transition-colors line-clamp-2 leading-snug"
                        >
                          {product.name}
                        </Link>
                        <p className="font-serif text-xs sm:text-sm font-bold text-rose mt-1">
                          Rs. {product.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button
                          onClick={() => toggleWishlist(product.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="px-3 py-1 rounded-xl bg-ink text-ivory hover:bg-rose text-[10px] font-bold uppercase tracking-wider transition-colors"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {wishlistedProducts.length > 0 && (
              <div className="p-4 bg-white border-t border-gray-light space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-gray mb-1">
                  <span>Total Items</span>
                  <span className="font-bold text-ink">{wishlistedProducts.length}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearWishlist}
                    className="flex-1 py-3 rounded-2xl border border-gray-light hover:border-red-300 text-gray hover:text-red-600 text-xs font-bold transition-colors"
                  >
                    Clear Wishlist
                  </button>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl bg-ink hover:bg-rose text-ivory text-xs font-bold uppercase tracking-wider text-center transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Shop More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
