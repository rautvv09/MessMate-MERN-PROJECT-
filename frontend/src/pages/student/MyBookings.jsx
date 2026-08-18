import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import BookingCard from '../../components/BookingCard';
import { FaUtensils, FaCheckCircle, FaClock, FaCalendarCheck, FaRegFrown, FaCompass } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const loadBookings = async () => {
    try {
      const { data } = await getMyBookings();
      setBookings(data.data.bookings);
    } catch (error) {
      toast.error('Could not load your bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const reason = window.prompt('Reason for cancellation (optional):');
    if (reason === null) return;

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, { cancellationReason: reason || undefined });
      toast.success('Booking cancelled');
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const activeCount = bookings.filter((b) => b.status === 'confirmed').length;
  const waitlistedCount = bookings.filter((b) => b.status === 'waitlisted').length;

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-editorial-sub flex items-center gap-1.5">
            <FaUtensils className="text-primary" /> SUBSCRIPTION MANAGEMENT
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-primary mt-1">
            My Mess Bookings
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            View your active meal plans, waitlist status, and subscription details.
          </p>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center gap-3">
          <div className="bg-surface border border-border px-4 py-2 rounded-2xl text-xs font-semibold text-text-secondary shadow-xs">
            Active: <span className="text-primary font-bold">{activeCount}</span>
          </div>
          <div className="bg-surface border border-border px-4 py-2 rounded-2xl text-xs font-semibold text-text-secondary shadow-xs">
            Waitlisted: <span className="text-amber-500 font-bold">{waitlistedCount}</span>
          </div>
        </div>
      </div>

      {/* 5-Step Checkout Indicator Bar */}
      <div className="bg-surface border border-border p-4 rounded-3xl overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px] text-xs font-extrabold">
          {[
            { step: '01', title: 'PLAN' },
            { step: '02', title: 'DURATION' },
            { step: '03', title: 'DATE' },
            { step: '04', title: 'SUMMARY' },
            { step: '05', title: 'CONFIRM' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-primary">
              <span className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                {item.step}
              </span>
              <span className="font-heading">{item.title}</span>
              {idx < 4 && <span className="text-text-muted px-2">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Bookings List / Skeletons / Empty State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((idx) => (
            <div key={idx} className="bg-surface border border-border rounded-3xl h-48 shimmer-bg" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
            <FaRegFrown />
          </div>
          <h3 className="text-lg font-bold font-heading text-text-primary">No Active Bookings</h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            You haven't subscribed to any mess yet. Discover top-rated messes near your college campus and get started!
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-dark transition-all"
          >
            <FaCompass /> EXPLORE MESSES
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCancel={handleCancel}
              isCancelling={cancellingId === booking._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;