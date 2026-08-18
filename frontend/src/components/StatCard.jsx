import React from 'react';

const StatCard = ({ label, value, icon: Icon, accent = 'primary', subtext }) => {
  const accentStyles = {
    primary: 'bg-primary/10 text-primary border-primary/20',
    amber: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300/30',
    blue: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300/30',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300/30',
  };

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${accentStyles[accent] || accentStyles.primary}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">
          {value}
        </p>
        {subtext && (
          <p className="text-[11px] font-medium text-text-secondary">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;