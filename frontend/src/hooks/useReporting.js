import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getRevenueReport,
  getAttendanceReport,
  getStudentReport,
} from '../services/reportingService';

const useReporting = (messId) => {
  const [revenueData, setRevenueData] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [studentData, setStudentData] = useState(null);

  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  const fetchRevenue = useCallback(async (months = 6) => {
    setIsLoadingRevenue(true);
    try {
      const { data } = await getRevenueReport(messId, months);
      setRevenueData(data.data);
    } catch (error) {
      toast.error('Failed to load revenue data');
    } finally {
      setIsLoadingRevenue(false);
    }
  }, [messId]);

  const fetchAttendance = useCallback(async () => {
    setIsLoadingAttendance(true);
    try {
      const { data } = await getAttendanceReport(messId);
      setAttendanceData(data.data);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [messId]);

  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const { data } = await getStudentReport(messId);
      setStudentData(data.data);
    } catch (error) {
      toast.error('Failed to load student data');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [messId]);

  const fetchAll = useCallback(() => {
    fetchRevenue();
    fetchAttendance();
    fetchStudents();
  }, [fetchRevenue, fetchAttendance, fetchStudents]);

  return {
    revenueData,
    attendanceData,
    studentData,
    isLoadingRevenue,
    isLoadingAttendance,
    isLoadingStudents,
    fetchRevenue,
    fetchAttendance,
    fetchStudents,
    fetchAll,
  };
};

export default useReporting;
