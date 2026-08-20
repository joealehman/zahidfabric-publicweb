import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Product } from '@/lib/types';

export type CartLine = { product: Product; quantity: number };

type CartContextValue = {
  cart: CartLine[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);

  const addToCart = (product: Product, qty = 1) => {
    setCart((c) => {
      const found = c.find((l) => l.product.id === product.id);
      if (found) return c.map((l) => l.product.id === product.id ? { ...l, quantity: l.quantity + qty } : l);
      return [...c, { product, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((l) => l.product.id !== id));

  const updateQty = (id: string, qty: number) => {
    if (qty < 1) return removeFromCart(id);
    setCart((c) => c.map((l) => l.product.id === id ? { ...l, quantity: qty } : l));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, l) => s + l.quantity, 0);
  const cartTotal = cart.reduce((s, l) => s + l.product.retail_price * l.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
