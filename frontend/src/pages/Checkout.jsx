import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CheckoutForm from "../components/CheckoutForm";
import { AlertIcon, ArrowLeftIcon, CartIcon, LockIcon, SpinnerIcon } from "../components/Icons";
import OrderSummary from "../components/OrderSummary";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/StateViews";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getErrorMessage, orderApi } from "../services/api";
import { formatPrice, shortId } from "../utils/format";
import { loadRazorpayScript } from "../utils/razorpay";
import { validateShipping } from "../utils/validation";

const PHASE_LABEL = {
  creating: "Creating your order...",
  paying: "Waiting for payment...",
  verifying: "Verifying payment...",
};

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, loading, status, error, refreshCart, subtotal, hasStockIssue, clearCart } = useCart();

  // Checkout form state lives here, local to the page
  const [address, setAddress] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState("idle"); // idle | creating | paying | verifying
  const [payError, setPayError] = useState("");
  const [paymentConfig, setPaymentConfig] = useState(null);

  // Refs so Razorpay callbacks (created once per attempt) see the latest values
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const completedRef = useRef(false);

  useEffect(() => {
    orderApi
      .paymentConfig()
      .then(setPaymentConfig)
      .catch(() => setPaymentConfig({ enabled: false, unreachable: true }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((a) => ({ ...a, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (phase !== "idle") return;
    setPayError("");

    // 1. Client-side validation - don't call the backend if this fails
    const found = validateShipping(address);
    setErrors(found);
    if (Object.keys(found).length) return;

    const shippingAddress = Object.fromEntries(Object.entries(address).map(([k, v]) => [k, v.trim()]));

    // 2. Backend validates cart + stock, calculates the total and creates the Razorpay order.
    //    We send ONLY the shipping address - no prices, no totals.
    setPhase("creating");
    let checkout;
    try {
      checkout = await orderApi.createPaymentOrder(shippingAddress);
    } catch (err) {
      setPayError(getErrorMessage(err, "Unable to create your order. Please try again."));
      setPhase("idle");
      // Stock or product availability may have changed - resync the cart from the server
      if (err?.response?.status === 400) refreshCart();
      return;
    }

    // 3. Load and open Razorpay Checkout
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPayError("Could not load Razorpay Checkout. Check your internet connection and try again.");
      setPhase("idle");
      return;
    }

    setPhase("paying");

    const razorpay = new window.Razorpay({
      key: checkout.key, // public Key ID only - the secret never leaves the server
      amount: checkout.amount, // in paise, decided by the server
      currency: checkout.currency,
      name: "ShopKart",
      description: `Order #${shortId(checkout.shopKartOrderId)}`,
      order_id: checkout.razorpayOrderId,
      prefill: {
        name: shippingAddress.fullName,
        contact: shippingAddress.phone,
        email: user?.email,
      },
      notes: { shopKartOrderId: checkout.shopKartOrderId },
      theme: { color: "#1B1A17" },

      // Razorpay says the payment went through. This is NOT proof by itself:
      // we send the ids + signature to the backend, which verifies the HMAC signature.
      handler: async (response) => {
        setPhase("verifying");
        setPayError("");
        try {
          const { order } = await orderApi.verifyPayment({
            shopKartOrderId: checkout.shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          // Backend has cleared the cart -> clear global cart state so the Navbar shows Cart (0)
          completedRef.current = true;
          clearCart();
          navigate(`/order-success/${order._id}`, { replace: true });
        } catch (err) {
          const reason = getErrorMessage(err, "We could not verify your payment.").replace(/\.?$/, ".");
          setPayError(`${reason} Your cart has not been cleared.`);
          setPhase("idle");
        }
      },

      modal: {
        confirm_close: true,
        // User closed the Razorpay window without completing the payment
        ondismiss: () => {
          if (phaseRef.current === "verifying") return;
          setPhase("idle");
          setPayError((prev) => prev || "Payment was cancelled. Your cart has not been cleared.");
        },
      },
    });

    razorpay.on("payment.failed", (response) => {
      const reason = response?.error?.description;
      setPayError(
        `Payment failed${reason ? `: ${reason}` : "."} Your cart has not been cleared. Please try again.`
      );
      // Record the failed attempt; the order is never marked as paid
      orderApi.markPaymentFailed(checkout.shopKartOrderId).catch(() => {});
    });

    razorpay.open();
  };

  if (loading) return <LoadingState message="Loading checkout..." />;

  if (status === "error") {
    return <ErrorState title="Unable to load your cart." message={error} onRetry={refreshCart} />;
  }

  // Opening /checkout directly with an empty cart
  if (cartItems.length === 0 && !completedRef.current) {
    return (
      <EmptyState
        icon={<CartIcon width={28} height={28} />}
        title="Nothing to check out"
        message="Your cart is empty. Add some products before checking out."
        actionLabel="Browse Products"
        actionTo="/products"
      />
    );
  }

  const busy = phase !== "idle";
  const paymentsDisabled = paymentConfig && !paymentConfig.enabled;

  return (
    <div>
      <Link to="/cart" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeftIcon width={16} height={16} /> Back to cart
      </Link>

      <PageHeader eyebrow="Almost there" title="Checkout" />

      <form onSubmit={handlePlaceOrder} noValidate className="grid items-start gap-8 lg:grid-cols-[1fr_400px]">
        <section className="panel animate-rise p-6" style={{ animationDelay: "60ms" }}>
          <div className="mb-5 flex items-center gap-3">
            <span className="font-display grid h-9 w-9 place-items-center rounded-full border-2 border-ink bg-marigold font-bold">1</span>
            <h2 className="font-display text-2xl font-semibold">Shipping Details</h2>
          </div>
          <CheckoutForm values={address} errors={errors} onChange={handleChange} disabled={busy} />
        </section>

        <div className="space-y-4 lg:sticky lg:top-24">
          <OrderSummary
            lines={cartItems.map((item) => ({ key: item.product._id, name: item.product.name, price: item.product.price, quantity: item.quantity }))}
            total={subtotal}
          >
            {paymentsDisabled && (
              <div className="mb-3 flex gap-2 rounded-md border-2 border-marigold bg-marigold-soft px-3 py-2 text-xs font-medium" role="alert">
                <AlertIcon className="mt-0.5 shrink-0" width={14} height={14} />
                {paymentConfig.unreachable
                  ? "Could not reach the payment service. Please try again shortly."
                  : "Payments are not configured on the server yet (Razorpay Test keys missing in backend/.env)."}
              </div>
            )}

            {hasStockIssue && (
              <p className="mb-3 rounded-md bg-chili-soft px-3 py-2 text-xs font-semibold text-chili">
                Some items exceed the available stock. <Link to="/cart" className="underline">Update your cart</Link> to continue.
              </p>
            )}

            {payError && (
              <div className="mb-3 flex gap-2 rounded-md border-2 border-chili bg-chili-soft px-3 py-2 text-sm font-medium text-chili" role="alert">
                <AlertIcon className="mt-0.5 shrink-0" width={16} height={16} />
                <span>{payError}</span>
              </div>
            )}

            <button type="submit" className="btn btn-accent w-full py-3.5 text-base" disabled={busy || hasStockIssue || paymentsDisabled}>
              {busy ? <SpinnerIcon width={18} height={18} /> : <LockIcon width={16} height={16} />}
              {busy ? PHASE_LABEL[phase] : `Place Order - Pay ${formatPrice(subtotal)}`}
            </button>
            <p className="mt-3 text-center text-xs text-ink-faint">
              The final amount is calculated and confirmed by the server. Payments run in Razorpay Test Mode.
            </p>
          </OrderSummary>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
