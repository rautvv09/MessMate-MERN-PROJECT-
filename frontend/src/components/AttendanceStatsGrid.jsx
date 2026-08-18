import {
  FaCoffee,
  FaUtensils,
  FaMoon,
  FaTimesCircle,
  FaChartLine,
  FaCalendarCheck,
  FaCalendarTimes,
  FaUmbrellaBeach,
} from 'react-icons/fa';

/**
 * AttendanceStatsGrid — A grid of statistics cards for the student's
 * monthly attendance summary.
 */
const AttendanceStatsGrid = ({ stats }) => {
  if (!stats) return null;

  const cards = [
    {
      label: 'Breakfast Taken',
      value: stats.breakfastTaken,
      icon: FaCoffee,
      bgClass: 'bg-surface border-border',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      valueColor: 'text-text-primary',
    },
    {
      label: 'Lunch Taken',
      value: stats.lunchTaken,
      icon: FaUtensils,
      bgClass: 'bg-surface border-border',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      valueColor: 'text-text-primary',
    },
    {
      label: 'Dinner Taken',
      value: stats.dinnerTaken,
      icon: FaMoon,
      bgClass: 'bg-surface border-border',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
      valueColor: 'text-text-primary',
    },
    {
      label: 'Meals Consumed',
      value: stats.totalMealsConsumed,
      icon: FaCalendarCheck,
      bgClass: 'bg-surface border-border',
      iconBg: 'bg-teal-500/10',
      iconColor: 'text-teal-500',
      valueColor: 'text-text-primary',
    },
    {
      label: 'Meals Missed',
      value: stats.totalMealsMissed,
      icon: FaTimesCircle,
      bgClass: 'bg-surface border-border',
      iconBg: 'bg-status-danger/10',
      iconColor: 'text-status-danger',
      valueColor: 'text-text-primary',
    },
    {
      label: 'Attendance %',
      value: `${stats.attendancePercentage}%`,
      icon: FaChartLine,
      bgClass: 'bg-surface border-border',
      iconBg: getPercentageIconBg(stats.attendancePercentage),
      iconColor: getPercentageIconColor(stats.attendancePercentage),
      valueColor: 'text-text-primary',
    },
    {
      label: 'Leave Days',
      value: stats.leaveDays,
      icon: FaCalendarTimes,
      bgClass: 'bg-surface border-border',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      valueColor: 'text-text-primary',
    },
    {
      label: 'Holidays',
      value: stats.holidayDays,
      icon: FaUmbrellaBeach,
      bgClass: 'bg-surface border-border',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      valueColor: 'text-text-primary',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={`${card.bgClass} rounded-2xl p-4 border shadow-xs transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${card.iconBg}`}
              >
                <Icon className={card.iconColor} size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-text-secondary font-bold truncate">
                  {card.label}
                </p>
                <p className={`text-lg font-extrabold font-heading leading-tight ${card.valueColor}`}>
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

function getPercentageIconBg(pct) {
  if (pct >= 80) return 'bg-emerald-500/10';
  if (pct >= 60) return 'bg-amber-500/10';
  return 'bg-status-danger/10';
}

function getPercentageIconColor(pct) {
  if (pct >= 80) return 'text-emerald-500';
  if (pct >= 60) return 'text-amber-500';
  return 'text-status-danger';
}

export default AttendanceStatsGrid;
