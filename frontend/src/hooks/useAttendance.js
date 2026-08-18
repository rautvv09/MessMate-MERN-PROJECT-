import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { getAttendanceSheet, saveAttendance } from '../services/attendanceService';

/**
 * Custom hook for the Owner Attendance Panel.
 *
 * Manages:
 * - Fetching the attendance sheet for a given messId + date
 * - Local state for meal status edits (before saving)
 * - Dirty-tracking per student (unsaved changes indicator)
 * - Bulk save with optimistic feedback
 * - Computed summary statistics (present/absent/leave counts)
 */
const useAttendance = (messId) => {
  const [students, setStudents] = useState([]);
  const [messInfo, setMessInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Track which students have been modified locally (dirty state)
  const [dirtyStudentIds, setDirtyStudentIds] = useState(new Set());

  // Fetch attendance sheet from the API
  const fetchAttendance = useCallback(
    async (date) => {
      if (!messId) return;

      setIsLoading(true);
      setIsLoaded(false);
      setDirtyStudentIds(new Set());

      try {
        const { data } = await getAttendanceSheet(messId, date || selectedDate);
        const sheet = data.data;

        setMessInfo(sheet.mess);
        setStudents(sheet.students);
        setIsLoaded(true);
      } catch (error) {
        const message =
          error.response?.data?.message || 'Failed to load attendance';
        toast.error(message);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    },
    [messId, selectedDate]
  );

  // Update a single meal status for a single student (local state only)
  const updateMealStatus = useCallback((studentId, mealType, status) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId.toString() !== studentId.toString()) return student;
        return { ...student, [mealType]: status };
      })
    );

    setDirtyStudentIds((prev) => {
      const next = new Set(prev);
      next.add(studentId.toString());
      return next;
    });
  }, []);

  // Update notes for a single student
  const updateNotes = useCallback((studentId, notes) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.studentId.toString() !== studentId.toString()) return student;
        return { ...student, notes };
      })
    );

    setDirtyStudentIds((prev) => {
      const next = new Set(prev);
      next.add(studentId.toString());
      return next;
    });
  }, []);

  // Apply a status to ALL students for a specific meal (bulk action)
  const applyStatusToAll = useCallback((mealType, status) => {
    setStudents((prev) =>
      prev.map((student) => {
        // Skip locked records and skip meals not in the student's plan
        if (student.lockedForBilling) return student;
        if (!student.applicableMeals.includes(mealType)) return student;
        return { ...student, [mealType]: status };
      })
    );

    // Mark all non-locked students as dirty
    setDirtyStudentIds((prev) => {
      const next = new Set(prev);
      students.forEach((student) => {
        if (!student.lockedForBilling && student.applicableMeals.includes(mealType)) {
          next.add(student.studentId.toString());
        }
      });
      return next;
    });
  }, [students]);

  // Mark all applicable meals as "present" for all students
  const markAllPresent = useCallback(() => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.lockedForBilling) return student;
        const updated = { ...student };
        student.applicableMeals.forEach((meal) => {
          updated[meal] = 'present';
        });
        return updated;
      })
    );

    setDirtyStudentIds((prev) => {
      const next = new Set(prev);
      students.forEach((student) => {
        if (!student.lockedForBilling) {
          next.add(student.studentId.toString());
        }
      });
      return next;
    });
  }, [students]);

  // Save all attendance records to the API
  const saveAllAttendance = useCallback(async () => {
    if (students.length === 0) {
      toast.error('No students to save attendance for');
      return;
    }

    // Filter out locked records — they cannot be modified
    const savableStudents = students.filter((s) => !s.lockedForBilling);

    if (savableStudents.length === 0) {
      toast.error('All records are locked (bill already generated)');
      return;
    }

    setIsSaving(true);

    try {
      const records = savableStudents.map((student) => ({
        studentId: student.studentId,
        bookingId: student.bookingId,
        breakfast: student.breakfast,
        lunch: student.lunch,
        dinner: student.dinner,
        notes: student.notes || '',
      }));

      const { data } = await saveAttendance(messId, {
        date: selectedDate,
        records,
      });

      toast.success(data.message || 'Attendance saved successfully');
      setDirtyStudentIds(new Set());

      // Re-fetch to get server-confirmed state (markedAt timestamps, etc.)
      await fetchAttendance(selectedDate);
    } catch (error) {
      const message =
        error.response?.data?.message || 'Failed to save attendance';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }, [students, messId, selectedDate, fetchAttendance]);

  // Handle date change
  const handleDateChange = useCallback(
    (newDate) => {
      if (dirtyStudentIds.size > 0) {
        const proceed = window.confirm(
          'You have unsaved changes. Switching dates will discard them. Continue?'
        );
        if (!proceed) return;
      }
      setSelectedDate(newDate);
      fetchAttendance(newDate);
    },
    [dirtyStudentIds.size, fetchAttendance]
  );

  // Computed summary statistics
  const summary = useMemo(() => {
    const billableStatuses = ['present', 'late'];
    const stats = {
      total: students.length,
      breakfastPresent: 0,
      lunchPresent: 0,
      dinnerPresent: 0,
      onLeave: 0,
      onHoliday: 0,
      totalMarked: 0,
      totalUnmarked: 0,
      lockedCount: 0,
    };

    students.forEach((student) => {
      if (billableStatuses.includes(student.breakfast)) stats.breakfastPresent++;
      if (billableStatuses.includes(student.lunch)) stats.lunchPresent++;
      if (billableStatuses.includes(student.dinner)) stats.dinnerPresent++;

      const isAllLeave =
        student.breakfast === 'leave' &&
        student.lunch === 'leave' &&
        student.dinner === 'leave';
      if (isAllLeave) stats.onLeave++;

      const isAllHoliday =
        student.breakfast === 'holiday' &&
        student.lunch === 'holiday' &&
        student.dinner === 'holiday';
      if (isAllHoliday) stats.onHoliday++;

      if (student.isMarked) stats.totalMarked++;
      else stats.totalUnmarked++;

      if (student.lockedForBilling) stats.lockedCount++;
    });

    return stats;
  }, [students]);

  const hasUnsavedChanges = dirtyStudentIds.size > 0;

  return {
    // State
    students,
    messInfo,
    selectedDate,
    isLoading,
    isSaving,
    isLoaded,
    summary,
    hasUnsavedChanges,
    dirtyStudentIds,

    // Actions
    fetchAttendance,
    handleDateChange,
    updateMealStatus,
    updateNotes,
    applyStatusToAll,
    markAllPresent,
    saveAllAttendance,
  };
};

export default useAttendance;
