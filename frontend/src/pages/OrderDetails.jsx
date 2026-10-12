import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, PackageIcon, SpinnerIcon } from "../components/Icons";
import OrderSummary from "../components/OrderSummary";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/StateViews";
import StatusTracker, { StatusPill } from "../components/StatusTracker";
import { useToast } from "../context/ToastContext";
import useOrder from "../hooks/useOrder";
import { getErrorMessage, orderApi } from "../services/api";
import { formatDateTime, formatPrice, shortId } from "../utils/format";

const OrderDetails = () => {
  const { id } = useParams();
  const { order, setOrder, status, reload } = useOrder(id);
  const { notify } = useToast();
  const [advancing, setAdvancing] = useState(false);

  // Bonus: development-only control to move the order to its next status
  const advance = async () => {
    setAdvancing(true);
    try {
      const { order: updated, message } = await orderApi.advanceStatus(order._id);
      setOrder(updated);
      notify(message, "success");
    } catch (error) {
      notify(getErrorMessage(error, "Unable to update status"), "error");
    } finally {
      setAdvancing(false);
    }
  };

  if (status === "loading") return <LoadingState message="Loading order..." />;
  if (status === "notfound") {
    return (
      <EmptyState
        icon={<PackageIcon width={26} height={26} />}
        title="Order not found"
        message="This order doesn't exist or doesn't belong to your account."
        actionLabel="View My Orders"
        actionTo="/orders"
      />
    );
  }
  if (status === "error") return <ErrorState title="Unable to load this order." onRetry={reload} />;

  const { shippingAddress: addr } = order;
  const canAdvance = import.meta.env.DEV && order.paymentStatus === "PAID" && order.status !== "DELIVERED";

  return (
    <div>
      <Link to="/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink">
        <ArrowLeftIcon width={16} height={16} /> All orders
      </Link>

      <PageHeader eyebrow={`Placed ${formatDateTime(order.createdAt)}`} title={`Order #${shortId(order._id)}`}>
        <div className="flex gap-1.5">
          <StatusPill status={order.paymentStatus} />
          <StatusPill status={order.status} />
        </div>
      </PageHeader>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="panel animate-rise p-6">
            <h2 className="font-display mb-5 text-2xl font-semibold">Status</h2>
            <StatusTracker status={order.status} />
            {canAdvance && (
              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border-2 border-dashed border-ink/30 p-3">
                <span className="eyebrow">Dev tool</span>
                <button type="button" className="btn btn-ghost py-1.5 text-xs" onClick={advance} disabled={advancing}>
                  {advancing && <SpinnerIcon width={14} height={14} />}
                  Advance to next status
                </button>
              </div>
            )}
          </section>

          <section className="panel animate-rise overflow-hidden" style={{ animationDelay: "60ms" }}>
            <h2 className="font-display border-b-2 border-ink px-6 py-4 text-2xl font-semibold">Items</h2>
            <ul className="divide-y-2 divide-ink/10">
              {order.items.map((item) => (
                <li key={item.product} className="flex items-center gap-4 px-6 py-4">
                  <img src={item.image} alt="" className="h-16 w-16 shrink-0 rounded-lg border-2 border-ink bg-white object-contain p-1" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/products/${item.product}`} className="font-semibold hover:underline">
                      {item.name}
                    </Link>
                    <p className="font-mono text-sm text-ink-soft">
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-mono font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="border-t-2 border-ink/10 px-6 py-3 text-xs text-ink-faint">
              Prices shown are what you paid at the time of purchase.
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <OrderSummary
            title="Payment"
            showLines={false}
            lines={order.items.map((i) => ({ name: i.name, price: i.price, quantity: i.quantity }))}
            total={order.totalAmount}
          >
            {order.razorpayPaymentId && (
              <p className="font-mono text-xs break-all text-ink-soft">Razorpay payment: {order.razorpayPaymentId}</p>
            )}
          </OrderSummary>

          <section className="panel p-5">
            <h2 className="font-display mb-3 text-xl font-semibold">Shipping to</h2>
            <address className="space-y-0.5 text-sm not-italic">
              <p className="font-semibold">{addr.fullName}</p>
              <p>{addr.addressLine1}</p>
              <p>
                {addr.city}, {addr.state} {addr.pincode}
              </p>
              <p className="pt-1 font-mono text-ink-soft">{addr.phone}</p>
            </address>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
