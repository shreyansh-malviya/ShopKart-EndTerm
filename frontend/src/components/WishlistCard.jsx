import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";
import { HeartIcon, SpinnerIcon } from "./Icons";
import ProductImage from "./ProductImage";
import StockBadge from "./StockBadge";

// A saved product on the Wishlist page. Data is the populated Product from GET /wishlist.
const WishlistCard = ({ product, removing, error, onRemove, index = 0 }) => (
  <article
    className="panel flex animate-rise flex-col overflow-hidden"
    style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
  >
    <Link to={`/products/${product._id}`} className="block aspect-[4/3] border-b-2 border-ink bg-white">
      <ProductImage src={product.image} alt={product.name} className="h-full w-full p-5" />
    </Link>
    <div className="flex flex-1 flex-col gap-2 p-4">
      <h3 className="font-display text-lg leading-snug font-semibold">{product.name}</h3>
      <p className="text-xs text-ink-soft">{product.category}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-lg font-semibold">{formatPrice(product.price)}</span>
        <StockBadge stock={product.stock} />
      </div>
      <div className="mt-auto grid gap-2 pt-2">
        <Link to={`/products/${product._id}`} className="btn btn-ghost py-2">
          View Details
        </Link>
        <button type="button" className="btn btn-danger py-2" onClick={onRemove} disabled={removing}>
          {removing ? <SpinnerIcon width={16} height={16} /> : <HeartIcon width={16} height={16} filled />}
          {removing ? "Removing..." : "Remove from Wishlist"}
        </button>
        {error && (
          <p className="text-xs font-medium text-chili" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  </article>
);

export default WishlistCard;
