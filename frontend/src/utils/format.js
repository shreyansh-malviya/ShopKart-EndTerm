const rupee = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatPrice = (amount) => rupee.format(Number(amount) || 0);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// Short, readable order reference: last 8 chars of the Mongo id
export const shortId = (id = "") => String(id).slice(-8).toUpperCase();

// Stock label + tone used on product and wishlist cards
export const stockInfo = (stock) => {
  if (stock <= 0) return { label: "Out of stock", tone: "chili" };
  if (stock <= 5) return { label: `Only ${stock} left`, tone: "marigold" };
  return { label: `${stock} units left`, tone: "leaf" };
};
