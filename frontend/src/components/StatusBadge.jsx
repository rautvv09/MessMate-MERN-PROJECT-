const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-100 text-emerald-700' },
  waitlisted: { label: 'Waitlisted', className: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  completed: { label: 'Completed', className: 'bg-gray-100 text-gray-600' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;