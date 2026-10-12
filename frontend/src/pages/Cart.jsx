import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { ArrowRightIcon, CartIcon } from "../components/Icons";
import OrderSummary from "../components/OrderSummary";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/StateViews";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const navigate = useNavigate();
  // Everything here comes from the shared cart state - the same state the Navbar uses
  const { cartItems, loading, error, status, refreshCart, subtotal, totalUnits, hasStockIssue } = useCart();

  if (loading) return <LoadingState message="Loading your cart..." />;

  if (status === "error") {
    return <ErrorState title="Unable to load your cart." message={error} onRetry={refreshCart} />;
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon={<CartIcon width={28} height={28} />}
        title="Your cart is empty"
        message="Looks like you haven't added anything yet."
        actionLabel="Browse Products"
        actionTo="/products"
      />
    );
  }

  return (
    <div>
      <PageHeader eyebrow="Ready when you are" title="My Cart">
        <p className="font-mono text-sm text-ink-soft">
          {totalUnits} item{totalUnits === 1 ? "" : "s"}
        </p>
      </PageHeader>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="space-y-4">
          {cartItems.map((item, index) => (
            <CartItem key={item.product._id} item={item} index={index} />
          ))}
        </ul>

        <div className="lg:sticky lg:top-24">
          <OrderSummary
            lines={cartItems.map((item) => ({ key: item.product._id, name: item.product.name, price: item.product.price, quantity: item.quantity }))}
            total={subtotal}
          >
            {hasStockIssue && (
              <p className="mb-3 rounded-md bg-chili-soft px-3 py-2 text-xs font-semibold text-chili">
                Some items exceed the available stock. Update them to continue.
              </p>
            )}
            <button type="button" className="btn btn-accent w-full py-3 text-base" disabled={hasStockIssue} onClick={() => navigate("/checkout")}>
              Proceed to Checkout <ArrowRightIcon width={16} height={16} />
            </button>
            <Link to="/products" className="mt-3 block text-center text-sm font-semibold text-ink-soft hover:text-ink">
              Continue shopping
            </Link>
          </OrderSummary>
        </div>
      </div>
    </div>
  );
};

export default Cart;
