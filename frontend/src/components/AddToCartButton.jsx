import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { CartIcon, SpinnerIcon } from "./Icons";

// Adds one unit through the shared cart state. Shows "Adding..." while the request runs,
// "Add Another" once the product is in the cart, and blocks going past available stock.
const AddToCartButton = ({ product, className = "", size = "md" }) => {
  const { addToCart, isPending, quantityById } = useCart();
  const { notify } = useToast();

  const inCart = quantityById[product._id] ?? 0;
  const pending = isPending(product._id);
  const outOfStock = product.stock <= 0;
  const maxed = !outOfStock && inCart >= product.stock;

  const handleClick = async () => {
    const result = await addToCart(product._id);
    if (result.ok) notify(`${product.name} added to cart`, "success");
    else notify(result.message, "error");
  };

  let label = inCart > 0 ? `Add Another (${inCart} in cart)` : "Add to Cart";
  if (pending) label = "Adding...";
  else if (outOfStock) label = "Out of Stock";
  else if (maxed) label = `Max in cart (${inCart})`;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || outOfStock || maxed}
      className={`btn btn-primary w-full ${size === "lg" ? "py-3.5 text-base" : ""} ${className}`}
    >
      {pending ? <SpinnerIcon width={16} height={16} /> : <CartIcon width={16} height={16} />}
      <span>{label}</span>
    </button>
  );
};

export default AddToCartButton;
