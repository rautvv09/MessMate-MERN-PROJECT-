import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaFilter,
  FaUser,
  FaUserCheck,
  FaUserSlash,
  FaTrash,
  FaEye,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import DetailModal from '../../components/admin/DetailModal';
import {
  getStudents,
  getStudentById,
  updateStudentStatus,
  deleteStudent,
} from '../../services/adminService';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Confirmation Dialog State
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    isDanger: true,
    action: null,
    isLoading: false,
  });

  const fetchStudents = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await getStudents({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
      });
      setStudents(data.data.students);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchStudents]);

  // View Details Handler
  const handleViewDetails = async (studentId) => {
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    try {
      const { data } = await getStudentById(studentId);
      setSelectedStudent(data.data);
    } catch (error) {
      toast.error('Failed to load student details');
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Status Toggle (Suspend / Activate)
  const handleToggleStatus = (student) => {
    const isCurrentlyActive = student.status === 'active';
    const newStatus = isCurrentlyActive ? 'suspended' : 'active';

    setDialogState({
      isOpen: true,
      title: isCurrentlyActive ? 'Suspend Student' : 'Activate Student',
      message: isCurrentlyActive
        ? `Are you sure you want to suspend ${student.name}? They will be blocked from logging in and accessing their mess subscriptions.`
        : `Are you sure you want to reactivate ${student.name}'s account?`,
      confirmText: isCurrentlyActive ? 'Suspend Account' : 'Activate Account',
      isDanger: isCurrentlyActive,
      action: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await updateStudentStatus(student._id, { status: newStatus });
          toast.success(`Student ${isCurrentlyActive ? 'suspended' : 'activated'} successfully`);
          fetchStudents(pagination.page);
          setDialogState({ isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to update student status');
        } finally {
          setDialogState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  // Delete Student
  const handleDeleteStudent = (student) => {
    setDialogState({
      isOpen: true,
      title: 'Delete Student Account',
      message: `Permanently delete ${student.name} (${student.email})? This action cannot be undone.`,
      confirmText: 'Delete Student',
      isDanger: true,
      action: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteStudent(student._id);
          toast.success('Student deleted successfully');
          fetchStudents(pagination.page);
          setDialogState({ isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete student');
        } finally {
          setDialogState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  return (
    <AdminLayout
      title="Student Directory"
      subtitle={`Manage ${pagination.total} registered student accounts across all universities and cities`}
    >
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            <input
              type="text"
              placeholder="Search by name, email, phone, college, or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FaFilter className="text-text-muted text-xs hidden sm:block" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <FaSpinner className="animate-spin text-primary text-2xl mx-auto" />
              <p className="text-xs text-text-secondary">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <FaUser className="text-3xl text-text-muted mx-auto" />
              <p className="text-sm font-bold text-text-primary">No students found</p>
              <p className="text-xs text-text-secondary">Try adjusting your search criteria or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-background border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">College / City</th>
                    <th className="px-5 py-3.5">Bookings</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student) => {
                    const isActive = student.status === 'active';
                    return (
                      <tr key={student._id} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold uppercase text-xs">
                              {student.name?.[0] || 'S'}
                            </div>
                            <div>
                              <span className="font-bold text-text-primary block">{student.name}</span>
                              <span className="text-[10px] text-text-muted">{student._id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-text-primary font-semibold">{student.email}</p>
                          <p className="text-text-secondary text-[11px]">{student.phone || 'No phone'}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-text-primary font-medium">{student.roleDetails?.college || '—'}</p>
                          <p className="text-text-secondary text-[11px]">{student.roleDetails?.city || '—'}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-extrabold text-primary">{student.totalBookings || 0}</span>
                          <span className="text-text-secondary text-[10px] block">subscriptions</span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : 'bg-status-danger/10 text-status-danger border-status-danger/30'
                            }`}
                          >
                            {student.status || 'active'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-text-secondary whitespace-nowrap">
                          {new Date(student.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewDetails(student._id)}
                              title="View Details"
                              className="p-1.5 text-text-secondary hover:text-primary hover:bg-background rounded-lg border border-transparent hover:border-border transition-all"
                            >
                              <FaEye size={13} />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(student)}
                              title={isActive ? 'Suspend Account' : 'Activate Account'}
                              className={`p-1.5 rounded-lg border border-transparent hover:border-border transition-all ${
                                isActive
                                  ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10'
                                  : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10'
                              }`}
                            >
                              {isActive ? <FaUserSlash size={13} /> : <FaUserCheck size={13} />}
                            </button>

                            <button
                              onClick={() => handleDeleteStudent(student)}
                              title="Delete Account"
                              className="p-1.5 text-status-danger hover:text-red-700 hover:bg-status-danger/10 rounded-lg border border-transparent hover:border-border transition-all"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="px-5 py-4 border-t border-border flex items-center justify-between bg-background text-xs">
              <span className="text-text-secondary">
                Showing page <strong className="text-text-primary">{pagination.page}</strong> of{' '}
                <strong className="text-text-primary">{pagination.totalPages}</strong> ({pagination.total} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => fetchStudents(pagination.page - 1)}
                  className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchStudents(pagination.page + 1)}
                  className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Student Profile & Activity"
        type="student"
        data={selectedStudent}
        isLoading={isLoadingDetail}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false })}
        onConfirm={dialogState.action}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        isDanger={dialogState.isDanger}
        isLoading={dialogState.isLoading}
      />
    </AdminLayout>
  );
};

export default ManageStudents;
