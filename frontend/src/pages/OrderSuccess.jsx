import { Link, useParams } from "react-router-dom";
import { CheckIcon, PackageIcon } from "../components/Icons";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import { StatusPill } from "../components/StatusTracker";
import useOrder from "../hooks/useOrder";
import { formatDateTime, formatPrice } from "../utils/format";

const OrderSuccess = () => {
  const { id } = useParams();
  const { order, status, reload } = useOrder(id);

  if (status === "loading") return <LoadingState message="Loading your order..." />;
  if (status === "notfound") {
    return (
      <EmptyState icon={<PackageIcon width={26} height={26} />} title="Order not found" actionLabel="View My Orders" actionTo="/orders" />
    );
  }
  if (status === "error") return <ErrorState title="Unable to load your order." onRetry={reload} />;

  const paid = order.paymentStatus === "PAID";

  return (
    <div className="mx-auto max-w-xl">
      <section className="panel animate-rise overflow-hidden text-center">
        <div className={`border-b-2 border-ink px-6 pt-10 pb-8 ${paid ? "bg-leaf-soft" : "bg-marigold-soft"}`}>
          <span className={`mx-auto grid h-20 w-20 animate-pop place-items-center rounded-full border-2 border-ink shadow-hard ${paid ? "bg-leaf text-paper" : "bg-marigold"}`}>
            {paid ? <CheckIcon width={40} height={40} strokeWidth={3} /> : <PackageIcon width={36} height={36} />}
          </span>
          <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight">
            {paid ? "Order Placed Successfully" : "Order Awaiting Payment"}
          </h1>
          <p className="mt-2 text-ink-soft">
            {paid ? "Your order has been saved successfully." : "This order has not been paid yet."}
          </p>
        </div>

        <dl className="grid gap-4 p-6 text-left font-mono text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Order ID</dt>
            <dd className="break-all text-right font-semibold">{order._id}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-soft">Placed on</dt>
            <dd>{formatDateTime(order.createdAt)}</dd>
          </div>
          {order.razorpayPaymentId && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Payment ID</dt>
              <dd className="break-all text-right">{order.razorpayPaymentId}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4">
            <dt className="text-ink-soft">Status</dt>
            <dd className="flex gap-1.5">
              <StatusPill status={order.paymentStatus} />
              <StatusPill status={order.status} />
            </dd>
          </div>
          <div className="rule-dashed" />
          <div className="flex items-baseline justify-between gap-4">
            <dt className="font-display text-lg font-semibold text-ink">Total</dt>
            <dd className="text-2xl font-semibold">{formatPrice(order.totalAmount)}</dd>
          </div>
        </dl>

        <div className="grid gap-3 border-t-2 border-ink p-6 sm:grid-cols-2">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/products" className="btn btn-ghost">
            Continue Shopping
          </Link>
        </div>
      </section>
    </div>
  );
};

export default OrderSuccess;
