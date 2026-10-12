import { useState } from "react";
import { Link } from "react-router-dom";
import FormField from "../components/FormField";
import { ArrowRightIcon, CartIcon, HeartIcon, PackageIcon, SpinnerIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { authApi, getErrorMessage } from "../services/api";
import { formatDate, formatPrice } from "../utils/format";

// Bonus (Lab 01): change password while logged in
const ChangePasswordForm = () => {
  const { notify } = useToast();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.oldPassword || !form.newPassword) return setError("Both fields are required.");
    if (form.newPassword.length < 6) return setError("New password must be at least 6 characters.");

    setSaving(true);
    try {
      await authApi.changePassword(form);
      setForm({ oldPassword: "", newPassword: "" });
      notify("Password changed successfully", "success");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to change password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <FormField label="Current password" name="oldPassword" type="password" value={form.oldPassword} onChange={handleChange} autoComplete="current-password" />
      <FormField label="New password" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} autoComplete="new-password" hint="At least 6 characters" />
      {error && (
        <p className="text-sm font-medium text-chili" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-ghost w-full" disabled={saving}>
        {saving && <SpinnerIcon width={16} height={16} />}
        {saving ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
};

const QuickLink = ({ to, icon, label, value, detail, delay }) => (
  <Link
    to={to}
    className="panel group flex animate-rise items-center gap-4 p-4 transition-transform hover:-translate-y-0.5 hover:shadow-hard-lg"
    style={{ animationDelay: `${delay}ms` }}
  >
    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border-2 border-ink bg-marigold-soft">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="eyebrow">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
      {detail && <p className="truncate text-xs text-ink-soft">{detail}</p>}
    </div>
    <ArrowRightIcon className="text-ink-soft transition-transform group-hover:translate-x-1" />
  </Link>
);

const Home = () => {
  const { user } = useAuth();
  const { totalUnits, subtotal } = useCart();
  const { count: wishlistCount } = useWishlist();

  const firstName = user.fullName.split(" ")[0];

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border-2 border-ink bg-ink p-8 text-paper shadow-hard-lg sm:p-12 animate-rise">
        <span aria-hidden className="font-display pointer-events-none absolute -right-6 -bottom-20 text-[12rem] leading-none font-bold text-paper/[0.05] italic select-none">
          Hello
        </span>
        <p className="eyebrow text-paper/60">Your ShopKart</p>
        <h1 className="font-display mt-3 max-w-2xl text-5xl leading-[0.95] font-semibold tracking-tight sm:text-6xl">
          Welcome back, <span className="italic text-marigold">{firstName}</span>.
        </h1>
        <p className="mt-4 max-w-lg text-paper/70">Fresh stock across electronics, fashion, books and home. Everything you save or add follows you across devices.</p>
        <Link to="/products" className="btn mt-8 border-paper bg-marigold text-ink">
          Browse Products <ArrowRightIcon width={16} height={16} />
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickLink to="/cart" icon={<CartIcon />} label="Cart" value={`${totalUnits} item${totalUnits === 1 ? "" : "s"}`} detail={totalUnits ? `Subtotal ${formatPrice(subtotal)}` : "Nothing in your cart yet"} delay={80} />
        <QuickLink to="/wishlist" icon={<HeartIcon />} label="Wishlist" value={`${wishlistCount} saved`} detail="Products you love" delay={140} />
        <QuickLink to="/orders" icon={<PackageIcon />} label="Orders" value="My Orders" detail="Track and review purchases" delay={200} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel animate-rise p-6" style={{ animationDelay: "240ms" }}>
          <div className="flex items-center gap-4">
            <span className="font-display grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-marigold text-3xl font-bold">
              {firstName[0]?.toUpperCase()}
            </span>
            <div>
              <p className="eyebrow">Customer profile</p>
              <h2 className="font-display text-3xl font-semibold">{user.fullName}</h2>
            </div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-ink/15 p-3">
              <dt className="eyebrow">Name</dt>
              <dd className="mt-1 font-medium">{user.fullName}</dd>
            </div>
            <div className="rounded-lg border-2 border-ink/15 p-3">
              <dt className="eyebrow">Email</dt>
              <dd className="mt-1 font-medium break-all">{user.email}</dd>
            </div>
            <div className="rounded-lg border-2 border-ink/15 p-3">
              <dt className="eyebrow">Phone Number</dt>
              <dd className="mt-1 font-mono font-medium">{user.phone}</dd>
            </div>
            <div className="rounded-lg border-2 border-ink/15 p-3">
              <dt className="eyebrow">Member since</dt>
              <dd className="mt-1 font-medium">{user.createdAt ? formatDate(user.createdAt) : "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="panel animate-rise p-6" style={{ animationDelay: "300ms" }}>
          <p className="eyebrow">Security</p>
          <h2 className="font-display mb-4 text-2xl font-semibold">Change password</h2>
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  );
};

export default Home;
