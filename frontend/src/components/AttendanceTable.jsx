import { useState } from 'react';
import { FaLock, FaEdit, FaChevronDown } from 'react-icons/fa';
import MealStatusSelect from './MealStatusSelect';

/**
 * AttendanceTable — The main attendance grid showing all booked students.
 *
 * Columns:
 * - # (row number)
 * - Student (name, email, plan badge)
 * - Breakfast (MealStatusSelect dropdown)
 * - Lunch (MealStatusSelect dropdown)
 * - Dinner (MealStatusSelect dropdown)
 * - Status (marked/unmarked/locked indicators)
 * - Notes (expandable inline input)
 *
 * Features:
 * - Column-level "Mark All" dropdowns for bulk actions
 * - Locked rows are visually dimmed and non-editable
 * - Non-applicable meals (based on planType) are disabled
 * - Dirty (unsaved) rows have a subtle highlight
 * - Responsive: horizontal scroll on mobile
 */

const PLAN_BADGE_COLORS = {
  'Full Day': 'bg-emerald-100 text-emerald-700',
  'Lunch & Dinner': 'bg-blue-100 text-blue-700',
  'Lunch Only': 'bg-amber-100 text-amber-700',
  'Dinner Only': 'bg-purple-100 text-purple-700',
};

const MEAL_STATUSES = ['present', 'absent', 'leave', 'holiday', 'late'];

