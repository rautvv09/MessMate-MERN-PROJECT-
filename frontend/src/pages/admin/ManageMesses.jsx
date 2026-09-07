import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaFilter,
  FaUtensils,
  FaStar,
  FaMapMarkerAlt,
  FaTrash,
  FaEye,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import DetailModal from '../../components/admin/DetailModal';
import {
  getMesses,
  getMessById,
  updateMessStatus,
  deleteMess,
} from '../../services/adminService';

const ManageMesses = () => {
  const [messes, setMesses] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedMess, setSelectedMess] = useState(null);
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

  const fetchMesses = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await getMesses({
        page,
        limit: 10,
        search: search.trim() || undefined,
        foodType: foodTypeFilter || undefined,
        isActive: activeFilter || undefined,
        isVerified: verifiedFilter || undefined,
      });
      setMesses(data.data.messes);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error('Failed to load mess listings');
    } finally {
      setIsLoading(false);
    }
  }, [search, foodTypeFilter, activeFilter, verifiedFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMesses(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchMesses]);

  // View Details Handler
  const handleViewDetails = async (messId) => {
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    try {
      const { data } = await getMessById(messId);
      setSelectedMess(data.data);
    } catch (error) {
      toast.error('Failed to load mess details');
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (mess) => {
    const newActiveState = !mess.isActive;
    try {
      await updateMessStatus(mess._id, { isActive: newActiveState });
      toast.success(`Mess ${newActiveState ? 'activated' : 'disabled'} successfully`);
      fetchMesses(pagination.page);
    } catch (error) {
      toast.error('Failed to update mess status');
    }
  };

  // Toggle Verification
  const handleToggleVerified = async (mess) => {
    const newVerifiedState = !mess.isVerified;
    try {
      await updateMessStatus(mess._id, { isVerified: newVerifiedState });
      toast.success(`Mess ${newVerifiedState ? 'verified' : 'unverified'} successfully`);
      fetchMesses(pagination.page);
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  // Delete Mess
  const handleDeleteMess = (mess) => {
    setDialogState({
      isOpen: true,
      title: 'Delete Mess Listing',
      message: `Permanently delete ${mess.name} (${mess.city})? Active student subscriptions associated with this mess may be affected.`,
      confirmText: 'Delete Mess',
      isDanger: true,
      action: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteMess(mess._id);
          toast.success('Mess listing deleted successfully');
          fetchMesses(pagination.page);
          setDialogState({ isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete mess');
        } finally {
          setDialogState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  return (
    <AdminLayout
      title="Mess Listings Directory"
      subtitle={`Manage ${pagination.total} dining partners and mess listings across all cities`}
    >
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            <input
              type="text"
              placeholder="Search by mess name, city, address, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full lg:w-auto">
            <select
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
            >
              <option value="">All Diet Types</option>
              <option value="veg">Veg Only</option>
              <option value="non-veg">Non-Veg</option>
              <option value="both">Both</option>
            </select>

            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>

        {/* Messes Table */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <FaSpinner className="animate-spin text-primary text-2xl mx-auto" />
              <p className="text-xs text-text-secondary">Loading mess listings...</p>
            </div>
          ) : messes.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <FaUtensils className="text-3xl text-text-muted mx-auto" />
              <p className="text-sm font-bold text-text-primary">No mess listings found</p>
              <p className="text-xs text-text-secondary">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-background border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Mess Name & City</th>
                    <th className="px-5 py-3.5">Owner</th>
                    <th className="px-5 py-3.5">Price & Diet</th>
                    <th className="px-5 py-3.5">Rating</th>
                    <th className="px-5 py-3.5">Subscribers / Seats</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5">Listing Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {messes.map((mess) => {
                    return (
                      <tr key={mess._id} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="space-y-0.5">
                            <span className="font-extrabold text-text-primary block text-sm">{mess.name}</span>
                            <span className="text-[11px] text-text-secondary flex items-center gap-1">
                              <FaMapMarkerAlt className="text-primary" size={10} /> {mess.city}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-text-primary font-semibold">{mess.ownerId?.name || 'Unknown'}</p>
                          <p className="text-text-secondary text-[10px]">{mess.ownerId?.email}</p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-extrabold text-primary text-xs">₹{mess.pricing?.baseFee}/mo</p>
                          <span className="text-[10px] text-text-secondary capitalize font-medium">{mess.foodType}</span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 font-bold text-amber-500">
                            <FaStar size={11} />
                            <span>{mess.rating?.average || 0}</span>
                            <span className="text-text-muted text-[10px]">({mess.rating?.count || 0})</span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-extrabold text-text-primary">{mess.activeSubscribers || 0}</span>
                          <span className="text-text-secondary text-[10px]"> / {mess.totalSeats} seats</span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleVerified(mess)}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase transition-all flex items-center gap-1 border ${
                              mess.isVerified
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                : 'bg-background text-text-secondary border-border hover:border-primary'
                            }`}
                          >
                            {mess.isVerified ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                            {mess.isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleActive(mess)}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase transition-all flex items-center gap-1.5 border ${
                              mess.isActive
                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                : 'bg-background text-text-secondary border-border hover:border-text-primary'
                            }`}
                          >
                            {mess.isActive ? <FaToggleOn size={13} className="text-emerald-500" /> : <FaToggleOff size={13} />}
                            {mess.isActive ? 'Active' : 'Disabled'}
                          </button>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewDetails(mess._id)}
                              title="View Mess Details & Menu"
                              className="p-1.5 text-text-secondary hover:text-primary hover:bg-background rounded-lg border border-transparent hover:border-border transition-all"
                            >
                              <FaEye size={13} />
                            </button>

                            <button
                              onClick={() => handleDeleteMess(mess)}
                              title="Delete Listing"
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
                  onClick={() => fetchMesses(pagination.page - 1)}
                  className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchMesses(pagination.page + 1)}
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
        title="Mess Listing Details & Menu"
        type="mess"
        data={selectedMess}
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

export default ManageMesses;
