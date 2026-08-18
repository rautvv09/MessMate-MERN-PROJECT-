import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaCalendarDay,
  FaCheckDouble,
  FaSave,
  FaSpinner,
  FaExclamationTriangle,
  FaUtensils,
} from 'react-icons/fa';
import useAttendance from '../../hooks/useAttendance';
import AttendanceSummaryCards from '../../components/AttendanceSummaryCards';
import AttendanceTable from '../../components/AttendanceTable';
import { getMyMesses } from '../../services/ownerService';

const AttendancePage = () => {
  const { messId: paramMessId } = useParams();
  const [activeMessId, setActiveMessId] = useState(paramMessId || '');
  const [messes, setMesses] = useState([]);
  const [isResolvingMess, setIsResolvingMess] = useState(!paramMessId);

  useEffect(() => {
    if (!paramMessId) {
      const loadOwnerMesses = async () => {
        try {
          const { data } = await getMyMesses();
          const list = data.data.messes || [];
          setMesses(list);
          if (list.length > 0) setActiveMessId(list[0]._id);
        } catch (err) {
          toast.error('Could not load mess list');
        } finally {
          setIsResolvingMess(false);
        }
      };
      loadOwnerMesses();
    }
  }, [paramMessId]);

  if (isResolvingMess) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-text-secondary">Loading Attendance Sheet...</p>
      </div>
    );
  }

  if (!activeMessId && !isResolvingMess) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 max-w-lg mx-auto text-center space-y-4">
        <FaCalendarDay className="mx-auto text-4xl text-primary" />
        <h2 className="text-xl font-bold font-heading text-text-primary">No Active Mess Found</h2>
        <p className="text-xs text-text-secondary">Create a mess listing to track daily attendance.</p>
        <Link to="/owner/messes/new" className="inline-block bg-primary text-white text-xs font-bold px-6 py-3 rounded-full">
          Add Mess
        </Link>
      </div>
    );
  }

  return <AttendancePageContent messId={activeMessId} messes={messes} onSelectMess={setActiveMessId} />;
};

const AttendancePageContent = ({ messId, messes, onSelectMess }) => {
  const {
    students,
    messInfo,
    selectedDate,
    isLoading,
    isSaving,
    isLoaded,
    summary,
    hasUnsavedChanges,
    dirtyStudentIds,
    fetchAttendance,
    handleDateChange,
    updateMealStatus,
    updateNotes,
    applyStatusToAll,
    markAllPresent,
    saveAllAttendance,
  } = useAttendance(messId);

  useEffect(() => {
    fetchAttendance();
  }, [messId, fetchAttendance]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const formatDisplayDate = (dateStr) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-6 border-b border-border pb-6">
        <Link
          to="/owner/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-3"
        >
          <FaArrowLeft size={10} /> Back to Dashboard
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-editorial-sub">DAILY ATTENDANCE</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-0.5">
              Meal Attendance Sheet
            </h1>
            {messInfo && <p className="text-xs text-text-secondary mt-1">{messInfo.name}</p>}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {messes.length > 1 && (
              <select
                value={messId}
                onChange={(e) => onSelectMess(e.target.value)}
                className="px-3 py-2 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary"
              >
                {messes.map((m) => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
            )}

            <div className="relative">
              <FaCalendarDay className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={12} />
              <input
                type="date"
                value={selectedDate}
                max={todayStr}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-9 pr-3 py-2 border border-border rounded-xl text-xs font-bold text-text-primary bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <span className="text-xs text-text-secondary hidden sm:inline font-medium">
              {formatDisplayDate(selectedDate)}
            </span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && isLoaded && (
        <>
          <div className="mb-6">
            <AttendanceSummaryCards summary={summary} />
          </div>

          {students.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={markAllPresent}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-colors"
                >
                  <FaCheckDouble size={12} />
                  Mark All Present
                </button>

                {hasUnsavedChanges && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <FaExclamationTriangle size={10} />
                    {dirtyStudentIds.size} unsaved
                  </span>
                )}
              </div>

              <button
                onClick={saveAllAttendance}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl text-white bg-primary hover:bg-primary-dark shadow-md transition-all disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" size={12} />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave size={12} />
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          )}

          <AttendanceTable
            students={students}
            dirtyStudentIds={dirtyStudentIds}
            onUpdateMealStatus={updateMealStatus}
            onUpdateNotes={updateNotes}
            onApplyStatusToAll={applyStatusToAll}
          />
        </>
      )}
    </div>
  );
};

export default AttendancePage;
