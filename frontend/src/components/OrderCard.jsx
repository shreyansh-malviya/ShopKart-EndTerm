import { Link } from "react-router-dom";
import { formatDate, formatPrice, shortId } from "../utils/format";
import StatusTracker, { StatusPill } from "./StatusTracker";

// Summary card for one order in "My Orders". Uses the order's own snapshot data.
const OrderCard = ({ order, index = 0 }) => (
  <article
    className="panel animate-rise overflow-hidden"
    style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
  >
    <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink bg-marigold-soft/60 px-5 py-3">
      <div>
        <p className="eyebrow">Order</p>
        <p className="font-mono text-lg font-semibold">#{shortId(order._id)}</p>
      </div>
      <div className="text-right">
        <p className="eyebrow">Placed on</p>
        <p className="font-mono text-sm">{formatDate(order.createdAt)}</p>
      </div>
    </div>

    <div className="grid gap-5 p-5 md:grid-cols-[1fr_auto]">
      <div className="flex flex-col gap-4">
        <ul className="space-y-1.5 text-sm">
          {order.items.map((item) => (
            <li key={item.product} className="flex items-center gap-3">
              <img src={item.image} alt="" className="h-9 w-9 rounded border border-ink/20 bg-white object-contain p-0.5" />
              <span className="min-w-0 truncate">
                {item.name} <span className="font-mono text-ink-soft">x {item.quantity}</span>
              </span>
            </li>
          ))}
        </ul>
        <div className="max-w-md">
          <StatusTracker status={order.status} />
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 md:items-end md:justify-between">
        <div className="md:text-right">
          <p className="eyebrow">Total</p>
          <p className="font-mono text-2xl font-semibold">{formatPrice(order.totalAmount)}</p>
          <div className="mt-1 flex gap-1.5 md:justify-end">
            <StatusPill status={order.paymentStatus} />
            <StatusPill status={order.status} />
          </div>
        </div>
        <Link to={`/orders/${order._id}`} className="btn btn-ghost py-2">
          View Details
        </Link>
      </div>
    </div>
  </article>
);

export default OrderCard;
