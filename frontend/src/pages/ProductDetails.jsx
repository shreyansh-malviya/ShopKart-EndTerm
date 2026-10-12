import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AddToCartButton from "../components/AddToCartButton";
import { ArrowLeftIcon, LockIcon, PackageIcon } from "../components/Icons";
import ProductImage from "../components/ProductImage";
import { EmptyState, ErrorState, LoadingState } from "../components/StateViews";
import StockBadge from "../components/StockBadge";
import WishlistButton from "../components/WishlistButton";
import { useCart } from "../context/CartContext";
import { productApi } from "../services/api";
import { formatPrice } from "../utils/format";

const ProductDetails = () => {
  // :id comes from the URL - /products/66d123abc456...
  const { id } = useParams();
  const navigate = useNavigate();
  const { quantityById } = useCart();

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    productApi
      .get(id, { signal: controller.signal })
      .then(({ product: p }) => {
        setProduct(p);
        setStatus("ready");
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        const code = error?.response?.status;
        setStatus(code === 404 || code === 400 ? "notfound" : "error");
      });

    return () => controller.abort();
  }, [id, reloadKey]);

  if (status === "loading") return <LoadingState message="Loading product..." />;

  if (status === "notfound") {
    return (
      <EmptyState
        icon={<PackageIcon width={26} height={26} />}
        title="Product not found"
        message="This product may have been removed or the link is incorrect."
        actionLabel="Back to Products"
        actionTo="/products"
      />
    );
  }

  if (status === "error") {
    return <ErrorState title="Something went wrong while loading this product." onRetry={() => setReloadKey((k) => k + 1)} />;
  }

  const inCart = quantityById[product._id] ?? 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/products"))}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeftIcon width={16} height={16} /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="panel animate-rise relative aspect-square overflow-hidden bg-white">
          <ProductImage src={product.image} alt={product.name} className="h-full w-full p-10" eager />
          <span className="absolute top-4 left-4 rounded-md border-2 border-ink bg-marigold px-2.5 py-1 font-mono text-xs font-semibold tracking-wider uppercase">
            {product.category}
          </span>
        </div>

        <div className="flex animate-rise flex-col gap-6" style={{ animationDelay: "80ms" }}>
          <div>
            <Link to={`/products?category=${encodeURIComponent(product.category)}`} className="eyebrow hover:text-ink">
              {product.category}
            </Link>
            <h1 className="font-display mt-2 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{product.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-4xl font-semibold">{formatPrice(product.price)}</span>
            <StockBadge stock={product.stock} />
          </div>

          <p className="text-lg leading-relaxed text-ink-soft">{product.description}</p>

          <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
            <div className="rounded-lg border-2 border-ink/15 p-3">
              <dt className="eyebrow">Category</dt>
              <dd className="mt-1 font-semibold">{product.category}</dd>
            </div>
            <div className="rounded-lg border-2 border-ink/15 p-3">
              <dt className="eyebrow">Stock</dt>
              <dd className="mt-1 font-semibold">{product.stock} units</dd>
            </div>
          </dl>

          <div className="space-y-3">
            <AddToCartButton product={product} size="lg" />
            <WishlistButton productId={product._id} />
            {inCart > 0 && (
              <Link to="/cart" className="block text-center text-sm font-semibold underline decoration-marigold decoration-2 underline-offset-4">
                {inCart} in your cart - go to cart
              </Link>
            )}
          </div>

          <p className="flex items-center gap-2 text-xs text-ink-faint">
            <LockIcon width={14} height={14} /> Secure checkout with Razorpay. Free delivery on all orders.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
