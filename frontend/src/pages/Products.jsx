import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { EmptyState, ErrorState, PageHeader } from "../components/StateViews";
import { SearchIcon } from "../components/Icons";
import { productApi } from "../services/api";

const DEFAULT_CATEGORIES = ["Electronics", "Fashion", "Books", "Home"];
const SEARCH_DEBOUNCE_MS = 350;

const SkeletonGrid = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="panel overflow-hidden">
        <div className="skeleton aspect-square rounded-none" />
        <div className="space-y-3 p-4">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-4 w-1/3" />
          <div className="skeleton h-10 w-full" />
        </div>
      </div>
    ))}
  </div>
);

const Products = () => {
  // Filters live in the URL (/products?search=phone&category=Electronics) so they survive
  // refresh and the back button.
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "";

  const [searchInput, setSearchInput] = useState(search);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);

  const updateParam = useCallback(
    (key, value) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value) next.set(key, value);
          else next.delete(key);
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  // Debounce typing so we don't fire a request on every keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      if (searchInput.trim() !== search) updateParam("search", searchInput.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchInput, search, updateParam]);

  // Categories for the dropdown come from the backend (fallback to the lab's default list)
  useEffect(() => {
    productApi
      .categories()
      .then(({ categories: list }) => list.length && setCategories(list))
      .catch(() => {});
  }, []);

  // Fetch whenever a filter changes. The backend does the filtering, not React.
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    productApi
      .list({ search, category, sort }, { signal: controller.signal })
      .then(({ products: list }) => {
        setProducts(list);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.code !== "ERR_CANCELED") setStatus("error");
      });

    // Cancels the previous request if filters change before it finishes
    return () => controller.abort();
  }, [search, category, sort, reloadKey]);

  const clearFilters = () => {
    setSearchInput("");
    setParams({}, { replace: true });
  };

  const hasFilters = Boolean(search || category);

  return (
    <div>
      <PageHeader eyebrow="The catalogue" title="Products">
        {status === "ready" && (
          <p className="font-mono text-sm text-ink-soft">
            {products.length} product{products.length === 1 ? "" : "s"}
            {category && ` in ${category}`}
            {search && ` matching "${search}"`}
          </p>
        )}
      </PageHeader>

      <div className="mb-8 animate-rise" style={{ animationDelay: "60ms" }}>
        <SearchBar
          search={searchInput}
          onSearchChange={setSearchInput}
          category={category}
          onCategoryChange={(value) => updateParam("category", value)}
          categories={categories}
          sort={sort}
          onSortChange={(value) => updateParam("sort", value)}
        />
      </div>

      {status === "loading" && (
        <>
          <p className="mb-4 font-mono text-sm text-ink-soft" role="status">
            Loading products...
          </p>
          <SkeletonGrid />
        </>
      )}

      {status === "error" && (
        <ErrorState
          title="Something went wrong while loading products."
          message="Please check your connection and try again."
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      )}

      {status === "ready" && products.length === 0 && (
        <EmptyState
          icon={<SearchIcon width={26} height={26} />}
          title="No products found."
          message={hasFilters ? "Try a different search term or category." : "The catalogue is empty right now."}
          actionLabel={hasFilters ? "Clear filters" : undefined}
          onAction={hasFilters ? clearFilters : undefined}
        />
      )}

      {status === "ready" && products.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product._id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
