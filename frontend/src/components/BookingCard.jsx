import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import StatusBadge from './StatusBadge';
import { FaCalendarAlt, FaReceipt, FaMapMarkerAlt, FaTimesCircle, FaUtensils } from 'react-icons/fa';

const BookingCard = ({ booking, onCancel, isCancelling }) => {
  const canCancel = booking.status === 'confirmed' || booking.status === 'waitlisted';
  const mess = booking.messId;

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FaUtensils size={18} />
          </div>
          <div>
            <Link
              to={`/messes/${mess?._id}`}
              className="font-heading font-extrabold text-lg text-text-primary hover:text-primary transition-colors"
            >
              {mess?.name || 'Mess Subscription'}
            </Link>
            <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
              <FaMapMarkerAlt className="text-primary" size={10} /> {mess?.city || 'Locality'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={booking.status} />
        </div>
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-background/60 p-3 rounded-2xl border border-border/50">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">Booking ID</span>
          <span className="font-mono font-bold text-text-primary text-xs truncate block">{booking.bookingId}</span>
        </div>
        <div className="bg-background/60 p-3 rounded-2xl border border-border/50">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">Plan Type</span>
          <span className="font-bold text-text-primary text-xs">{booking.planType}</span>
        </div>
        <div className="bg-background/60 p-3 rounded-2xl border border-border/50">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">Duration</span>
          <span className="font-bold text-text-primary text-xs">{booking.durationMonths} Month(s)</span>
        </div>
        <div className="bg-background/60 p-3 rounded-2xl border border-border/50">
          <span className="text-[10px] uppercase font-bold text-text-secondary block">Joining Date</span>
          <span className="font-bold text-text-primary text-xs">
            {format(new Date(booking.joiningDate), 'dd MMM yyyy')}
          </span>
        </div>
      </div>

      {/* Price Snapshot Card */}
      <div className="bg-background border border-border rounded-2xl p-4 text-xs space-y-2">
        <div className="flex justify-between text-text-secondary">
          <span>Base Plan Cost</span>
          <span className="font-semibold text-text-primary">₹{booking.priceSnapshot?.planCost || 0}</span>
        </div>
        {booking.priceSnapshot?.discountApplied > 0 && (
          <div className="flex justify-between text-primary font-semibold">
            <span>Discount Applied</span>
            <span>-₹{booking.priceSnapshot.discountApplied}</span>
          </div>
        )}
        <div className="flex justify-between text-text-secondary">
          <span>Security Deposit</span>
          <span className="font-semibold text-text-primary">₹{booking.priceSnapshot?.deposit || 0}</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Registration Fee</span>
          <span className="font-semibold text-text-primary">₹{booking.priceSnapshot?.registrationFee || 0}</span>
        </div>
        <div className="flex justify-between font-extrabold text-sm text-text-primary pt-2 border-t border-border">
          <span>Total Subscription Amount</span>
          <span className="text-primary font-heading">₹{booking.priceSnapshot?.totalPayable || 0}</span>
        </div>
      </div>

      {booking.status === 'cancelled' && booking.cancellationReason && (
        <p className="text-xs text-text-secondary italic bg-status-danger/10 p-3 rounded-xl border border-status-danger/20">
          Reason for cancellation: {booking.cancellationReason}
        </p>
      )}

      {/* Quick Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {booking.status === 'confirmed' && (
            <>
              <Link
                to="/my-attendance"
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-dark transition-all flex items-center gap-1.5"
              >
                <FaCalendarAlt size={12} /> Mark Attendance
              </Link>
              <Link
                to="/my-bills"
                className="px-4 py-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <FaReceipt size={12} /> View Bills
              </Link>
            </>
          )}
        </div>

        {canCancel && (
          <button
            onClick={() => onCancel(booking._id)}
            disabled={isCancelling}
            type="button"
            className="px-4 py-2 rounded-xl text-status-danger hover:bg-status-danger/10 border border-status-danger/30 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <FaTimesCircle size={12} /> {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;