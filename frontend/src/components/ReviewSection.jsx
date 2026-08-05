import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaStar } from 'react-icons/fa';
import { getMessReviews, getMyReviewForMess, submitReview, deleteReview } from '../services/reviewService';
import { useAuth } from '../context/AuthContext';

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)}>
        <FaStar size={22} className={star <= value ? 'text-amber-400' : 'text-gray-200'} />
      </button>
    ))}
  </div>
);

const ReviewSection = ({ messId, onRatingChange }) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [formData, setFormData] = useState({ rating: 0, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadReviews = async () => {
    const { data } = await getMessReviews(messId);
    setReviews(data.data.reviews);
  };

  useEffect(() => {
    loadReviews();
    if (isAuthenticated && user?.role === 'student') {
      getMyReviewForMess(messId).then(({ data }) => {
        const existing = data.data.review;
        setMyReview(existing);
        if (existing) setFormData({ rating: existing.rating, comment: existing.comment });
      });
    }
  }, [messId, isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data } = await submitReview(messId, formData);
      setMyReview(data.data.review);
      toast.success(myReview ? 'Review updated!' : 'Review posted!');
      await loadReviews();
      onRatingChange?.(); // tell the parent (Mess Details page) to refresh the mess's cached rating display
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your review? This cannot be undone.')) return;

    try {
      await deleteReview(myReview._id);
      setMyReview(null);
      setFormData({ rating: 0, comment: '' });
      toast.success('Review deleted');
      await loadReviews();
      onRatingChange?.();
    } catch (error) {
      toast.error('Could not delete review');
    }
  };

  return (
    <div>
      {isAuthenticated && user?.role === 'student' && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-medium text-gray-800 mb-2">
            {myReview ? 'Edit your review' : 'Write a review'}
          </h4>
          <StarPicker
            value={formData.rating}
            onChange={(rating) => setFormData({ ...formData, rating })}
          />
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Share your experience..."
            rows={3}
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              {myReview ? 'Update Review' : 'Post Review'}
            </button>
            {myReview && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-red-500 hover:underline px-2"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-gray-400 text-sm">No reviews yet — be the first!</p>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm text-gray-800">{review.studentId?.name || 'Student'}</span>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} size={11} className={s <= review.rating ? '' : 'text-gray-200'} />
                  ))}
                </div>
                {review.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;