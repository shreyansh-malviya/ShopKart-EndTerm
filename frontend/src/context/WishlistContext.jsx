import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { wishlistApi } from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

// Tracks only WHICH product ids are saved, so product cards can show the right
// toggle state and the Navbar can show the count. The wishlist itself lives in MongoDB;
// the Wishlist page always fetches the full, populated list from GET /wishlist.
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [loaded, setLoaded] = useState(false);

  const refreshWishlist = useCallback(async () => {
    try {
      const { wishlist } = await wishlistApi.list();
      setSavedIds(new Set(wishlist.map((p) => p._id)));
    } catch {
      // Count simply stays as it was; the Wishlist page has its own error state
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user?._id) refreshWishlist();
    else {
      setSavedIds(new Set());
      setLoaded(false);
    }
  }, [user?._id, refreshWishlist]);

  const setSaved = useCallback((productId, saved) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }, []);

  // Uses the toggle endpoint; the server's answer decides the final state
  const toggle = useCallback(
    async (productId) => {
      const { saved } = await wishlistApi.toggle(productId);
      setSaved(productId, saved);
      return saved;
    },
    [setSaved]
  );

  const remove = useCallback(
    async (productId) => {
      await wishlistApi.remove(productId);
      setSaved(productId, false);
    },
    [setSaved]
  );

  const value = useMemo(
    () => ({
      count: savedIds.size,
      loaded,
      isSaved: (productId) => savedIds.has(productId),
      toggle,
      remove,
      setSaved,
      refreshWishlist,
    }),
    [savedIds, loaded, toggle, remove, setSaved, refreshWishlist]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
};
