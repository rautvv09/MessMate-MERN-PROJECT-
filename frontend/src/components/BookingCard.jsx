import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';

const BookingCard = ({ booking, onCancel, isCancelling }) => {
  const canCancel = booking.status === 'confirmed' || booking.status === 'waitlisted';
  const mess = booking.messId;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <Link
            to={`/messes/${mess?._id}`}
            className="font-semibold text-gray-900 hover:text-emerald-600"
          >
            {mess?.name || 'Mess unavailable'}
          </Link>
          <p className="text-sm text-gray-400">{mess?.city}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
        <div>
          <span className="text-gray-400">Booking ID</span>
          <p className="font-medium text-gray-800">{booking.bookingId}</p>
        </div>
        <div>
          <span className="text-gray-400">Plan</span>
          <p className="font-medium text-gray-800">{booking.planType}</p>
        </div>
        <div>
          <span className="text-gray-400">Duration</span>
          <p className="font-medium text-gray-800">{booking.durationMonths} month(s)</p>
        </div>
        <div>
          <span className="text-gray-400">Joining Date</span>
          <p className="font-medium text-gray-800">
            {format(new Date(booking.joiningDate), 'dd MMM yyyy')}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Plan cost</span>
          <span>₹{booking.priceSnapshot.planCost}</span>
        </div>
        {booking.priceSnapshot.discountApplied > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Discount</span>
            <span>-₹{booking.priceSnapshot.discountApplied}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-500">Deposit</span>
          <span>₹{booking.priceSnapshot.deposit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Registration fee</span>
          <span>₹{booking.priceSnapshot.registrationFee}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
          <span>Total Paid</span>
          <span>₹{booking.priceSnapshot.totalPayable}</span>
        </div>
      </div>

      {booking.status === 'cancelled' && booking.cancellationReason && (
        <p className="text-xs text-gray-400 italic mb-3">
          Cancellation reason: {booking.cancellationReason}
        </p>
      )}

      {canCancel && (
        <button
          onClick={() => onCancel(booking._id)}
          disabled={isCancelling}
          className="text-sm text-red-500 hover:underline disabled:text-gray-300"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
        </button>
      )}
    </div>
  );
};

export default BookingCard;