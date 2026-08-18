import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart, FaUtensils, FaArrowRight, FaWifi, FaCheckCircle } from 'react-icons/fa';

const MessCard = ({ mess, isFavorited, onToggleFavorite }) => {
  const defaultImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
  ];

  const coverImage = mess.gallery?.[0]?.url || defaultImages[Math.abs(mess.name.length) % defaultImages.length];

  const isVeg = mess.foodType === 'veg';
  const isNonVeg = mess.foodType === 'non-veg';

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden hover:border-primary/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
      <div>
        {/* Cover Image Container */}
        <div className="relative h-48 sm:h-52 overflow-hidden bg-background">
          <img
            src={coverImage}
            alt={mess.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Food Type Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-md ${
                isVeg
                  ? 'bg-emerald-600/90 text-white border border-emerald-400/40'
                  : isNonVeg
                  ? 'bg-red-600/90 text-white border border-red-400/40'
                  : 'bg-amber-600/90 text-white border border-amber-400/40'
              }`}
            >
              {mess.foodType || 'Veg & Non-Veg'}
            </span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite(mess._id)}
            type="button"
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-md border border-border flex items-center justify-center text-text-primary hover:scale-110 active:scale-95 transition-all shadow-md"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? (
              <FaHeart className="text-status-danger text-sm animate-in zoom-in-75 duration-200" />
            ) : (
              <FaRegHeart className="text-text-secondary text-sm hover:text-status-danger transition-colors" />
            )}
          </button>

          {/* Rating Pill */}
          <div className="absolute bottom-3 right-3 bg-surface/90 dark:bg-surface/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 text-text-primary border border-border shadow-sm">
            <FaStar className="text-amber-400 text-xs" />
            <span>{mess.rating?.average > 0 ? mess.rating.average.toFixed(1) : '4.8'}</span>
            <span className="text-[10px] text-text-secondary font-normal">
              ({mess.rating?.count || 42})
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <h3 className="font-heading font-extrabold text-lg text-text-primary group-hover:text-primary transition-colors truncate">
              {mess.name}
            </h3>
            <p className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
              <FaMapMarkerAlt className="text-primary shrink-0" size={12} />
              <span className="truncate">{mess.address ? `${mess.address}, ${mess.city}` : mess.city}</span>
            </p>
          </div>

          {/* Facilities Pill List */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {mess.facilities?.slice(0, 3).map((facility, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-background text-text-secondary border border-border/60"
              >
                {facility}
              </span>
            )) || (
              <>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-background text-text-secondary border border-border/60">RO Water</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-background text-text-secondary border border-border/60">WiFi</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-background text-text-secondary border border-border/60">Hot Meals</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer Pricing */}
      <div className="px-5 pb-5 pt-3 border-t border-border flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider block">Monthly Plan</span>
          <p className="text-xl font-extrabold font-heading text-text-primary">
            ₹{(mess.pricing?.baseFee || 3200).toLocaleString('en-IN')}{' '}
            <span className="text-xs font-normal text-text-secondary">/mo</span>
          </p>
        </div>

        <Link
          to={`/messes/${mess._id}`}
          className="px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 transform group-hover:translate-x-0.5"
        >
          View Mess <FaArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
};

export default MessCard;