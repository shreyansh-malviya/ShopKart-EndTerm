import { useState } from "react";
import { useWishlist } from "../context/WishlistContext";
import { getErrorMessage } from "../services/api";
import { HeartIcon, SpinnerIcon } from "./Icons";

// Wishlist toggle (Lab 04 + toggle bonus).
// States: "Add to Wishlist" -> "Saving..." -> "Added to Wishlist", and on failure a visible error.
// Clicking a saved product removes it again ("Removing...").
const WishlistButton = ({ productId, compact = false, className = "" }) => {
  const { isSaved, toggle } = useWishlist();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const saved = isSaved(productId);

  const handleClick = async () => {
    if (busy) return; // prevent duplicate requests while one is running
    setBusy(true);
    setError("");
    try {
      await toggle(productId);
    } catch (err) {
      setError(
        saved
          ? getErrorMessage(err, "Unable to remove product. Please try again.")
          : getErrorMessage(err, "Unable to save product. Please try again.")
      );
    } finally {
      setBusy(false);
    }
  };

  // Compact (product card) labels follow the lab's card mock: "[ View Details ] [ Wishlist ]"
  let label = saved ? (compact ? "Saved" : "Added to Wishlist") : compact ? "Wishlist" : "Add to Wishlist";
  if (busy) label = saved ? "Removing..." : "Saving...";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        aria-pressed={saved}
        aria-label={busy ? label : saved ? "Added to Wishlist (click to remove)" : "Add to Wishlist"}
        title={saved ? "Remove from Wishlist" : "Add to Wishlist"}
        className={`btn w-full ${saved ? "bg-chili-soft text-chili border-chili" : "btn-ghost"} ${compact ? "gap-1.5 px-2.5 py-2 text-xs whitespace-nowrap" : ""}`}
      >
        {busy ? (
          <SpinnerIcon width={16} height={16} />
        ) : (
          <HeartIcon width={16} height={16} filled={saved} key={String(saved)} className="animate-pop" />
        )}
        <span>{label}</span>
      </button>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-chili" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default WishlistButton;
