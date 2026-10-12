import { useCallback, useEffect, useState } from "react";
import { HeartIcon } from "../components/Icons";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../components/StateViews";
import WishlistCard from "../components/WishlistCard";
import { useToast } from "../context/ToastContext";
import { useWishlist } from "../context/WishlistContext";
import { getErrorMessage, wishlistApi } from "../services/api";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { remove } = useWishlist();
  const { notify } = useToast();

  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [removing, setRemoving] = useState({}); // productId -> true
  const [itemErrors, setItemErrors] = useState({}); // productId -> message

  // Always fetched from GET /wishlist, which populates the Product references
  const loadWishlist = useCallback(async () => {
    setStatus("loading");
    try {
      const { wishlist } = await wishlistApi.list();
      setItems(wishlist);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = async (product) => {
    setRemoving((r) => ({ ...r, [product._id]: true }));
    setItemErrors((e) => ({ ...e, [product._id]: undefined }));
    try {
      await remove(product._id); // DELETE /wishlist/:productId + keeps the Navbar count in sync
      setItems((list) => list.filter((p) => p._id !== product._id));
      notify(`${product.name} removed from wishlist`, "info");
    } catch (error) {
      // 404 means it was already removed (e.g. in another tab) - just drop it from the list
      if (error?.response?.status === 404) {
        setItems((list) => list.filter((p) => p._id !== product._id));
      } else {
        setItemErrors((e) => ({ ...e, [product._id]: getErrorMessage(error, "Unable to remove. Please try again.") }));
      }
    } finally {
      setRemoving((r) => ({ ...r, [product._id]: false }));
    }
  };

  if (status === "loading") return <LoadingState message="Loading your wishlist..." />;

  if (status === "error") {
    return <ErrorState title="Something went wrong." message="We couldn't load your wishlist." onRetry={loadWishlist} />;
  }

  return (
    <div>
      <PageHeader eyebrow="Saved for later" title="My Wishlist">
        <div className="flex items-center gap-4">
          <p className="font-mono text-sm text-ink-soft">
            {items.length} product{items.length === 1 ? "" : "s"} saved
          </p>
          {items.length > 0 && (
            <Link to="/products" className="btn btn-ghost py-2">
              Continue Shopping
            </Link>
          )}
        </div>
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState
          icon={<HeartIcon width={28} height={28} filled className="text-chili" />}
          title="Your wishlist is empty"
          message="Save products you love and find them here later."
          actionLabel="Browse Products"
          actionTo="/products"
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((product, index) => (
            <WishlistCard
              key={product._id}
              product={product}
              index={index}
              removing={Boolean(removing[product._id])}
              error={itemErrors[product._id]}
              onRemove={() => handleRemove(product)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
