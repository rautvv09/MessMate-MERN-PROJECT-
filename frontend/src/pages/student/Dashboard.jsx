import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllMesses } from '../../services/messService';
import { checkFavorites, addFavorite, removeFavorite } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import MessCard from '../../components/MessCard';
import FilterBar from '../../components/FilterBar';

const Dashboard = () => {
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    search: '', foodType: '', minRating: '', sort: '', page: 1,
  });
  const [messes, setMesses] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch messes whenever filters (or the debounced search term) change
  useEffect(() => {
    const fetchMesses = async () => {
      setIsLoading(true);
      try {
        const queryParams = {
          ...filters,
          search: debouncedSearch,
          city: user?.roleDetails?.city, // default to the student's own city
        };
        // strip empty-string values so we don't send e.g. ?foodType= to the backend
        Object.keys(queryParams).forEach((key) => {
          if (queryParams[key] === '') delete queryParams[key];
        });

        const { data } = await getAllMesses(queryParams);
        setMesses(data.data.messes);
        setPagination(data.pagination);

        // Batch-check favorite status for exactly the messes currently on screen
        if (data.data.messes.length > 0) {
          const messIds = data.data.messes.map((m) => m._id);
          const favData = await checkFavorites(messIds);
          setFavoritedIds(new Set(favData.data.data.favoritedIds));
        } else {
          setFavoritedIds(new Set());
        }
      } catch (error) {
        toast.error('Could not load messes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMesses();
  }, [filters.foodType, filters.minRating, filters.sort, filters.page, debouncedSearch, user]);

  const handleToggleFavorite = async (messId) => {
    const isCurrentlyFavorited = favoritedIds.has(messId);

    // Optimistic UI update — flip the heart instantly, before the API call resolves
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      isCurrentlyFavorited ? next.delete(messId) : next.add(messId);
      return next;
    });

    try {
      if (isCurrentlyFavorited) {
        await removeFavorite(messId);
      } else {
        await addFavorite(messId);
      }
    } catch (error) {
      // Roll back on failure — the optimistic update was wrong, so undo it
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        isCurrentlyFavorited ? next.add(messId) : next.delete(messId);
        return next;
      });
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Find your mess</h1>
      <p className="text-gray-500 mb-6">Browsing near {user?.roleDetails?.city}</p>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <p className="text-center text-gray-400 py-12">Loading messes...</p>
      ) : messes.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No messes found matching your filters.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {messes.map((mess) => (
            <MessCard
              key={mess._id}
              mess={mess}
              isFavorited={favoritedIds.has(mess._id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setFilters({ ...filters, page: pageNum })}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${
                filters.page === pageNum
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-600'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;