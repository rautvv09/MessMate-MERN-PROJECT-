/**
 * MealStatusSelect — A styled dropdown for selecting a meal's attendance status.
 *
 * Each status has a distinct color to provide instant visual feedback:
 * - Present (green)  → billable
 * - Late (amber)     → billable
 * - Absent (gray)    → not billable
 * - Leave (blue)     → not billable
 * - Holiday (purple) → not billable
 *
 * Props:
 * - value:       current status string
 * - onChange:    callback(newStatus)
 * - disabled:    locked for billing / not applicable
 * - mealType:    'breakfast' | 'lunch' | 'dinner' (for aria label)
 * - studentName: for accessibility
 */
const STATUS_CONFIG = {
  present: {
    label: 'Present',
    bgClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
    dotClass: 'bg-emerald-500',
  },
  absent: {
    label: 'Absent',
    bgClass: 'bg-background border-border text-text-secondary',
    dotClass: 'bg-text-muted',
  },
  leave: {
    label: 'Leave',
    bgClass: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
    dotClass: 'bg-blue-500',
  },
  holiday: {
    label: 'Holiday',
    bgClass: 'bg-purple-500/10 border-purple-500/30 text-purple-500',
    dotClass: 'bg-purple-500',
  },
  late: {
    label: 'Late',
    bgClass: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
    dotClass: 'bg-amber-500',
  },
};

const STATUSES = ['present', 'absent', 'leave', 'holiday', 'late'];

const MealStatusSelect = ({
  value = 'absent',
  onChange,
  disabled = false,
  mealType = '',
  studentName = '',
}) => {
  const config = STATUS_CONFIG[value] || STATUS_CONFIG.absent;

  if (disabled) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-background text-text-muted border border-border/40 cursor-not-allowed select-none opacity-60"
        title="Not applicable for this student's plan"
      >
        <span className="w-2 h-2 rounded-full bg-text-muted shrink-0" />
        {config.label}
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`${mealType} status for ${studentName}`}
        className={`appearance-none w-full pl-6 pr-7 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${config.bgClass}`}
      >
        {STATUSES.map((status) => (
          <option key={status} value={status} className="bg-surface text-text-primary">
            {STATUS_CONFIG[status].label}
          </option>
        ))}
      </select>

      {/* Colored dot indicator */}
      <span
        className={`absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full pointer-events-none ${config.dotClass}`}
      />

      {/* Dropdown chevron */}
      <svg
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-secondary pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};

export default MealStatusSelect;
