import { useState, useEffect, useCallback } from "react";
import { CartContext } from "./CartContextValue";
import { useAuth } from "./useAuth";
import api from "../api/axios";

const EMPTY_CART = { items: [], subtotal: 0 };

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/cart");
      setCart(data);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever auth identity changes (login/logout/register).
  // Logging in triggers a server-side merge of the guest cart into the
  // user's cart, so the cart this cookie now resolves to is different
  // from what was loaded before — this keeps local state in sync with
  // that server-side change instead of showing stale guest-cart data.
  useEffect(() => {
    refreshCart();
  }, [user, refreshCart]);

  const addItem = useCallback(async (bookId, quantity = 1) => {
    const { data } = await api.post("/cart/items", { bookId, quantity });
    setCart(data);
    return data;
  }, []);

  const updateItem = useCallback(async (bookId, quantity) => {
    const { data } = await api.put(`/cart/items/${bookId}`, { quantity });
    setCart(data);
    return data;
  }, []);

  const removeItem = useCallback(async (bookId) => {
    const { data } = await api.delete(`/cart/items/${bookId}`);
    setCart(data);
    return data;
  }, []);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, loading, error, refreshCart, addItem, updateItem, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
};
