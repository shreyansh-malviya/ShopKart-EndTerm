import { CheckIcon } from "./Icons";

const STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

const LABELS = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

// Visual progress through PLACED -> CONFIRMED -> SHIPPED -> DELIVERED (Lab 06 bonus)
const StatusTracker = ({ status, compact = false }) => {
  const current = STEPS.indexOf(status);

  if (current === -1) {
    return <StatusPill status={status} />;
  }

  return (
    <ol className={`flex items-center ${compact ? "gap-1" : "gap-2"}`} aria-label={`Order status: ${status}`}>
      {STEPS.map((step, i) => {
        const done = i <= current;
        return (
          <li key={step} className="flex flex-1 items-center gap-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`grid place-items-center rounded-full border-2 border-ink ${compact ? "h-5 w-5" : "h-7 w-7"} ${
                  done ? "bg-leaf text-paper" : "bg-card text-ink-faint"
                } ${i === current ? "ring-2 ring-marigold ring-offset-2 ring-offset-card" : ""}`}
              >
                {done ? <CheckIcon width={compact ? 11 : 14} height={compact ? 11 : 14} strokeWidth={3} /> : null}
              </span>
              {!compact && (
                <span className={`text-[11px] font-semibold ${done ? "text-ink" : "text-ink-faint"}`}>{LABELS[step]}</span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <span className={`h-0.5 flex-1 ${compact ? "" : "mb-5"} ${i < current ? "bg-leaf" : "bg-ink/20"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
};

const PILL_TONES = {
  PAID: "bg-leaf-soft text-leaf",
  PLACED: "bg-leaf-soft text-leaf",
  CONFIRMED: "bg-leaf-soft text-leaf",
  SHIPPED: "bg-marigold-soft text-ink",
  DELIVERED: "bg-leaf text-paper",
  PENDING: "bg-marigold-soft text-ink",
  PENDING_PAYMENT: "bg-marigold-soft text-ink",
  FAILED: "bg-chili-soft text-chili",
};

export const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full border border-ink/20 px-2.5 py-0.5 font-mono text-[11px] font-semibold tracking-wide ${
      PILL_TONES[status] ?? "bg-ink/10"
    }`}
  >
    {status.replace("_", " ")}
  </span>
);

export default StatusTracker;
