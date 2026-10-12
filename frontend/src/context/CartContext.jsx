import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { cartApi, getErrorMessage } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

const initialState = {
  items: [], // [{ product: {...latest product data}, quantity }]
  status: "idle", // idle | loading | ready | error
  error: null,
  pending: {}, // productId -> true while that item's request is running
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "LOAD_START":
      return { ...state, status: "loading", error: null };
    case "LOAD_SUCCESS":
      return { ...state, status: "ready", error: null, items: action.items };
    case "LOAD_ERROR":
      return { ...state, status: "error", error: action.error };
    // Every mutation API returns the full updated cart, so we replace our copy with it
    case "SET_ITEMS":
      return { ...state, status: "ready", items: action.items };
    case "PENDING": {
      const pending = { ...state.pending };
      if (action.value) pending[action.productId] = true;
      else delete pending[action.productId];
      return { ...state, pending };
    }
    case "RESET":
      return { ...initialState, status: action.status ?? "idle" };
    default:
      return state;
  }
};

// One shared cart state for the whole app (Navbar, product cards, cart page, checkout).
// MongoDB is the source of truth; this context mirrors it after every API call.
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const refreshCart = useCallback(async () => {
    dispatch({ type: "LOAD_START" });
    try {
      const { cart } = await cartApi.get();
      dispatch({ type: "LOAD_SUCCESS", items: cart });
    } catch (error) {
      dispatch({ type: "LOAD_ERROR", error: getErrorMessage(error, "Unable to load your cart.") });
    }
  }, []);

  // Load the cart whenever a user logs in; wipe it on logout
  useEffect(() => {
    if (user?._id) refreshCart();
    else dispatch({ type: "RESET" });
  }, [user?._id, refreshCart]);

  // Shared wrapper: marks the item as pending, runs the request, syncs the returned cart.
  // Returns { ok, message } so the caller can show feedback.
  const mutate = useCallback(async (productId, request, fallbackError) => {
    dispatch({ type: "PENDING", productId, value: true });
    try {
      const { cart, message } = await request();
      dispatch({ type: "SET_ITEMS", items: cart });
      return { ok: true, message };
    } catch (error) {
      return { ok: false, message: getErrorMessage(error, fallbackError) };
    } finally {
      dispatch({ type: "PENDING", productId, value: false });
    }
  }, []);

  const addToCart = useCallback(
    (productId) => mutate(productId, () => cartApi.add(productId), "Unable to add to cart."),
    [mutate]
  );

  const updateQuantity = useCallback(
    (productId, quantity) =>
      mutate(productId, () => cartApi.update(productId, quantity), "Unable to update quantity."),
    [mutate]
  );

  const removeFromCart = useCallback(
    (productId) => mutate(productId, () => cartApi.remove(productId), "Unable to remove item."),
    [mutate]
  );

  // Called after a verified payment: the backend has already emptied the cart
  const clearCart = useCallback(() => dispatch({ type: "RESET", status: "ready" }), []);

  // Derived values - computed from state, never stored
  const derived = useMemo(() => {
    const totalUnits = state.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const quantityById = Object.fromEntries(state.items.map((item) => [item.product._id, item.quantity]));
    const hasStockIssue = state.items.some((item) => item.quantity > item.product.stock);
    return { totalUnits, subtotal, lineCount: state.items.length, quantityById, hasStockIssue };
  }, [state.items]);

  const value = useMemo(
    () => ({
      cartItems: state.items,
      status: state.status,
      loading: state.status === "loading" || state.status === "idle",
      error: state.error,
      isPending: (productId) => Boolean(state.pending[productId]),
      ...derived,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [state, derived, refreshCart, addToCart, updateQuantity, removeFromCart, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};
