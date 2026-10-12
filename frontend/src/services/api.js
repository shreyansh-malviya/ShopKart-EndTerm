import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8086";

// withCredentials: true makes the browser send (and store) the HttpOnly auth cookie
// on cross-origin requests from localhost:5173 to the API.
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000,
});

// Turns any axios error into a message we can show to the user
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ERR_NETWORK" || (error?.request && !error?.response)) {
    return "Cannot reach the ShopKart server. Is the backend running?";
  }
  return fallback;
};

const data = (promise) => promise.then((res) => res.data);

// Drops empty query params so URLs stay clean (/products?search=phone, not ?search=phone&category=)
const cleanParams = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

export const authApi = {
  register: (payload) => data(api.post("/customers/register", payload)),
  login: (credentials) => data(api.post("/customers/login", credentials)),
  me: () => data(api.get("/customers/me")),
  logout: () => data(api.post("/customers/logout")),
  changePassword: (payload) => data(api.patch("/customers/change-password", payload)),
};

export const productApi = {
  list: (params, config) => data(api.get("/products", { params: cleanParams(params), ...config })),
  get: (id, config) => data(api.get(`/products/${id}`, config)),
  categories: () => data(api.get("/products/categories")),
};

export const wishlistApi = {
  list: () => data(api.get("/wishlist")),
  add: (productId) => data(api.post(`/wishlist/${productId}`)),
  remove: (productId) => data(api.delete(`/wishlist/${productId}`)),
  toggle: (productId) => data(api.patch(`/wishlist/${productId}/toggle`)),
};

export const cartApi = {
  get: () => data(api.get("/cart")),
  add: (productId) => data(api.post(`/cart/${productId}`)),
  update: (productId, quantity) => data(api.patch(`/cart/${productId}`, { quantity })),
  remove: (productId) => data(api.delete(`/cart/${productId}`)),
};

export const orderApi = {
  paymentConfig: () => data(api.get("/orders/payment-config")),
  // Only the shipping address is sent. Prices and totals are calculated by the server.
  createPaymentOrder: (shippingAddress) => data(api.post("/orders/create-payment-order", { shippingAddress })),
  verifyPayment: (payload) => data(api.post("/orders/verify-payment", payload)),
  markPaymentFailed: (orderId) => data(api.post(`/orders/${orderId}/payment-failed`)),
  list: () => data(api.get("/orders")),
  get: (id) => data(api.get(`/orders/${id}`)),
  advanceStatus: (id) => data(api.patch(`/orders/${id}/status`)),
};

export default api;
