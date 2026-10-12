import { formatPrice } from "../utils/format";

// Receipt-style summary. `lines` are { name, price, quantity } - from cart state on the
// checkout page, or from the saved order snapshot on order pages.
const OrderSummary = ({ title = "Order Summary", lines, total, children, showLines = true }) => {
  const units = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <section className="panel relative overflow-hidden p-5">
      {/* perforated top edge, like a till receipt */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-2"
        style={{ backgroundImage: "radial-gradient(circle at 6px -2px, var(--color-paper) 5px, transparent 5.5px)", backgroundSize: "12px 8px" }}
      />
      <h2 className="font-display mt-1 text-2xl font-semibold">{title}</h2>

      {showLines && (
        <ul className="mt-4 space-y-2 font-mono text-sm">
          {lines.map((line, i) => (
            <li key={line.key ?? i} className="flex justify-between gap-3">
              <span className="min-w-0 truncate">
                {line.name} <span className="text-ink-soft">x {line.quantity}</span>
              </span>
              <span className="shrink-0">{formatPrice(line.price * line.quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="rule-dashed my-4" />
      <dl className="space-y-1.5 font-mono text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-soft">Items</dt>
          <dd>{units}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">Subtotal</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-soft">Delivery</dt>
          <dd className="text-leaf">FREE</dd>
        </div>
      </dl>
      <div className="rule-dashed my-4" />
      <div className="flex items-baseline justify-between">
        <span className="font-display text-xl font-semibold">Total</span>
        <span className="font-mono text-2xl font-semibold">{formatPrice(total)}</span>
      </div>

      {children && <div className="mt-5">{children}</div>}
    </section>
  );
};

export default OrderSummary;
