import { createContext, useContext, useEffect, useMemo, useState } from "react";
const CartContext = createContext(null);
const LS_KEY = "SHOP_CART_V1";
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);
  const totalQty = useMemo(
    () => items.reduce((s, i) => s + i.quantity, 0),
    [items]
  );
  const totalPrice = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );
  const add = (p, qty = 1) =>
    setItems((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) {
        const cp = [...prev];
        cp[i] = { ...cp[i], quantity: cp[i].quantity + qty };
        return cp;
      }
      return [
        ...prev,
        {
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0],
          quantity: qty,
        },
      ];
    });
  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const setQty = (id, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    );
  const clear = () => setItems([]);
  return (
    <CartContext.Provider
      value={{ items, totalQty, totalPrice, add, remove, setQty, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}
export const useCart = () => useContext(CartContext);
