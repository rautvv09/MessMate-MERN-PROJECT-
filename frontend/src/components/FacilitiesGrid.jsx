import {
  FaSnowflake, FaMotorcycle, FaBreadSlice, FaCertificate,
  FaParking, FaVideo, FaWifi, FaCreditCard,
} from 'react-icons/fa';

const FACILITY_CONFIG = {
  AC_DINING: { icon: FaSnowflake, label: 'AC Dining' },
  HOME_DELIVERY: { icon: FaMotorcycle, label: 'Home Delivery' },
  UNLIMITED_ROTI: { icon: FaBreadSlice, label: 'Unlimited Roti' },
  HYGIENE_CERTIFIED: { icon: FaCertificate, label: 'Hygiene Certified' },
  PARKING: { icon: FaParking, label: 'Parking' },
  CCTV: { icon: FaVideo, label: 'CCTV' },
  WIFI: { icon: FaWifi, label: 'WiFi' },
  CARD_UPI_PAYMENT: { icon: FaCreditCard, label: 'Card/UPI Payment' },
};

const FacilitiesGrid = ({ facilities = [] }) => {
  if (facilities.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {facilities.map((key) => {
        const config = FACILITY_CONFIG[key];
        if (!config) return null; // guards against an unrecognized value slipping through
        const Icon = config.icon;
        return (
          <div key={key} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-lg">
            <Icon className="text-emerald-600" size={20} />
            <span className="text-xs text-gray-600 text-center">{config.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const FacilitiesGridExport = FacilitiesGrid;
export default FacilitiesGridExport;