import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaReceipt,
  FaEye,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import DetailModal from '../../components/admin/DetailModal';
import { getBookings, getBookingById } from '../../services/adminService';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchBookings = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await getBookings({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        planType: planFilter !== 'all' ? planFilter : undefined,
      });
      setBookings(data.data.bookings);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, planFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookings(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  // View Details Handler
  const handleViewDetails = async (bookingId) => {
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    try {
      const { data } = await getBookingById(bookingId);
      setSelectedBooking(data.data);
    } catch (error) {
      toast.error('Failed to load booking details');
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const statusTabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'waitlisted', label: 'Waitlisted' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  const statusColors = {
    confirmed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    waitlisted: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    cancelled: 'bg-status-danger/10 text-status-danger border-status-danger/30',
    completed: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  };

  return (
    <AdminLayout
      title="Bookings Oversight"
      subtitle={`Monitor all ${pagination.total} dining subscriptions and order requests`}
    >
      <div className="space-y-6">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Plan Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            <input
              type="text"
              placeholder="Search by Booking ID (e.g. MM-2026-00001)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
          >
            <option value="all">All Plan Types</option>
            <option value="Full Day">Full Day</option>
            <option value="Lunch & Dinner">Lunch & Dinner</option>
            <option value="Lunch Only">Lunch Only</option>
            <option value="Dinner Only">Dinner Only</option>
          </select>
        </div>

        {/* Bookings Table */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <FaSpinner className="animate-spin text-primary text-2xl mx-auto" />
              <p className="text-xs text-text-secondary">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <FaReceipt className="text-3xl text-text-muted mx-auto" />
              <p className="text-sm font-bold text-text-primary">No bookings found</p>
              <p className="text-xs text-text-secondary">Try adjusting your search criteria or status filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-background border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Booking Ref</th>
                    <th className="px-5 py-3.5">Student</th>
                    <th className="px-5 py-3.5">Mess & Owner</th>
                    <th className="px-5 py-3.5">Plan & Duration</th>
                    <th className="px-5 py-3.5">Total Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Joining Date</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bookings.map((booking) => {
                    return (
                      <tr key={booking._id} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-4">
                          <span className="font-mono font-extrabold text-primary block">
                            {booking.bookingId}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-text-primary font-bold">{booking.studentId?.name || 'Unknown'}</p>
                          <p className="text-text-secondary text-[11px]">{booking.studentId?.email}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-text-primary font-semibold">{booking.messId?.name || '—'}</p>
                          <p className="text-text-secondary text-[10px]">
                            {booking.messId?.ownerId?.name || booking.messId?.city}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-text-primary block">{booking.planType}</span>
                          <span className="text-text-secondary text-[10px]">
                            {booking.durationMonths} month(s)
                          </span>
                        </td>

                        <td className="px-5 py-4 font-extrabold text-text-primary text-sm font-heading">
                          ₹{booking.priceSnapshot?.totalPayable || 0}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                              statusColors[booking.status] || 'bg-background text-text-secondary'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-text-secondary whitespace-nowrap flex items-center gap-1.5 mt-2">
                          <FaCalendarAlt size={10} className="text-primary" />
                          {new Date(booking.joiningDate).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleViewDetails(booking._id)}
                            title="View Full Booking Breakdown"
                            className="p-1.5 text-text-secondary hover:text-primary hover:bg-background rounded-lg border border-transparent hover:border-border transition-all"
                          >
                            <FaEye size={13} />
                          </button>
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
                  onClick={() => fetchBookings(pagination.page - 1)}
                  className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchBookings(pagination.page + 1)}
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
        title="Booking Overview & Details"
        type="booking"
        data={selectedBooking}
        isLoading={isLoadingDetail}
      />
    </AdminLayout>
  );
};

export default ManageBookings;
