import { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaCheck, FaTimes } from 'react-icons/fa';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STATUS_DOT_COLORS = {
  present: 'bg-emerald-500',
  late: 'bg-amber-500',
  absent: 'bg-status-danger',
  leave: 'bg-blue-500',
  holiday: 'bg-purple-500',
};

const STATUS_TOOLTIP = {
  present: 'Present',
  late: 'Late',
  absent: 'Absent',
  leave: 'Leave',
  holiday: 'Holiday',
};

const AttendanceCalendar = ({
  calendarDays,
  year,
  month,
  monthName,
  onPreviousMonth,
  onNextMonth,
  canGoNext,
  isLoading,
  onMarkAttendance,
}) => {
  const [activeCell, setActiveCell] = useState(null);

  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const dayMap = new Map();
    calendarDays.forEach((d) => {
      dayMap.set(d.day, d);
    });

    const grid = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push({ type: 'empty', key: `empty-start-${i}` });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const record = dayMap.get(day);
      const today = new Date();
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() + 1 &&
        day === today.getDate();

      const isFuture = new Date(year, month - 1, day) > new Date();

      grid.push({
        type: 'day',
        key: `day-${day}`,
        day,
        isToday,
        isFuture,
        record,
      });
    }

    return grid;
  }, [calendarDays, year, month]);

  const handleCellClick = (cell) => {
    if (cell.isFuture) return;
    setActiveCell(cell);
  };

  const handleQuickMark = (status) => {
    if (!activeCell || !onMarkAttendance) return;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(activeCell.day).padStart(2, '0')}`;
    onMarkAttendance(dateStr, status);
    setActiveCell(null);
  };

  return (
    <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-sm relative space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={onPreviousMonth}
          className="p-2.5 rounded-xl bg-background border border-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors"
          aria-label="Previous month"
        >
          <FaChevronLeft size={12} />
        </button>

        <h3 className="text-base font-extrabold font-heading text-text-primary">{monthName}</h3>

        <button
          onClick={onNextMonth}
          disabled={!canGoNext}
          className={`p-2.5 rounded-xl border transition-colors ${
            canGoNext
              ? 'bg-background border-border text-text-secondary hover:text-text-primary hover:border-primary/40'
              : 'bg-background/40 border-border/40 text-text-muted cursor-not-allowed'
          }`}
          aria-label="Next month"
        >
          <FaChevronRight size={12} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="p-6 pt-2">
          <p className="text-xs text-text-secondary mb-4 text-center">
            Tap on any past or present day to log attendance (Present / Absent).
          </p>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="text-center text-[10px] font-extrabold uppercase text-text-secondary py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarGrid.map((cell) => {
              if (cell.type === 'empty') {
                return <div key={cell.key} className="aspect-square" />;
              }

              const { day, isToday, isFuture, record } = cell;

              return (
                <button
                  key={cell.key}
                  type="button"
                  onClick={() => handleCellClick(cell)}
                  disabled={isFuture}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-1 transition-all relative group cursor-pointer border ${
                    isFuture
                      ? 'bg-background/40 border-border/40 text-text-muted cursor-not-allowed opacity-40'
                      : isToday
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/40'
                      : record
                      ? 'bg-background border-border hover:border-primary/50'
                      : 'bg-background border-border/60 text-text-secondary hover:border-primary/40'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      isToday ? 'text-primary font-extrabold' : isFuture ? 'text-text-muted' : 'text-text-primary'
                    }`}
                  >
                    {day}
                  </span>

                  {record && !isFuture && (
                    <div className="flex items-center gap-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[record.breakfast] || STATUS_DOT_COLORS.absent}`}
                        title={`B: ${STATUS_TOOLTIP[record.breakfast] || 'Absent'}`}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[record.lunch] || STATUS_DOT_COLORS.absent}`}
                        title={`L: ${STATUS_TOOLTIP[record.lunch] || 'Absent'}`}
                      />
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT_COLORS[record.dinner] || STATUS_DOT_COLORS.absent}`}
                        title={`D: ${STATUS_TOOLTIP[record.dinner] || 'Absent'}`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-border">
            {Object.entries(STATUS_DOT_COLORS).map(([status, colorClass]) => (
              <span key={status} className="flex items-center gap-1.5 text-[11px] font-medium text-text-secondary">
                <span className={`w-2 h-2 rounded-full ${colorClass}`} />
                {STATUS_TOOLTIP[status]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quick Mark Modal */}
      {activeCell && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl p-6 max-w-xs w-full shadow-2xl border border-border text-center space-y-4">
            <div>
              <h4 className="font-extrabold font-heading text-text-primary text-base">
                Mark Attendance
              </h4>
              <p className="text-xs text-text-secondary mt-1">
                Date: {activeCell.day} {monthName} {year}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickMark('present')}
                className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-bold p-3 rounded-2xl transition-all text-xs"
              >
                <FaCheck className="text-emerald-600 text-sm" />
                Present
              </button>

              <button
                type="button"
                onClick={() => handleQuickMark('absent')}
                className="flex flex-col items-center justify-center gap-1 bg-status-danger/10 hover:bg-status-danger/20 border border-status-danger/30 text-status-danger font-bold p-3 rounded-2xl transition-all text-xs"
              >
                <FaTimes className="text-status-danger text-sm" />
                Absent
              </button>
            </div>

            <button
              type="button"
              onClick={() => setActiveCell(null)}
              className="text-xs text-text-secondary hover:text-text-primary underline font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
