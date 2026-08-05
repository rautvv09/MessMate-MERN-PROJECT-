import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import BookingCard from '../../components/BookingCard';

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
    // window.prompt returns null if the user clicks Cancel on the prompt itself —
    // distinct from an empty string, which means they clicked OK with nothing typed
    if (reason === null) return;

    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId, { cancellationReason: reason || undefined });
      toast.success('Booking cancelled');
      await loadBookings(); // refetch — a waitlisted booking elsewhere may have just been promoted
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) return <p className="text-center py-16 text-gray-400">Loading your bookings...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-400 py-12">
          You haven't booked any mess yet.
        </p>
      ) : (
        <div className="space-y-4">
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