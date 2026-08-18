import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaUserGraduate, FaEnvelope, FaPhone, FaUniversity, FaCalendarAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { getMessStudents, getStudentAttendanceForOwner } from '../services/ownerService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const OwnerStudentDirectory = ({ messId }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

  useEffect(() => {
    if (messId) fetchStudents();
  }, [messId]);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const { data } = await getMessStudents(messId);
      setStudents(data.data.students || []);
    } catch (error) {
      toast.error('Could not load student directory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAttendanceModal = (student) => {
    setSelectedStudent(student);
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth() + 1);
    fetchStudentAttendance(student._id, now.getFullYear(), now.getMonth() + 1);
  };

  const fetchStudentAttendance = async (studentId, year, month) => {
    setIsLoadingAttendance(true);
    try {
      const { data } = await getStudentAttendanceForOwner(messId, studentId, year, month);
      setAttendanceRecords(data.data.records || []);
    } catch (error) {
      toast.error('Could not load attendance details');
    } finally {
      setIsLoadingAttendance(false);
    }
  };

  const handleMonthYearChange = (year, month) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    if (selectedStudent) {
      fetchStudentAttendance(selectedStudent._id, year, month);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();

  const getAttendanceMap = () => {
    const map = {};
    attendanceRecords.forEach((rec) => {
      const dateObj = new Date(rec.date);
      const dayNum = dateObj.getDate();
      map[dayNum] = rec;
    });
    return map;
  };

  const calculateAttendanceSummary = () => {
    let presentCount = 0;
    let absentCount = 0;
    let totalMealsTaken = 0;

    attendanceRecords.forEach((rec) => {
      const b = rec.breakfast?.status === 'present';
      const l = rec.lunch?.status === 'present';
      const d = rec.dinner?.status === 'present';

      if (b || l || d) {
        presentCount++;
      } else {
        absentCount++;
      }

      if (b) totalMealsTaken++;
      if (l) totalMealsTaken++;
      if (d) totalMealsTaken++;
    });

    const estimatedBill = totalMealsTaken * 65;

    return { presentCount, absentCount, totalMealsTaken, estimatedBill };
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-text-secondary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Loading Student Directory...</p>
      </div>
    );
  }

  const attendanceMap = getAttendanceMap();
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const summary = calculateAttendanceSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-extrabold font-heading text-text-primary text-xl">
            Enrolled Students ({students.length})
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Registered students currently subscribing to this mess location.
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-3xl border border-dashed border-border space-y-2">
          <FaUserGraduate className="mx-auto text-4xl text-text-muted" />
          <p className="text-text-primary font-bold text-base">No Students Enrolled Yet</p>
          <p className="text-xs text-text-secondary">Confirmed student subscriptions will automatically populate here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {students.map((student) => (
            <div
              key={student._id}
              className="bg-surface border border-border rounded-3xl p-6 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {student.avatarUrl ? (
                    <img src={student.avatarUrl} alt={student.name} className="w-14 h-14 rounded-2xl object-cover border border-border" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xl">
                      {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="font-extrabold font-heading text-text-primary text-lg">{student.name}</h4>
                    <span className="inline-block text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                      {student.planType || 'Monthly'} Member
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-text-secondary bg-background p-4 rounded-2xl border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <FaEnvelope className="text-primary" />
                    <span className="font-medium text-text-primary">{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaPhone className="text-primary" />
                    <span className="font-medium text-text-primary">{student.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FaUniversity className="text-primary" />
                    <span className="font-bold text-text-primary">{student.collegeName || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleOpenAttendanceModal(student)}
                className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold py-3 rounded-2xl transition-all border border-primary/20"
              >
                <FaCalendarAlt /> View Attendance Sheet & Monthly Bill
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Attendance & Monthly Bill Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-border relative animate-in fade-in zoom-in-95 duration-150 space-y-6">
            <button
              onClick={() => setSelectedStudent(null)}
              className="absolute top-5 right-5 text-text-secondary hover:text-text-primary p-2 rounded-full hover:bg-background transition-colors"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-4 pb-4 border-b border-border">
              {selectedStudent.avatarUrl ? (
                <img src={selectedStudent.avatarUrl} alt={selectedStudent.name} className="w-12 h-12 rounded-2xl object-cover border border-border" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-lg">
                  {selectedStudent.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="font-extrabold font-heading text-text-primary text-xl">{selectedStudent.name}</h3>
                <p className="text-xs text-text-secondary">{selectedStudent.collegeName} • {selectedStudent.email}</p>
              </div>
            </div>

            {/* Summary Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">Present Days</p>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">{summary.presentCount}</p>
              </div>
              <div className="bg-status-danger/10 border border-status-danger/20 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-extrabold text-status-danger uppercase">Absent Days</p>
                <p className="text-2xl font-extrabold text-status-danger mt-0.5">{summary.absentCount}</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center">
                <p className="text-[10px] font-extrabold text-primary uppercase">Est. Monthly Bill</p>
                <p className="text-2xl font-extrabold text-primary mt-0.5">₹{summary.estimatedBill.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {/* Month & Year Selectors */}
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-text-primary text-xs uppercase tracking-wider flex items-center gap-2">
                <FaCalendarAlt className="text-primary" /> Attendance Records
              </h4>
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthYearChange(selectedYear, Number(e.target.value))}
                  className="text-xs font-bold border border-border rounded-xl px-3 py-1.5 bg-background text-text-primary"
                >
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>{m}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedMonth)}
                  className="text-xs font-bold border border-border rounded-xl px-3 py-1.5 bg-background text-text-primary"
                >
                  {[2025, 2026, 2027].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calendar Grid */}
            {isLoadingAttendance ? (
              <div className="py-12 text-center text-text-secondary text-xs">Loading attendance records...</div>
            ) : (
              <div className="grid grid-cols-7 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const record = attendanceMap[dayNum];

                  let bStatus = record?.breakfast?.status;
                  let lStatus = record?.lunch?.status;
                  let dStatus = record?.dinner?.status;

                  const isPresent = bStatus === 'present' || lStatus === 'present' || dStatus === 'present';
                  const isAbsent = bStatus === 'absent' && lStatus === 'absent' && dStatus === 'absent';

                  let statusColor = 'bg-background border-border text-text-muted';
                  if (record) {
                    if (isPresent) statusColor = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300';
                    else if (isAbsent) statusColor = 'bg-status-danger/10 border-status-danger/30 text-status-danger';
                  }

                  return (
                    <div
                      key={dayNum}
                      className={`p-2 border rounded-2xl flex flex-col justify-between items-center text-center text-xs transition-all ${statusColor}`}
                    >
                      <span className="font-extrabold text-xs">{dayNum}</span>
                      <div className="mt-1 flex flex-col gap-0.5 text-[9px] w-full font-bold">
                        <span className={`px-1 rounded ${bStatus === 'present' ? 'bg-emerald-500 text-white' : 'text-text-muted'}`}>
                          B: {bStatus ? bStatus.charAt(0).toUpperCase() : '-'}
                        </span>
                        <span className={`px-1 rounded ${lStatus === 'present' ? 'bg-emerald-500 text-white' : 'text-text-muted'}`}>
                          L: {lStatus ? lStatus.charAt(0).toUpperCase() : '-'}
                        </span>
                        <span className={`px-1 rounded ${dStatus === 'present' ? 'bg-emerald-500 text-white' : 'text-text-muted'}`}>
                          D: {dStatus ? dStatus.charAt(0).toUpperCase() : '-'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerStudentDirectory;
