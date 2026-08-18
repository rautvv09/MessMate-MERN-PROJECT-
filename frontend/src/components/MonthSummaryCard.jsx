import { FaReceipt } from 'react-icons/fa';

/**
 * MonthSummaryCard — Visual summary card showing attendance ring,
 * key metrics, and real-time live estimated bill for the student.
 */
const MonthSummaryCard = ({ stats, monthName, planType }) => {
  if (!stats) return null;

  const pct = stats.attendancePercentage || 0;
  const currentBill = stats.currentBillAmount || 0;
  const billStatus = stats.billStatus || 'Ongoing';

  // SVG circle parameters for the progress ring
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  // Dynamic ring color
  const ringColor = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const ringBg = pct >= 80 ? 'rgba(16, 185, 129, 0.15)' : pct >= 60 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Average' : 'Low';

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold font-heading text-text-primary">Monthly Summary</h3>
          <p className="text-xs text-text-secondary mt-0.5">{monthName}</p>
        </div>
        {planType && (
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary capitalize border border-primary/20">
            {planType}
          </span>
        )}
      </div>

      {/* Live Bill Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
            <FaReceipt /> Live Monthly Bill
          </span>
          <p className="text-2xl font-extrabold font-heading mt-0.5">
            ₹{currentBill.toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-emerald-100 mt-0.5">
            Real-time total based on attendance marked so far
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white capitalize">
          {billStatus}
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Progress Ring */}
        <div className="relative shrink-0">
          <svg width="110" height="110" viewBox="0 0 128 128">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={ringBg}
              strokeWidth="10"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke={ringColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 64 64)"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold font-heading text-text-primary">{pct}%</span>
            <span className="text-[10px] font-bold" style={{ color: ringColor }}>
              {label}
            </span>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="flex-1 space-y-2 text-xs">
          <SummaryRow label="Total Days" value={stats.totalDays} dotColor="bg-slate-500" />
          <SummaryRow label="Meals Consumed" value={stats.totalMealsConsumed} dotColor="bg-emerald-500" />
          <SummaryRow label="Meals Missed" value={stats.totalMealsMissed} dotColor="bg-status-danger" />
          <SummaryRow label="Leave Days" value={stats.leaveDays} dotColor="bg-blue-500" />
          <SummaryRow label="Holidays" value={stats.holidayDays} dotColor="bg-purple-500" />
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value, dotColor }) => (
  <div className="flex items-center justify-between">
    <span className="flex items-center gap-2 text-xs text-text-secondary font-medium">
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </span>
    <span className="text-xs font-bold text-text-primary">{value}</span>
  </div>
);

export default MonthSummaryCard;
