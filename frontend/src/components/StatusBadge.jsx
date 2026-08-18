const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' },
  waitlisted: { label: 'Waitlisted', className: 'bg-amber-500/10 text-amber-500 border border-amber-500/30' },
  cancelled: { label: 'Cancelled', className: 'bg-status-danger/10 text-status-danger border border-status-danger/30' },
  completed: { label: 'Completed', className: 'bg-background text-text-secondary border border-border' },
};

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || { label: status, className: 'bg-background text-text-secondary border border-border' };

  return (
    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;