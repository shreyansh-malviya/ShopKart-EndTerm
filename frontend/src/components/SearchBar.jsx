import { SearchIcon } from "./Icons";

const SORTS = [
  { value: "", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

// Controlled search + category + sort inputs. The parent owns the state and fetching.
const SearchBar = ({ search, onSearchChange, category, onCategoryChange, categories, sort, onSortChange }) => (
  <div className="panel grid gap-3 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
    <label className="relative block">
      <span className="sr-only">Search products</span>
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-soft" />
      <input
        type="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search products..."
        className="field pl-10"
      />
    </label>

    <label className="block">
      <span className="sr-only">Category</span>
      <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="field cursor-pointer sm:w-48">
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>

    <label className="block">
      <span className="sr-only">Sort by</span>
      <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="field cursor-pointer sm:w-52">
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </label>
  </div>
);

export default SearchBar;