const AttendanceTable = ({
  students,
  dirtyStudentIds,
  onUpdateMealStatus,
  onUpdateNotes,
  onApplyStatusToAll,
}) => {
  const [expandedNotesId, setExpandedNotesId] = useState(null);

  if (students.length === 0) {
    return (
      <div className="text-center py-16 bg-surface rounded-2xl border border-border">
        <div className="w-16 h-16 mx-auto mb-4 bg-background rounded-full flex items-center justify-center">
          <FaEdit className="text-text-muted" size={24} />
        </div>
        <p className="text-text-primary font-bold">No booked students found</p>
        <p className="text-text-secondary text-sm mt-1">
          Students with confirmed bookings at this mess will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="bg-background border-b border-border">
              <th className="text-left text-xs font-bold text-text-secondary uppercase tracking-wider px-4 py-3.5 w-10">
                #
              </th>
              <th className="text-left text-xs font-bold text-text-secondary uppercase tracking-wider px-4 py-3.5 min-w-[180px]">
                Student
              </th>
              {/* Breakfast column header with "Mark All" dropdown */}
              <MealColumnHeader
                label="Breakfast"
                mealType="breakfast"
                onApplyStatus={onApplyStatusToAll}
              />
              <MealColumnHeader
                label="Lunch"
                mealType="lunch"
                onApplyStatus={onApplyStatusToAll}
              />
              <MealColumnHeader
                label="Dinner"
                mealType="dinner"
                onApplyStatus={onApplyStatusToAll}
              />
              <th className="text-left text-xs font-bold text-text-secondary uppercase tracking-wider px-4 py-3.5 w-24">
                Status
              </th>
              <th className="text-left text-xs font-bold text-text-secondary uppercase tracking-wider px-4 py-3.5 w-10">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student, index) => {
              const studentIdStr = student.studentId.toString();
              const isDirty = dirtyStudentIds.has(studentIdStr);
              const isLocked = student.lockedForBilling;
              const isNotesExpanded = expandedNotesId === studentIdStr;

              return (
                <tr
                  key={studentIdStr}
                  className={`transition-colors ${
                    isLocked
                      ? 'bg-status-danger/10'
                      : isDirty
                        ? 'bg-amber-500/10'
                        : 'hover:bg-background/80'
                  }`}
                >
                  {/* Row number */}
                  <td className="px-4 py-3 text-sm text-text-muted font-mono">
                    {index + 1}
                  </td>

                  {/* Student info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {student.avatarUrl ? (
                        <img
                          src={student.avatarUrl}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover shrink-0 border border-primary/30"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-primary/20">
                          {student.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-text-primary truncate">
                          {student.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-text-secondary truncate">
                            {student.email}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              PLAN_BADGE_COLORS[student.planType] || 'bg-background text-text-secondary border border-border'
                            }`}
                          >
                            {student.planType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Breakfast */}
                  <td className="px-4 py-3">
                    <MealStatusSelect
                      value={student.breakfast}
                      onChange={(status) => onUpdateMealStatus(studentIdStr, 'breakfast', status)}
                      disabled={isLocked || !student.applicableMeals.includes('breakfast')}
                      mealType="breakfast"
                      studentName={student.name}
                    />
                  </td>

                  {/* Lunch */}
                  <td className="px-4 py-3">
                    <MealStatusSelect
                      value={student.lunch}
                      onChange={(status) => onUpdateMealStatus(studentIdStr, 'lunch', status)}
                      disabled={isLocked || !student.applicableMeals.includes('lunch')}
                      mealType="lunch"
                      studentName={student.name}
                    />
                  </td>

                  {/* Dinner */}
                  <td className="px-4 py-3">
                    <MealStatusSelect
                      value={student.dinner}
                      onChange={(status) => onUpdateMealStatus(studentIdStr, 'dinner', status)}
                      disabled={isLocked || !student.applicableMeals.includes('dinner')}
                      mealType="dinner"
                      studentName={student.name}
                    />
                  </td>

                  {/* Status indicators */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {isLocked ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-status-danger bg-status-danger/10 px-2 py-1 rounded-full border border-status-danger/20">
                          <FaLock size={9} /> Billed
                        </span>
                      ) : student.isMarked ? (
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                          Saved
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-text-secondary bg-background px-2 py-1 rounded-full border border-border">
                          New
                        </span>
                      )}
                      {isDirty && !isLocked && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
                      )}
                    </div>
                  </td>

                  {/* Notes toggle */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedNotesId(isNotesExpanded ? null : studentIdStr)
                      }
                      className={`p-1.5 rounded-lg transition-colors ${
                        student.notes
                          ? 'text-primary bg-primary/10 hover:bg-primary/20'
                          : 'text-text-secondary hover:bg-background'
                      }`}
                      title={student.notes || 'Add notes'}
                    >
                      <FaEdit size={12} />
                    </button>

                    {/* Inline notes editor (expands below the button) */}
                    {isNotesExpanded && (
                      <div className="absolute right-4 mt-1 z-20 bg-surface border border-border rounded-xl shadow-xl p-3 w-64">
                        <label className="text-[11px] font-bold text-text-secondary mb-1 block">
                          Notes for {student.name}
                        </label>
                        <textarea
                          value={student.notes || ''}
                          onChange={(e) => onUpdateNotes(studentIdStr, e.target.value)}
                          disabled={isLocked}
                          maxLength={500}
                          placeholder="Optional notes..."
                          rows={3}
                          className="w-full text-sm bg-background text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none disabled:bg-background/50 disabled:text-text-muted"
                        />
                        <p className="text-[10px] text-text-muted mt-1 text-right">
                          {(student.notes || '').length}/500
                        </p>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * MealColumnHeader — Column header with a "Mark All" dropdown for bulk status assignment.
 */
const MealColumnHeader = ({ label, mealType, onApplyStatus }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <th className="text-left text-xs font-bold text-text-secondary uppercase tracking-wider px-4 py-3.5 w-28">
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded hover:bg-surface border border-transparent hover:border-border transition-colors"
            title={`Mark all ${label}`}
          >
            <FaChevronDown size={8} className="text-text-secondary" />
          </button>
          {isOpen && (
            <>
              {/* Invisible overlay to close dropdown when clicking outside */}
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 top-full mt-1 z-20 bg-surface border border-border rounded-xl shadow-xl py-1 min-w-[120px]">
                <p className="text-[10px] text-text-muted font-bold px-3 py-1 uppercase">
                  Mark All As
                </p>
                {MEAL_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onApplyStatus(mealType, status);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-text-primary hover:bg-background transition-colors capitalize font-medium"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </th>
  );
};

export default AttendanceTable;
