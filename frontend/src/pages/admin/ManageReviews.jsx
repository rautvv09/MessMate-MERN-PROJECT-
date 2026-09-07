import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaStar,
  FaTrash,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaQuoteLeft,
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { getReviews, deleteReview } from '../../services/adminService';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Confirmation Dialog State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDanger: true,
    action: null,
    isLoading: false,
  });

  const fetchReviews = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await getReviews({
        page,
        limit: 10,
        search: search.trim() || undefined,
        rating: ratingFilter || undefined,
      });
      setReviews(data.data.reviews);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [search, ratingFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReviews(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchReviews]);

  // Delete Review Handler
  const handleDeleteReview = (review) => {
    setDialogState({
      isOpen: true,
      title: 'Remove Inappropriate Review',
      message: `Permanently delete this review from ${review.studentId?.name || 'Student'} for mess ${review.messId?.name || 'Mess'}? The mess average rating will be automatically recalculated.`,
      confirmText: 'Delete Review',
      isDanger: true,
      action: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteReview(review._id);
          toast.success('Review removed & mess rating recalculated');
          fetchReviews(pagination.page);
          setDialogState({ isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete review');
        } finally {
          setDialogState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  const starOptions = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars ★★★★★' },
    { value: '4', label: '4 Stars ★★★★☆' },
    { value: '3', label: '3 Stars ★★★☆☆' },
    { value: '2', label: '2 Stars ★★☆☆☆' },
    { value: '1', label: '1 Star ★☆☆☆☆' },
  ];

  return (
    <AdminLayout
      title="Reviews & Ratings Moderation"
      subtitle={`Moderate ${pagination.total} student reviews and maintain authentic platform feedback`}
    >
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            <input
              type="text"
              placeholder="Search in review comment text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
          >
            {starOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reviews Cards Feed */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3 bg-surface rounded-3xl border border-border">
            <FaSpinner className="animate-spin text-primary text-2xl mx-auto" />
            <p className="text-xs text-text-secondary">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 text-center space-y-2 bg-surface rounded-3xl border border-border">
            <FaStar className="text-3xl text-text-muted mx-auto" />
            <p className="text-sm font-bold text-text-primary">No reviews found</p>
            <p className="text-xs text-text-secondary">No reviews match your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="bg-surface border border-border rounded-3xl p-5 hover:border-primary/40 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Student & Mess */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                        {review.studentId?.name?.[0] || 'S'}
                      </div>
                      <div>
                        <span className="font-bold text-text-primary text-xs block">
                          {review.studentId?.name || 'Anonymous Student'}
                        </span>
                        <span className="text-[10px] text-text-secondary">
                          for <strong className="text-text-primary">{review.messId?.name || 'Mess'}</strong> ({review.messId?.city})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30 text-xs font-extrabold">
                      <FaStar size={11} />
                      <span>{review.rating}</span>
                    </div>
                  </div>

                  {/* Comment Quote */}
                  <div className="bg-background rounded-2xl p-3.5 border border-border relative text-xs text-text-secondary leading-relaxed">
                    <FaQuoteLeft className="text-primary/20 text-xs absolute top-2.5 left-2.5" />
                    <p className="pl-4">{review.comment}</p>
                  </div>
                </div>

                {/* Footer: Date & Delete Button */}
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <span className="text-[10px] text-text-muted">
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <button
                    onClick={() => handleDeleteReview(review)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-status-danger hover:bg-status-danger/10 text-xs font-bold transition-all border border-transparent hover:border-status-danger/30"
                  >
                    <FaTrash size={10} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-4 border border-border rounded-2xl flex items-center justify-between bg-surface text-xs shadow-xs">
            <span className="text-text-secondary">
              Showing page <strong className="text-text-primary">{pagination.page}</strong> of{' '}
              <strong className="text-text-primary">{pagination.totalPages}</strong> ({pagination.total} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchReviews(pagination.page - 1)}
                className="p-2 rounded-xl bg-background border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
              >
                <FaChevronLeft size={10} />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchReviews(pagination.page + 1)}
                className="p-2 rounded-xl bg-background border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false })}
        onConfirm={dialogState.action}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        isDanger={dialogState.isDanger}
        isLoading={dialogState.isLoading}
      />
    </AdminLayout>
  );
};

export default ManageReviews;
