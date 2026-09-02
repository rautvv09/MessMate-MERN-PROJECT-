import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  getMyAttendanceBookings,
  getMonthlyStats,
  getMonthlyCalendar,
} from '../services/studentAttendanceService';

/**
 * Custom hook for the Student Attendance Dashboard.
 *
 * Manages:
 * - Loading the student's active bookings (mess selector)
 * - Fetching monthly statistics and calendar data
 * - Month/year navigation
 * - Computed current month summary
 */
const useStudentAttendance = () => {
  const now = new Date();

  const [bookings, setBookings] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [stats, setStats] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Fetch student's active bookings
  const fetchBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const { data } = await getMyAttendanceBookings();
      const fetched = data?.data?.bookings || [];
      setBookings(fetched);

      if (fetched.length > 0) {
        setSelectedBookingId((prev) => prev || fetched[0].bookingId);
      }

      return fetched;
    } catch (error) {
      console.error('Failed to load student bookings:', error);
      setBookings([]);
      return [];
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // Fetch monthly stats + calendar for the selected booking/month
  const fetchMonthlyData = useCallback(
    async (bookingId, year, month) => {
      const bid = bookingId || selectedBookingId;
      const y = year || selectedYear;
      const m = month || selectedMonth;

      if (!bid) return;

      setIsLoadingData(true);
      try {
        const [statsRes, calendarRes] = await Promise.all([
          getMonthlyStats(bid, y, m),
          getMonthlyCalendar(bid, y, m),
        ]);

        setStats(statsRes.data?.data || null);
        setCalendarDays(calendarRes.data?.data?.days || []);
      } catch (error) {
        console.error('Failed to load monthly attendance data:', error);
        const message =
          error.response?.data?.message || 'Failed to load attendance data';
        toast.error(message);
        setStats(null);
        setCalendarDays([]);
      } finally {
        setIsLoadingData(false);
      }
    },
    [selectedBookingId, selectedYear, selectedMonth]
  );

  // Handle booking selection change
  const handleBookingChange = useCallback(
    (bookingId) => {
      setSelectedBookingId(bookingId);
      fetchMonthlyData(bookingId, selectedYear, selectedMonth);
    },
    [selectedYear, selectedMonth, fetchMonthlyData]
  );

  // Navigate to the previous month
  const goToPreviousMonth = useCallback(() => {
    let newMonth = selectedMonth - 1;
    let newYear = selectedYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    fetchMonthlyData(selectedBookingId, newYear, newMonth);
  }, [selectedMonth, selectedYear, selectedBookingId, fetchMonthlyData]);

  // Navigate to the next month
  const goToNextMonth = useCallback(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let newMonth = selectedMonth + 1;
    let newYear = selectedYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    // Don't navigate past the current month
    if (newYear > currentYear || (newYear === currentYear && newMonth > currentMonth)) {
      return;
    }

    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
    fetchMonthlyData(selectedBookingId, newYear, newMonth);
  }, [selectedMonth, selectedYear, selectedBookingId, fetchMonthlyData]);

  // Can navigate forward?
  const canGoNext = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let nextMonth = selectedMonth + 1;
    let nextYear = selectedYear;
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    return nextYear < currentYear || (nextYear === currentYear && nextMonth <= currentMonth);
  }, [selectedMonth, selectedYear]);

  // Selected booking details
  const selectedBooking = useMemo(
    () => bookings.find((b) => b.bookingId === selectedBookingId),
    [bookings, selectedBookingId]
  );

  // Month name for display
  const monthName = useMemo(() => {
    const d = new Date(selectedYear, selectedMonth - 1);
    return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  }, [selectedYear, selectedMonth]);

  return {
    // State
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

    // Actions
    fetchBookings,
    fetchMonthlyData,
    handleBookingChange,
    goToPreviousMonth,
    goToNextMonth,
  };
};

export default useStudentAttendance;
