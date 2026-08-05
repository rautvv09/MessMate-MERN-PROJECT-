import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';
import { getMess } from '../../services/messService';
import { getMenu } from '../../services/menuService';
import { previewPrice, createBooking } from '../../services/bookingService';
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

  const [booking, setBooking] = useState({
    planType: 'Full Day', durationMonths: 1, joiningDate: '',
  });
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  const fetchMess = useCallback(async () => {
    const { data } = await getMess(messId);
    setMess(data.data.mess);
  }, [messId]);

  useEffect(() => {
    const loadPage = async () => {
      setIsLoading(true);
      try {
        await fetchMess();
        const { data: menuData } = await getMenu(messId);
        setMenu(menuData.data.menu);
      } catch (error) {
        toast.error('Could not load this mess.');
      } finally {
        setIsLoading(false);
      }
    };
    loadPage();
  }, [messId, fetchMess]);

  // Refetch price preview whenever plan or duration changes
  useEffect(() => {
    if (!mess) return;
    previewPrice(messId, { planType: booking.planType, durationMonths: booking.durationMonths })
      .then(({ data }) => setPriceBreakdown(data.data.priceBreakdown))
      .catch(() => setPriceBreakdown(null));
  }, [mess, messId, booking.planType, booking.durationMonths]);

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

      navigate('/bookings/me');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) return <p className="text-center py-16 text-gray-400">Loading...</p>;
  if (!mess) return <p className="text-center py-16 text-gray-400">Mess not found.</p>;

  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Gallery images={mess.gallery} messName={mess.name} />

        <div className="mt-6">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{mess.name}</h1>
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <FaStar size={16} />
              <span className="font-medium">
                {mess.rating.average > 0 ? mess.rating.average.toFixed(1) : 'New'}
              </span>
              <span className="text-gray-400 text-sm">({mess.rating.count})</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-500 mt-1">
            <FaMapMarkerAlt size={13} />
            <span>{mess.address}, {mess.city}</span>
          </div>
          <p className="text-gray-600 mt-4">{mess.description}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Facilities</h2>
          <FacilitiesGrid facilities={mess.facilities} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Menu</h2>
          <MenuDisplay menu={menu} />
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Reviews</h2>
          <ReviewSection messId={messId} onRatingChange={fetchMess} />
        </div>
      </div>

      {/* Booking Widget */}
      <div className="lg:col-span-1">
        <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-6">
          <h3 className="font-semibold text-gray-900 mb-4">Book this mess</h3>

          <form onSubmit={handleBookingSubmit}>
            <label className="text-sm font-medium text-gray-700 block mb-1">Meal Plan</label>
            <select
              value={booking.planType}
              onChange={(e) => setBooking({ ...booking, planType: e.target.value })}
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            <label className="text-sm font-medium text-gray-700 block mb-1">Duration</label>
            <select
              value={booking.durationMonths}
              onChange={(e) => setBooking({ ...booking, durationMonths: Number(e.target.value) })}
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {DURATION_OPTIONS.map((d) => <option key={d} value={d}>{d} month{d > 1 ? 's' : ''}</option>)}
            </select>

            <label className="text-sm font-medium text-gray-700 block mb-1">Joining Date</label>
            <input
              type="date"
              min={todayISO}
              value={booking.joiningDate}
              onChange={(e) => setBooking({ ...booking, joiningDate: e.target.value })}
              className="w-full mb-4 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />

            {priceBreakdown && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan cost</span>
                  <span>₹{priceBreakdown.planCost}</span>
                </div>
                {priceBreakdown.discountApplied > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-₹{priceBreakdown.discountApplied}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit</span>
                  <span>₹{priceBreakdown.deposit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registration fee</span>
                  <span>₹{priceBreakdown.registrationFee}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{priceBreakdown.totalPayable}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isBooking}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium py-2.5 rounded-lg"
            >
              {isBooking ? 'Booking...' : 'Book Now'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessDetails;