import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

// Create context
const CartContext = createContext();

// ======================================================
// CART PROVIDER
// ======================================================

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState({});

  // ==================================================
  // GET CART
  // ==================================================

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");

      setCartItems(response.data.cart || []);
    } catch (error) {
      console.error("Fetch cart error:", error);

      if (error.response?.status === 401) {
        setCartItems([]);
        return;
      }

      setError("Unable to load cart.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================================================
  // ADD TO CART
  // ==================================================

  const addToCart = async (productId) => {
    try {
      setActionLoading((current) => ({
        ...current,
        [productId]: true,
      }));

      const response = await api.post(`/cart/${productId}`);

      setCartItems(response.data.cart || []);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Add cart error:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || "Unable to add product to cart.",
      };
    } finally {
      setActionLoading((current) => ({
        ...current,
        [productId]: false,
      }));
    }
  };

  // ==================================================
  // UPDATE QUANTITY
  // ==================================================

  const updateQuantity = async (productId, quantity) => {
    try {
      setActionLoading((current) => ({
        ...current,
        [productId]: true,
      }));

      const response = await api.patch(`/cart/${productId}`, { quantity });

      setCartItems(response.data.cart || []);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Update quantity error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Unable to update quantity.",
      };
    } finally {
      setActionLoading((current) => ({
        ...current,
        [productId]: false,
      }));
    }
  };

  // ==================================================
  // REMOVE FROM CART
  // ==================================================

  const removeFromCart = async (productId) => {
    try {
      setActionLoading((current) => ({
        ...current,
        [productId]: true,
      }));

      const response = await api.delete(`/cart/${productId}`);

      setCartItems(response.data.cart || []);

      return {
        success: true,
      };
    } catch (error) {
      console.error("Remove cart error:", error);

      return {
        success: false,
        message: error.response?.data?.message || "Unable to remove product.",
      };
    } finally {
      setActionLoading((current) => ({
        ...current,
        [productId]: false,
      }));
    }
  };

  // ==================================================
  // FETCH CART WHEN PROVIDER LOADS
  // ==================================================

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ==================================================
  // DERIVED VALUES
  // ==================================================

  const totalItems = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }, [cartItems]);
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,

        totalItems,
        subtotal,

        actionLoading,

        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,

        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ======================================================
// CUSTOM HOOK
// ======================================================

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
