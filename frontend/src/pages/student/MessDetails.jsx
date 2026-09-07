import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaShareAlt, FaCheckCircle, FaCalendarAlt, FaShieldAlt, FaPhoneAlt, FaUtensils, FaUser } from 'react-icons/fa';
import { getMess } from '../../services/messService';
import { getMenu } from '../../services/menuService';
import { previewPrice, createBooking, getActiveSubscription, cancelSubscription } from '../../services/bookingService';
import { checkFavorites, addFavorite, removeFavorite } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import Gallery from '../../components/Gallery';
import FacilitiesGrid from '../../components/FacilitiesGrid';
import MenuDisplay from '../../components/MenuDisplay';
import ReviewSection from '../../components/ReviewSection';

const PLAN_OPTIONS = ['Full Day', 'Lunch & Dinner', 'Lunch Only', 'Dinner Only'];
const DURATION_OPTIONS = [1, 3, 6];

const MessDetails = () => {
  const { messId } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mess, setMess] = useState(null);
  const [menu, setMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  const [booking, setBooking] = useState({
    planType: 'Full Day',
    durationMonths: 1,
    joiningDate: '',
  });
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false);

  const fetchMess = useCallback(async () => {
    const { data } = await getMess(messId);
    setMess(data.data.mess);
  }, [messId]);

  const fetchActiveSubscription = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await getActiveSubscription();
      setActiveSubscription(data.data?.activeSubscription || null);
    } catch (err) {
      console.error('Failed to check active subscription:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      try {
        await fetchMess();
        const { data: menuData } = await getMenu(messId);
        setMenu(menuData.data.menu);

        if (isAuthenticated) {
          const favData = await checkFavorites([messId]);
          setIsFavorited(favData.data.data.favoritedIds.includes(messId));
          await fetchActiveSubscription();
        }
      } catch (error) {
        toast.error('Could not load mess details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadPage();
  }, [messId, fetchMess, isAuthenticated, fetchActiveSubscription]);

  useEffect(() => {
    if (!mess) return;
    previewPrice(messId, { planType: booking.planType, durationMonths: booking.durationMonths })
      .then(({ data }) => setPriceBreakdown(data.data.priceBreakdown))
      .catch(() => setPriceBreakdown(null));
  }, [mess, messId, booking.planType, booking.durationMonths]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save favorites');
      return;
    }
    const previous = isFavorited;
    setIsFavorited(!previous);

    try {
      if (previous) {
        await removeFavorite(messId);
        toast.success('Removed from favorites');
      } else {
        await addFavorite(messId);
        toast.success('Added to favorites');
      }
    } catch (error) {
      setIsFavorited(previous);
      toast.error('Failed to update favorite');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: mess?.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleCancelSubscription = async () => {
    if (!activeSubscription) return;
    if (!window.confirm('Are you sure you want to cancel your current mess subscription?')) return;

    setIsCancellingSubscription(true);
    try {
      await cancelSubscription(activeSubscription._id || activeSubscription.subscriptionId, {
        cancellationReason: 'Cancelled by student from mess page',
      });
      toast.success('Subscription cancelled successfully. You may now choose another mess.');
      setActiveSubscription(null);
      await fetchActiveSubscription();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setIsCancellingSubscription(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please log in to book a mess');
      navigate('/login');
      return;
    }
    if (!booking.joiningDate) {
      toast.error('Please select a joining date');
      return;
    }

    setIsBooking(true);
    try {
      const { data } = await createBooking(messId, booking);
      const newBooking = data.data.booking;

      if (newBooking.status === 'confirmed') {
        toast.success(`Booking confirmed! ID: ${newBooking.bookingId}`);
      } else {
        toast(`Mess is full — you've been waitlisted (${newBooking.bookingId})`, { icon: '⏳' });
      }

      navigate('/student/subscription');
    } catch (error) {
      const msg = error.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(msg, { duration: 6000 });
      if (error.response?.status === 409) {
        fetchActiveSubscription();
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-text-secondary">Loading Mess Details...</p>
      </div>
    );
  }

  if (!mess) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <p className="text-lg font-bold text-text-primary">Mess not found</p>
      </div>
    );
  }

  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Info & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {mess.foodType || 'Veg & Non-Veg'}
            </span>
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              Verified Mess
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-primary">
            {mess.name}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary flex items-center gap-1.5">
            <FaMapMarkerAlt className="text-primary shrink-0" />
            <span>{mess.address}, {mess.city}</span>
          </p>
        </div>

        {/* Share & Favorite Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            type="button"
            className="p-3 rounded-2xl bg-surface border border-border text-text-primary hover:border-primary transition-all flex items-center gap-2 text-xs font-bold shadow-xs"
          >
            <FaShareAlt className="text-primary" /> Share
          </button>
          <button
            onClick={handleToggleFavorite}
            type="button"
            className="p-3 rounded-2xl bg-surface border border-border text-text-primary hover:border-status-danger transition-all flex items-center gap-2 text-xs font-bold shadow-xs"
          >
            {isFavorited ? (
              <FaHeart className="text-status-danger" />
            ) : (
              <FaRegHeart className="text-text-secondary" />
            )}
            {isFavorited ? 'Saved' : 'Save Favorite'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery & Details */}
        <div className="lg:col-span-8 space-y-10">
          <Gallery images={mess.gallery} messName={mess.name} />

          {/* About Section */}
          <div className="bg-surface border border-border p-6 rounded-3xl space-y-3 shadow-xs">
            <h2 className="text-xl font-bold font-heading text-text-primary flex items-center gap-2">
              <FaUtensils className="text-primary" size={16} /> About {mess.name}
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {mess.description || 'Welcome to ' + mess.name + '. We serve fresh, hygienic thalis prepared daily for hostel students and working professionals.'}
            </p>
          </div>

          {/* Facilities */}
          <div className="bg-surface border border-border p-6 rounded-3xl space-y-4 shadow-xs">
            <h2 className="text-xl font-bold font-heading text-text-primary">
              Facilities & Amenities
            </h2>
            <FacilitiesGrid facilities={mess.facilities} />
          </div>

          {/* Weekly Menu Display */}
          <div className="bg-surface border border-border p-6 rounded-3xl space-y-4 shadow-xs">
            <h2 className="text-xl font-bold font-heading text-text-primary flex items-center gap-2">
              <FaCalendarAlt className="text-primary" size={16} /> Weekly Thali Menu
            </h2>
            <MenuDisplay menu={menu} />
          </div>

          {/* Owner Details Card */}
          {mess.ownerId && (
            <div className="bg-surface border border-border p-6 rounded-3xl space-y-3 shadow-xs">
              <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                <FaUser className="text-primary" /> Managed By Mess Owner
              </h2>
              <div className="flex items-center gap-4 pt-1">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {mess.ownerId.name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">{mess.ownerId.name || 'Mess Manager'}</h3>
                  <p className="text-xs text-text-secondary">{mess.ownerId.email || 'Verified Provider'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="bg-surface border border-border p-6 rounded-3xl space-y-4 shadow-xs">
            <h2 className="text-xl font-bold font-heading text-text-primary">
              Student Reviews & Ratings
            </h2>
            <ReviewSection messId={messId} onRatingChange={fetchMess} />
          </div>
        </div>

        {/* Right Column: Sticky Booking Widget Panel */}
        <div className="lg:col-span-4 sticky top-24">
          <div className="bg-surface border-2 border-primary/30 p-6 rounded-3xl shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Starting at</span>
                <p className="text-2xl font-extrabold font-heading text-text-primary">
                  ₹{(mess.pricing?.baseFee || 3200).toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-text-secondary">/mo</span>
                </p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <FaStar /> {mess.rating?.average > 0 ? mess.rating.average.toFixed(1) : '4.8'}
              </div>
            </div>

            {/* CASE 1: Student is currently subscribed to THIS mess */}
            {activeSubscription && (activeSubscription.messId?._id?.toString() === messId.toString() || activeSubscription.messId === messId) ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FaCheckCircle /> Active Subscription
                    </span>
                    <span className="font-mono text-[10px] text-text-muted">{activeSubscription.bookingId}</span>
                  </div>
                  <p className="text-text-primary font-bold text-sm">
                    {activeSubscription.planType} Plan
                  </p>
                  <div className="text-[11px] text-text-secondary space-y-1 pt-1 border-t border-emerald-500/20">
                    <div className="flex justify-between">
                      <span>Start Date:</span>
                      <span className="font-semibold text-text-primary">
                        {new Date(activeSubscription.startDate || activeSubscription.joiningDate).toLocaleDateString()}
                      </span>
                    </div>
                    {activeSubscription.endDate && (
                      <div className="flex justify-between">
                        <span>Valid Until:</span>
                        <span className="font-semibold text-text-primary">
                          {new Date(activeSubscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-extrabold text-primary">
                        ₹{activeSubscription.priceSnapshot?.totalPayable}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-text-secondary text-center">
                  You already have an active subscription for this mess.
                </p>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/student/subscription')}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md"
                  >
                    View Current Subscription
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelSubscription}
                    disabled={isCancellingSubscription}
                    className="w-full bg-background hover:bg-status-danger/10 text-status-danger border border-status-danger/30 font-bold py-2.5 rounded-2xl text-xs transition-all disabled:opacity-50"
                  >
                    {isCancellingSubscription ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </div>
              </div>
            ) : activeSubscription ? (
              /* CASE 2: Student is subscribed to ANOTHER mess */
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold">
                    <FaShieldAlt /> Single Subscription Policy
                  </div>
                  <p className="text-text-primary font-bold text-xs leading-relaxed">
                    You already have an active subscription with{' '}
                    <span className="text-primary">{activeSubscription.messId?.name || 'another mess'}</span>.
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    Please cancel or wait until your current subscription expires before subscribing to another mess.
                  </p>
                  {activeSubscription.endDate && (
                    <div className="text-[10px] text-text-muted pt-1 border-t border-amber-500/20">
                      Active until: {new Date(activeSubscription.endDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/student/subscription')}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-2xl text-xs transition-all shadow-md"
                >
                  View Current Subscription
                </button>
              </div>
            ) : (
              /* CASE 3: No active subscription - Show Booking Form */
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1.5">Select Meal Plan</label>
                  <select
                    value={booking.planType}
                    onChange={(e) => setBooking({ ...booking, planType: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {PLAN_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1.5">Subscription Duration</label>
                  <select
                    value={booking.durationMonths}
                    onChange={(e) => setBooking({ ...booking, durationMonths: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d} Month{d > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-primary block mb-1.5">Subscription Joining Date</label>
                  <input
                    type="date"
                    min={todayISO}
                    value={booking.joiningDate}
                    onChange={(e) => setBooking({ ...booking, joiningDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-background border border-border text-xs font-semibold text-text-primary focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>

                {/* Live Price Breakdown Card */}
                {priceBreakdown && (
                  <div className="bg-background border border-border rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex justify-between text-text-secondary">
                      <span>Base Plan Cost</span>
                      <span className="font-semibold text-text-primary">₹{priceBreakdown.planCost}</span>
                    </div>
                    {priceBreakdown.discountApplied > 0 && (
                      <div className="flex justify-between text-primary font-semibold">
                        <span>Discount</span>
                        <span>-₹{priceBreakdown.discountApplied}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-text-secondary">
                      <span>Security Deposit</span>
                      <span className="font-semibold text-text-primary">₹{priceBreakdown.deposit}</span>
                    </div>
                    <div className="flex justify-between text-text-secondary">
                      <span>Registration Fee</span>
                      <span className="font-semibold text-text-primary">₹{priceBreakdown.registrationFee}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-sm text-text-primary pt-2 border-t border-border">
                      <span>Total Payable</span>
                      <span className="text-primary">₹{priceBreakdown.totalPayable}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBooking}
                  className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/25 transition-all text-xs tracking-wide uppercase"
                >
                  {isBooking ? 'Processing Booking...' : 'Subscribe & Book Now'}
                </button>
              </form>
            )}

            <div className="pt-2 text-center text-[10px] text-text-secondary flex items-center justify-center gap-1">
              <FaShieldAlt className="text-primary" /> 100% Refund Guarantee & Mess Quality Assurance
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessDetails;