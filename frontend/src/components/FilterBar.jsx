const FilterBar = ({ filters, onFilterChange }) => {
  const handleChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <input
        type="text"
        name="search"
        placeholder="Search by mess name..."
        value={filters.search}
        onChange={handleChange}
        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <select
        name="foodType"
        value={filters.foodType}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">All Food Types</option>
        <option value="veg">Veg</option>
        <option value="non-veg">Non-Veg</option>
        <option value="both">Both</option>
      </select>

      <select
        name="minRating"
        value={filters.minRating}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">Any Rating</option>
        <option value="3">3+ Stars</option>
        <option value="4">4+ Stars</option>
      </select>

      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
      >
        <option value="">Recommended</option>
        <option value="price_low">Price: Low to High</option>
        <option value="price_high">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="newest">Newest</option>
      </select>
    </div>
  );
};

export default FilterBar;