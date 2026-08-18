"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  qty: number;
}

interface CartContextValue {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "nk-fashion-cart";

function isSameItem(a: CartItem, b: CartItem): boolean {
  return a.productId === b.productId && a.size === b.size && a.color === b.color;
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Hydrate from localStorage on mount (SSR-safe)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCartItems(JSON.parse(stored) as CartItem[]);
      }
    } catch {
      // corrupted storage — start fresh
    }
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item: CartItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => isSameItem(i, item));
      if (existing) {
        return prev.map((i) =>
          isSameItem(i, item) ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeFromCart = useCallback(
    (productId: string, size: string, color: string) => {
      setCartItems((prev) =>
        prev.filter(
          (i) => !(i.productId === productId && i.size === size && i.color === color)
        )
      );
    },
    []
  );

  const updateQty = useCallback(
    (productId: string, size: string, color: string, qty: number) => {
      if (qty < 1) return;
      setCartItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, qty }
            : i
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside <CartProvider>");
  }
  return ctx;
}
