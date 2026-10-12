import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatPrice } from "../utils/format";
import { MinusIcon, PlusIcon, SpinnerIcon, TrashIcon } from "./Icons";
import ProductImage from "./ProductImage";

// One cart row with quantity controls. Price and stock are the LATEST values from the Product.
const CartItem = ({ item, index = 0 }) => {
  const { updateQuantity, removeFromCart, isPending } = useCart();
  const { notify } = useToast();
  const { product, quantity } = item;
  const pending = isPending(product._id);

  const overStock = quantity > product.stock;

  const change = async (nextQuantity) => {
    const result = await updateQuantity(product._id, nextQuantity);
    if (!result.ok) notify(result.message, "error");
  };

  const remove = async () => {
    const result = await removeFromCart(product._id);
    if (result.ok) notify(`${product.name} removed from cart`, "info");
    else notify(result.message, "error");
  };

  return (
    <li
      className={`panel flex animate-rise gap-4 p-3 sm:p-4 ${pending ? "opacity-70" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link
        to={`/products/${product._id}`}
        className="h-24 w-24 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-white sm:h-28 sm:w-28"
      >
        <ProductImage src={product.image} alt={product.name} className="h-full w-full p-2" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
          <div className="min-w-0">
            <Link to={`/products/${product._id}`} className="font-display text-lg leading-snug font-semibold hover:underline">
              {product.name}
            </Link>
            <p className="font-mono text-sm text-ink-soft">{formatPrice(product.price)} each</p>
          </div>
          <span className="font-mono text-lg font-semibold">{formatPrice(product.price * quantity)}</span>
        </div>

        {overStock && (
          <p className="rounded-md bg-chili-soft px-2 py-1 text-xs font-semibold text-chili" role="alert">
            {product.stock === 0
              ? "This product is now out of stock. Please remove it to check out."
              : `Only ${product.stock} left in stock. Please reduce the quantity.`}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-lg border-2 border-ink bg-card" aria-label="Quantity">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center disabled:opacity-30"
              onClick={() => change(quantity - 1)}
              disabled={pending || quantity <= 1}
              aria-label="Decrease quantity"
            >
              <MinusIcon width={16} height={16} />
            </button>
            <span className="grid h-9 w-10 place-items-center border-x-2 border-ink font-mono font-semibold">
              {pending ? <SpinnerIcon width={14} height={14} /> : quantity}
            </span>
            <button
              type="button"
              className="grid h-9 w-9 place-items-center disabled:opacity-30"
              onClick={() => change(quantity + 1)}
              disabled={pending || quantity >= product.stock}
              aria-label="Increase quantity"
              title={quantity >= product.stock ? "No more stock available" : undefined}
            >
              <PlusIcon width={16} height={16} />
            </button>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-chili hover:underline disabled:opacity-40"
            onClick={remove}
            disabled={pending}
          >
            <TrashIcon width={16} height={16} /> Remove
          </button>
        </div>
      </div>
    </li>
  );
};

export default CartItem;
