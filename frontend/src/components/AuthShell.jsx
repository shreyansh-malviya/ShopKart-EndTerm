import { Logo } from "./Navbar";

const TAGS = ["Electronics", "Fashion", "Books", "Home"];

// Split layout shared by the Login and Register pages
const AuthShell = ({ eyebrow, title, subtitle, children, footer }) => (
  <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
    <aside className="relative hidden overflow-hidden border-r-2 border-ink bg-ink text-paper lg:flex lg:flex-col lg:justify-between lg:p-12">
      {/* oversized background word for texture */}
      <span
        aria-hidden
        className="font-display pointer-events-none absolute -right-10 -bottom-16 text-[15rem] leading-none font-bold text-paper/[0.04] italic select-none"
      >
        Kart
      </span>

      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-paper bg-marigold text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </span>
        <span className="font-display text-2xl font-bold">
          Shop<span className="italic text-marigold">Kart</span>
        </span>
      </div>

      <div className="relative">
        <p className="eyebrow mb-5 text-paper/60">Est. 2026 - Bengaluru</p>
        <h2 className="font-display max-w-md text-6xl leading-[0.95] font-semibold tracking-tight">
          Good things,
          <br />
          <span className="italic text-marigold">neatly</span> kept.
        </h2>
        <p className="mt-6 max-w-sm text-paper/70">
          Browse the catalogue, save what you love, and check out securely with Razorpay.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {TAGS.map((tag, i) => (
            <span
              key={tag}
              className="animate-rise rounded-full border-2 border-paper/30 px-3 py-1 font-mono text-xs tracking-wider uppercase"
              style={{ animationDelay: `${200 + i * 90}ms` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <p className="font-mono text-xs text-paper/40">Secure session - HttpOnly cookie - no passwords stored in plain text</p>
    </aside>

    <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-10 lg:hidden">
          <Logo />
        </div>
        <div className="animate-rise">
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          {subtitle && <p className="mt-3 text-ink-soft">{subtitle}</p>}
        </div>
        <div className="mt-8 animate-rise" style={{ animationDelay: "80ms" }}>
          {children}
        </div>
        {footer && <div className="mt-8 text-sm text-ink-soft">{footer}</div>}
      </div>
    </main>
  </div>
);

export default AuthShell;
