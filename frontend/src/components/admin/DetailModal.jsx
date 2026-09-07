import { FaTimes, FaUser, FaStore, FaUtensils, FaReceipt, FaStar, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const DetailModal = ({
  isOpen,
  onClose,
  title,
  type = 'student', // 'student' | 'owner' | 'mess' | 'booking'
  data = null,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              {type === 'student' && <FaUser size={13} />}
              {type === 'owner' && <FaStore size={13} />}
              {type === 'mess' && <FaUtensils size={13} />}
              {type === 'booking' && <FaReceipt size={13} />}
            </div>
            <h3 className="text-base font-extrabold font-heading text-text-primary">
              {title || 'Details'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-lg transition-colors"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isLoading || !data ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-text-secondary">Loading details...</p>
            </div>
          ) : (
            <>
              {/* STUDENT VIEW */}
              {type === 'student' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-heading uppercase">
                      {data.student?.name?.[0] || 'S'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-text-primary font-heading">
                          {data.student?.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            data.student?.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : 'bg-status-danger/10 text-status-danger border-status-danger/30'
                          }`}
                        >
                          {data.student?.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-text-secondary flex items-center gap-2">
                        <FaEnvelope size={10} /> {data.student?.email}
                      </p>
                      {data.student?.phone && (
                        <p className="text-xs text-text-secondary flex items-center gap-2">
                          <FaPhone size={10} /> {data.student?.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">College</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{data.student?.roleDetails?.college || 'Not specified'}</p>
                    </div>
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">City</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{data.student?.roleDetails?.city || 'Not specified'}</p>
                    </div>
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Registered</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{formatDate(data.student?.createdAt)}</p>
                    </div>
                  </div>

                  {data.bookings && data.bookings.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-text-primary uppercase mb-2">Bookings History ({data.bookings.length})</h5>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {data.bookings.map((b) => (
                          <div key={b._id} className="bg-background p-3 rounded-xl border border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-mono font-bold text-primary">{b.bookingId}</span>
                              <p className="text-text-secondary">{b.messId?.name} • {b.planType}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-extrabold text-text-primary">₹{b.priceSnapshot?.totalPayable}</span>
                              <span className="block text-[10px] uppercase font-bold text-text-secondary">{b.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OWNER VIEW */}
              {type === 'owner' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-background p-4 rounded-2xl border border-border">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-heading uppercase">
                      {data.owner?.name?.[0] || 'O'}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-extrabold text-text-primary font-heading">
                          {data.owner?.name}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            data.owner?.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                              : 'bg-status-danger/10 text-status-danger border-status-danger/30'
                          }`}
                        >
                          {data.owner?.status || 'Active'}
                        </span>
                        {data.owner?.roleDetails?.isVerifiedOwner && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-secondary flex items-center gap-2">
                        <FaEnvelope size={10} /> {data.owner?.email}
                      </p>
                      {data.owner?.phone && (
                        <p className="text-xs text-text-secondary flex items-center gap-2">
                          <FaPhone size={10} /> {data.owner?.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Business Name</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{data.owner?.roleDetails?.businessName || '—'}</p>
                    </div>
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Registered Address</span>
                      <p className="text-xs font-bold text-text-primary mt-0.5">{data.owner?.roleDetails?.address || '—'}</p>
                    </div>
                  </div>

                  {data.messes && data.messes.length > 0 && (
                    <div>
                      <h5 className="text-xs font-bold text-text-primary uppercase mb-2">Mess Listings ({data.messes.length})</h5>
                      <div className="space-y-2">
                        {data.messes.map((m) => (
                          <div key={m._id} className="bg-background p-3 rounded-xl border border-border flex items-center justify-between text-xs">
                            <div>
                              <span className="font-extrabold text-text-primary">{m.name}</span>
                              <p className="text-text-secondary">{m.city} • {m.foodType} • {m.totalSeats} seats</p>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-primary">₹{m.pricing?.baseFee}/mo</span>
                              <span className={`block text-[10px] font-bold ${m.isActive ? 'text-emerald-500' : 'text-text-muted'}`}>
                                {m.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MESS VIEW */}
              {type === 'mess' && (
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-2xl border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-extrabold text-text-primary font-heading">
                        {data.mess?.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <FaStar size={11} /> {data.mess?.rating?.average || 0} ({data.mess?.rating?.count || 0})
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary">{data.mess?.description}</p>
                    <p className="text-xs text-text-primary font-semibold flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-primary" size={11} /> {data.mess?.address}, {data.mess?.city}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Food Type</span>
                      <p className="font-bold text-text-primary capitalize mt-0.5">{data.mess?.foodType}</p>
                    </div>
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Base Monthly Fee</span>
                      <p className="font-bold text-primary mt-0.5">₹{data.mess?.pricing?.baseFee}</p>
                    </div>
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Total Seats</span>
                      <p className="font-bold text-text-primary mt-0.5">{data.mess?.totalSeats}</p>
                    </div>
                  </div>

                  {data.mess?.ownerId && (
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Mess Owner</span>
                      <div className="flex items-center justify-between mt-1 text-xs">
                        <span className="font-bold text-text-primary">{data.mess.ownerId.name}</span>
                        <span className="text-text-secondary">{data.mess.ownerId.phone || data.mess.ownerId.email}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* BOOKING VIEW */}
              {type === 'booking' && (
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded-2xl border border-border space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-text-secondary uppercase">Booking Reference</span>
                        <h4 className="text-base font-extrabold text-primary font-mono">
                          {data.booking?.bookingId}
                        </h4>
                      </div>
                      <span className="text-xs font-extrabold uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {data.booking?.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Student</span>
                      <p className="font-bold text-text-primary mt-0.5">{data.booking?.studentId?.name}</p>
                      <p className="text-text-secondary">{data.booking?.studentId?.email}</p>
                    </div>
                    <div className="bg-background p-3 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">Mess</span>
                      <p className="font-bold text-text-primary mt-0.5">{data.booking?.messId?.name}</p>
                      <p className="text-text-secondary">{data.booking?.messId?.city}</p>
                    </div>
                  </div>

                  <div className="bg-background p-4 rounded-xl border border-border space-y-2 text-xs">
                    <h5 className="font-bold text-text-primary uppercase mb-1">Pricing Breakdown</h5>
                    <div className="flex justify-between text-text-secondary">
                      <span>Plan Cost ({data.booking?.planType} - {data.booking?.durationMonths} mo)</span>
                      <span className="text-text-primary">₹{data.booking?.priceSnapshot?.planCost}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Deposit</span>
                      <span className="text-text-primary">₹{data.booking?.priceSnapshot?.deposit}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Registration Fee</span>
                      <span className="text-text-primary">₹{data.booking?.priceSnapshot?.registrationFee}</span>
                    </div>
                    <div className="pt-2 border-t border-border flex justify-between font-extrabold text-sm text-text-primary">
                      <span>Total Payable</span>
                      <span className="text-primary font-heading">₹{data.booking?.priceSnapshot?.totalPayable}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end bg-background">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-all border border-border"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
