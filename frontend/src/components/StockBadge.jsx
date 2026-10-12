import { stockInfo } from "../utils/format";

const TONES = {
  leaf: "bg-leaf-soft text-leaf",
  marigold: "bg-marigold-soft text-ink",
  chili: "bg-chili-soft text-chili",
};

const StockBadge = ({ stock }) => {
  const { label, tone } = stockInfo(stock);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
};

export default StockBadge;
