import { Link } from "react-router-dom";
import { AlertIcon, SpinnerIcon } from "./Icons";

// Reusable loading / error / empty states so no page ever renders blank

export const LoadingState = ({ message = "Loading..." }) => (
  <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-soft" role="status">
    <SpinnerIcon width={28} height={28} />
    <p className="font-mono text-sm">{message}</p>
  </div>
);

export const ErrorState = ({ title = "Something went wrong.", message, onRetry }) => (
  <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center" role="alert">
    <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-chili-soft text-chili">
      <AlertIcon width={26} height={26} />
    </span>
    <h2 className="font-display text-2xl font-semibold">{title}</h2>
    {message && <p className="text-ink-soft">{message}</p>}
    {onRetry && (
      <button type="button" className="btn btn-primary mt-2" onClick={onRetry}>
        Try Again
      </button>
    )}
  </div>
);

export const EmptyState = ({ icon, title, message, actionLabel, actionTo, onAction }) => (
  <div className="mx-auto flex max-w-md animate-rise flex-col items-center gap-3 py-16 text-center">
    {icon && (
      <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-marigold-soft text-ink">
        {icon}
      </span>
    )}
    <h2 className="font-display text-2xl font-semibold">{title}</h2>
    {message && <p className="text-ink-soft">{message}</p>}
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn btn-accent mt-2">
        {actionLabel}
      </Link>
    )}
    {actionLabel && onAction && !actionTo && (
      <button type="button" className="btn btn-accent mt-2" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);

export const PageHeader = ({ eyebrow, title, children }) => (
  <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise">
    <div>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="font-display text-4xl leading-none font-semibold tracking-tight sm:text-5xl">{title}</h1>
    </div>
    {children}
  </header>
);
