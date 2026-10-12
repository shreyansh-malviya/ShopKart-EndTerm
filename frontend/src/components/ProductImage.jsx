import { useState } from "react";
import { PackageIcon } from "./Icons";

// Product image with a graceful fallback if the URL is broken
const ProductImage = ({ src, alt, className = "", eager = false }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`grid place-items-center bg-marigold-soft text-ink-soft ${className}`}>
        <PackageIcon width={40} height={40} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
};

export default ProductImage;
