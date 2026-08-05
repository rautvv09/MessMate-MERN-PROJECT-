import { Link } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaHeart, FaRegHeart } from 'react-icons/fa';

const MessCard = ({ mess, isFavorited, onToggleFavorite }) => {
  const coverImage = mess.gallery?.[0]?.url || '/placeholder-mess.jpg';

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative h-44">
        <img src={coverImage} alt={mess.name} className="w-full h-full object-cover" />
        <button
          onClick={() => onToggleFavorite(mess._id)}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 hover:bg-white transition-colors"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorited ? (
            <FaHeart className="text-red-500" size={16} />
          ) : (
            <FaRegHeart className="text-gray-600" size={16} />
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-900 truncate">{mess.name}</h3>
          <div className="flex items-center gap-1 text-sm text-amber-500 shrink-0 ml-2">
            <FaStar size={12} />
            <span>{mess.rating?.average > 0 ? mess.rating.average.toFixed(1) : 'New'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
          <FaMapMarkerAlt size={12} />
          <span className="truncate">{mess.city}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-emerald-600">
            ₹{mess.pricing.baseFee}
            <span className="text-sm font-normal text-gray-400">/month</span>
          </span>
          <Link
            to={`/messes/${mess._id}`}
            className="text-sm font-medium text-emerald-600 hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MessCard;