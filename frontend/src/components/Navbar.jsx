import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useToast } from "../context/ToastContext";
import { CartIcon, CloseIcon, HeartIcon, MenuIcon } from "./Icons";

const linkClass = ({ isActive }) =>
  `relative rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? "bg-ink text-paper" : "text-ink hover:bg-ink/5"
  }`;

// Badge for live counts. Values come from shared state, never hardcoded.
const Count = ({ value, tone = "bg-marigold text-ink" }) => (
  <span
    key={value}
    className={`ml-1.5 inline-grid min-w-5 animate-pop place-items-center rounded-full border border-ink px-1.5 font-mono text-[11px] leading-5 ${tone}`}
  >
    {value}
  </span>
);

export const Logo = () => (
  <Link to="/home" className="group flex items-center gap-2">
    <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-marigold shadow-hard-sm transition-transform group-hover:-rotate-6">
      <CartIcon width={18} height={18} />
    </span>
    <span className="font-display text-2xl font-bold tracking-tight">
      Shop<span className="italic text-chili">Kart</span>
    </span>
  </Link>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalUnits } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close the mobile menu after navigating
  useEffect(() => setOpen(false), [location.pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      notify("Logged out successfully", "info");
    } finally {
      setLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  const links = (
    <>
      <NavLink to="/home" className={linkClass}>
        Home
      </NavLink>
      <NavLink to="/products" className={linkClass}>
        Products
      </NavLink>
      <NavLink to="/wishlist" className={linkClass}>
        <span className="inline-flex items-center">
          Wishlist <Count value={wishlistCount} tone="bg-chili-soft text-ink" />
        </span>
      </NavLink>
      <NavLink to="/cart" className={linkClass}>
        <span className="inline-flex items-center">
          Cart <Count value={totalUnits} />
        </span>
      </NavLink>
      <NavLink to="/orders" className={linkClass}>
        Orders
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">{links}</div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="max-w-36 truncate text-sm text-ink-soft" title={user?.email}>
            Hi, <span className="font-semibold text-ink">{user?.fullName?.split(" ")[0]}</span>
          </span>
          <button type="button" className="btn btn-ghost py-2" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link to="/wishlist" className="relative p-2" aria-label={`Wishlist, ${wishlistCount} items`}>
            <HeartIcon />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-chili px-1 font-mono text-[10px] text-paper">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="relative p-2" aria-label={`Cart, ${totalUnits} items`}>
            <CartIcon />
            {totalUnits > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-marigold px-1 font-mono text-[10px] text-ink">
                {totalUnits}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="rounded-md border-2 border-ink p-1.5"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-rise border-t-2 border-ink bg-card px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">{links}</div>
          <div className="mt-3 flex items-center justify-between border-t border-ink/15 pt-3">
            <span className="text-sm text-ink-soft">{user?.email}</span>
            <button type="button" className="btn btn-ghost py-1.5" onClick={handleLogout} disabled={loggingOut}>
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
