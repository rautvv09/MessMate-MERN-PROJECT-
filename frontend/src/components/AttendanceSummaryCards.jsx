import { FaUsers, FaCoffee, FaUtensils, FaMoon, FaPlaneArrival, FaLock } from 'react-icons/fa';

/**
 * AttendanceSummaryCards — Stat cards displayed at the top of the attendance panel.
 */
const CARDS = [
  {
    key: 'total',
    label: 'Total Students',
    field: 'total',
    icon: FaUsers,
    bgClass: 'bg-surface border-border',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-text-primary',
  },
  {
    key: 'breakfast',
    label: 'Breakfast',
    field: 'breakfastPresent',
    icon: FaCoffee,
    bgClass: 'bg-surface border-border',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    valueColor: 'text-text-primary',
  },
  {
    key: 'lunch',
    label: 'Lunch',
    field: 'lunchPresent',
    icon: FaUtensils,
    bgClass: 'bg-surface border-border',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    valueColor: 'text-text-primary',
  },
  {
    key: 'dinner',
    label: 'Dinner',
    field: 'dinnerPresent',
    icon: FaMoon,
    bgClass: 'bg-surface border-border',
    iconBg: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
    valueColor: 'text-text-primary',
  },
  {
    key: 'leave',
    label: 'On Leave',
    field: 'onLeave',
    icon: FaPlaneArrival,
    bgClass: 'bg-surface border-border',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    valueColor: 'text-text-primary',
  },
  {
    key: 'locked',
    label: 'Locked',
    field: 'lockedCount',
    icon: FaLock,
    bgClass: 'bg-surface border-border',
    iconBg: 'bg-status-danger/10',
    iconColor: 'text-status-danger',
    valueColor: 'text-text-primary',
  },
];

const AttendanceSummaryCards = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = summary[card.field] ?? 0;

        return (
          <div
            key={card.key}
            className={`${card.bgClass} rounded-2xl p-4 border shadow-xs transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className={card.iconColor} size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-text-secondary font-bold truncate">{card.label}</p>
                <p className={`text-lg font-extrabold font-heading leading-tight ${card.valueColor}`}>{value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceSummaryCards;
