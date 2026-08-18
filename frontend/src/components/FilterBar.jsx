import { FaSearch, FaFilter, FaSortAmountDown } from 'react-icons/fa';

const FilterBar = ({ filters, onFilterChange }) => {
  const handleInputChange = (e) => {
    onFilterChange({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const setCategoryFilter = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: filters[key] === value ? '' : value,
      page: 1,
    });
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Search Input and Select Dropdowns Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm" />
          <input
            type="text"
            name="search"
            placeholder="Search mess by name, college, locality..."
            value={filters.search || ''}
            onChange={handleInputChange}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Min Rating */}
          <div className="relative flex-1 sm:flex-none">
            <select
              name="minRating"
              value={filters.minRating || ''}
              onChange={handleInputChange}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-surface border border-border text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
              <option value="">★ Rating (All)</option>
              <option value="4">4.0+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Sort */}
          <div className="relative flex-1 sm:flex-none">
            <select
              name="sort"
              value={filters.sort || ''}
              onChange={handleInputChange}
              className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-surface border border-border text-xs font-semibold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
            >
              <option value="">Sort: Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1 shrink-0 pr-1">
          <FaFilter size={10} className="text-primary" /> Filter:
        </span>

        {[
          { label: 'All Messes', key: 'foodType', val: '' },
          { label: '🥗 Pure Veg', key: 'foodType', val: 'veg' },
          { label: '🍗 Non-Veg', key: 'foodType', val: 'non-veg' },
          { label: '🍲 Veg & Non-Veg', key: 'foodType', val: 'both' },
        ].map((item, idx) => {
          const isActive = filters[item.key] === item.val;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => setCategoryFilter(item.key, item.val)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;