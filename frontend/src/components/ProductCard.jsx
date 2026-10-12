import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";
import AddToCartButton from "./AddToCartButton";
import ProductImage from "./ProductImage";
import StockBadge from "./StockBadge";
import WishlistButton from "./WishlistButton";

// One product in the catalogue grid. All values come from the API response.
const ProductCard = ({ product, index = 0 }) => (
  <article
    className="panel group flex animate-rise flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:shadow-hard-lg"
    style={{ animationDelay: `${Math.min(index, 11) * 45}ms` }}
  >
    <Link
      to={`/products/${product._id}`}
      className="relative block aspect-square overflow-hidden border-b-2 border-ink bg-white"
      aria-label={`View ${product.name}`}
    >
      <ProductImage
        src={product.image}
        alt={product.name}
        className="h-full w-full p-6 transition-transform duration-300 group-hover:scale-105"
      />
      <span className="absolute top-3 left-3 rounded-md border-2 border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase">
        {product.category}
      </span>
    </Link>

    <div className="flex flex-1 flex-col gap-3 p-4">
      <div className="flex-1">
        <h3 className="font-display text-lg leading-snug font-semibold">
          <Link to={`/products/${product._id}`} className="hover:underline decoration-marigold decoration-2 underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-ink-soft">{product.category}</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xl font-semibold">{formatPrice(product.price)}</span>
        <StockBadge stock={product.stock} />
      </div>

      <AddToCartButton product={product} />
      <div className="grid grid-cols-2 gap-2">
        <Link to={`/products/${product._id}`} className="btn btn-ghost px-2.5 py-2 text-xs whitespace-nowrap">
          View Details
        </Link>
        <WishlistButton productId={product._id} compact />
      </div>
    </div>
  </article>
);

export default ProductCard;
