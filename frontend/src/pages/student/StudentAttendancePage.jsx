import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaClipboardList, FaSpinner, FaExclamationCircle, FaReceipt, FaCalendarCheck } from 'react-icons/fa';
import useStudentAttendance from '../../hooks/useStudentAttendance';
import AttendanceCalendar from '../../components/AttendanceCalendar';
import AttendanceStatsGrid from '../../components/AttendanceStatsGrid';
import MonthSummaryCard from '../../components/MonthSummaryCard';

const StudentAttendancePage = () => {
  const {
    bookings,
    selectedBookingId,
    selectedBooking,
    selectedYear,
    selectedMonth,
    monthName,
    stats,
    calendarDays,
    isLoadingBookings,
    isLoadingData,
    canGoNext,
    fetchBookings,
    fetchMonthlyData,
    handleBookingChange,
    goToPreviousMonth,
    goToNextMonth,
  } = useStudentAttendance();

  useEffect(() => {
    const init = async () => {
      await fetchBookings();
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedBookingId) {
      fetchMonthlyData(selectedBookingId, selectedYear, selectedMonth);
    }
  }, [selectedBookingId, selectedYear, selectedMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoadingBookings) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-text-secondary">Loading Attendance Portal...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
          <FaExclamationCircle />
        </div>
        <h2 className="text-xl font-bold font-heading text-text-primary">No Active Mess Subscription</h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          You need an active mess booking to mark attendance and generate monthly bills. Browse nearby messes and subscribe to get started.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-6 py-3 rounded-full shadow-md transition-all"
        >
          EXPLORE MESSES
        </Link>
      </div>
    );
  }

  const handleMarkAttendance = async (dateStr, status) => {
    try {
      const { markStudentAttendance } = await import('../../services/studentAttendanceService');
      await markStudentAttendance({
        bookingId: selectedBookingId,
        date: dateStr,
        status,
      });
      toast.success(`Attendance logged as ${status.toUpperCase()}!`);
      fetchMonthlyData(selectedBookingId, selectedYear, selectedMonth);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save attendance');
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FaCalendarCheck size={20} />
          </div>
          <div>
            <span className="text-editorial-sub">DAILY CHECK-INS</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-0.5">My Attendance</h1>
          </div>
        </div>

        {/* Mess Selector */}
        {bookings.length > 1 ? (
          <select
            value={selectedBookingId}
            onChange={(e) => handleBookingChange(e.target.value)}
            className="px-4 py-3 border border-border rounded-2xl text-xs font-bold text-text-primary bg-surface focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
          >
            {bookings.map((b) => (
              <option key={b.bookingId} value={b.bookingId}>
                {b.messName} — {b.planType}
              </option>
            ))}
          </select>
        ) : (
          selectedBooking && (
            <div className="bg-surface border border-border px-4 py-2.5 rounded-2xl text-xs font-semibold text-text-secondary shadow-xs">
              Subscribed Mess: <span className="text-primary font-bold">{selectedBooking.messName}</span> ({selectedBooking.planType})
            </div>
          )
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Month Summary Card */}
        <div className="lg:col-span-5">
          <MonthSummaryCard
            stats={stats}
            monthName={monthName}
            planType={selectedBooking?.planType}
          />
        </div>

        {/* Right: Interactive Calendar */}
        <div className="lg:col-span-7">
          <AttendanceCalendar
            calendarDays={calendarDays}
            year={selectedYear}
            month={selectedMonth}
            monthName={monthName}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            canGoNext={canGoNext}
            isLoading={isLoadingData}
            onMarkAttendance={handleMarkAttendance}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h2 className="text-xl font-bold font-heading text-text-primary">
          Monthly Attendance Metrics — {monthName}
        </h2>
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AttendanceStatsGrid stats={stats} />
        )}
      </div>
    </div>
  );
};

export default StudentAttendancePage;
