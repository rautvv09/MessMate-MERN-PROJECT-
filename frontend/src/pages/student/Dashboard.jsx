import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getAllMesses } from '../../services/messService';
import { checkFavorites, addFavorite, removeFavorite } from '../../services/favoriteService';
import { getMyBookings } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import MessCard from '../../components/MessCard';
import FilterBar from '../../components/FilterBar';
import { FaUtensils, FaCompass, FaMapMarkerAlt, FaRegFrown, FaCalendarCheck, FaReceipt, FaBookmark, FaArrowRight } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    foodType: '',
    minRating: '',
    sort: '',
    page: 1,
  });
  const [messes, setMesses] = useState([]);
  const [pagination, setPagination] = useState({ pages: 1 });
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [activeBooking, setActiveBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const debouncedSearch = useDebounce(filters.search, 400);

  // Time-based greeting helper
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const queryParams = {
          ...filters,
          search: debouncedSearch,
          city: user?.roleDetails?.city,
        };
        Object.keys(queryParams).forEach((key) => {
          if (queryParams[key] === '') delete queryParams[key];
        });

        const { data } = await getAllMesses(queryParams);
        setMesses(data.data.messes);
        setPagination(data.pagination);

        if (data.data.messes.length > 0) {
          const messIds = data.data.messes.map((m) => m._id);
          const favData = await checkFavorites(messIds);
          setFavoritedIds(new Set(favData.data.data.favoritedIds));
        } else {
          setFavoritedIds(new Set());
        }

        // Fetch user active booking for dashboard widget
        const { data: bookingData } = await getMyBookings();
        const active = bookingData.data.bookings.find((b) => b.status === 'confirmed');
        if (active) setActiveBooking(active);
      } catch (error) {
        toast.error('Could not load mess directory.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters.foodType, filters.minRating, filters.sort, filters.page, debouncedSearch, user]);

  const handleToggleFavorite = async (messId) => {
    const isCurrentlyFavorited = favoritedIds.has(messId);

    setFavoritedIds((prev) => {
      const next = new Set(prev);
      isCurrentlyFavorited ? next.delete(messId) : next.add(messId);
      return next;
    });

    try {
      if (isCurrentlyFavorited) {
        await removeFavorite(messId);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(messId);
        toast.success('Saved to favorites');
      }
    } catch (error) {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        isCurrentlyFavorited ? next.add(messId) : next.delete(messId);
        return next;
      });
      toast.error('Could not update favorites');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Greeting & Quick Action Dashboard Cards */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <span className="editorial-watermark text-[12vw] top-1/2 -translate-y-1/2 right-4 text-white/5 pointer-events-none">
          MESSMATE
        </span>

        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold tracking-widest uppercase text-emerald-200">
              {greeting}, {user?.name?.toUpperCase() || 'STUDENT'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-heading text-white">
              FIND YOUR NEXT MEAL.
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Explore local messes near {user?.roleDetails?.city || 'your campus'}, track daily meal attendance, and view real-time monthly bills.
            </p>
          </div>

          {/* Active Subscription Banner OR Quick Action Links */}
          {activeBooking ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center font-bold">
                  <FaUtensils size={16} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-200">Active Mess Subscription</span>
                  <p className="font-bold text-sm text-white">{activeBooking.messId?.name || 'My Mess'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/my-attendance"
                  className="px-4 py-2 rounded-xl bg-white text-primary font-bold text-xs shadow-sm hover:bg-emerald-50 transition-all flex items-center gap-1.5"
                >
                  <FaCalendarCheck /> Mark Attendance
                </Link>
                <Link
                  to="/my-bills"
                  className="px-4 py-2 rounded-xl bg-white/20 text-white font-bold text-xs hover:bg-white/30 transition-all flex items-center gap-1.5"
                >
                  <FaReceipt /> View Live Bill
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/bookings/me"
                className="px-4 py-2.5 rounded-xl bg-white text-primary font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center gap-2"
              >
                <FaBookmark /> My Subscriptions
              </Link>
              <Link
                to="/my-attendance"
                className="px-4 py-2.5 rounded-xl bg-white/20 text-white font-bold text-xs hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <FaCalendarCheck /> Attendance Portal
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Discovery Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border">
        <div>
          <span className="text-editorial-sub flex items-center gap-1.5">
            <FaCompass className="text-primary" /> EXPLORE & COMPARE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-1">
            Available Messes ({messes.length})
          </h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Mess Grid / Skeletons / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-surface border border-border rounded-3xl h-80 shimmer-bg p-4 flex flex-col justify-between" />
          ))}
        </div>
      ) : messes.length === 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
            <FaRegFrown />
          </div>
          <h3 className="text-lg font-bold font-heading text-text-primary">No messes found</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            We couldn't find any messes matching your search query or filters. Try clearing your filters.
          </p>
          <button
            onClick={() => setFilters({ search: '', foodType: '', minRating: '', sort: '', page: 1 })}
            className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-dark transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8 border-t border-border">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setFilters({ ...filters, page: pageNum })}
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                filters.page === pageNum
                  ? 'bg-primary text-white shadow-md scale-105'
                  : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
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