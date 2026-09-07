import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaSearch,
  FaFilter,
  FaStore,
  FaUserCheck,
  FaUserSlash,
  FaTrash,
  FaEye,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import DetailModal from '../../components/admin/DetailModal';
import {
  getOwners,
  getOwnerById,
  updateOwnerStatus,
  deleteOwner,
} from '../../services/adminService';

const ManageOwners = () => {
  const [owners, setOwners] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [selectedOwner, setSelectedOwner] = useState(null);
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

  const fetchOwners = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await getOwners({
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        isVerifiedOwner: verifiedFilter || undefined,
      });
      setOwners(data.data.owners);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error('Failed to load mess owners');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, verifiedFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOwners(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchOwners]);

  // View Details Handler
  const handleViewDetails = async (ownerId) => {
    setIsDetailOpen(true);
    setIsLoadingDetail(true);
    try {
      const { data } = await getOwnerById(ownerId);
      setSelectedOwner(data.data);
    } catch (error) {
      toast.error('Failed to load owner details');
      setIsDetailOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Status Toggle (Suspend / Activate)
  const handleToggleStatus = (owner) => {
    const isCurrentlyActive = owner.status === 'active';
    const newStatus = isCurrentlyActive ? 'suspended' : 'active';

    setDialogState({
      isOpen: true,
      title: isCurrentlyActive ? 'Suspend Mess Owner' : 'Activate Mess Owner',
      message: isCurrentlyActive
        ? `Are you sure you want to suspend ${owner.name}? Their mess listings will become inactive and they will be blocked from accessing the owner dashboard.`
        : `Are you sure you want to reactivate ${owner.name}'s account?`,
      confirmText: isCurrentlyActive ? 'Suspend Account' : 'Activate Account',
      isDanger: isCurrentlyActive,
      action: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await updateOwnerStatus(owner._id, { status: newStatus });
          toast.success(`Owner ${isCurrentlyActive ? 'suspended' : 'activated'} successfully`);
          fetchOwners(pagination.page);
          setDialogState({ isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to update owner status');
        } finally {
          setDialogState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  // Verification Toggle
  const handleToggleVerify = async (owner) => {
    const isVerified = !owner.roleDetails?.isVerifiedOwner;
    try {
      await updateOwnerStatus(owner._id, { isVerifiedOwner: isVerified });
      toast.success(`Owner ${isVerified ? 'verified' : 'unverified'} successfully`);
      fetchOwners(pagination.page);
    } catch (error) {
      toast.error('Failed to update verification status');
    }
  };

  // Delete Owner
  const handleDeleteOwner = (owner) => {
    setDialogState({
      isOpen: true,
      title: 'Delete Mess Owner Account',
      message: `Permanently delete owner ${owner.name} (${owner.email})? This action cannot be undone.`,
      confirmText: 'Delete Owner',
      isDanger: true,
      action: async () => {
        setDialogState((prev) => ({ ...prev, isLoading: true }));
        try {
          await deleteOwner(owner._id);
          toast.success('Owner deleted successfully');
          fetchOwners(pagination.page);
          setDialogState({ isOpen: false });
        } catch (error) {
          toast.error(error.response?.data?.message || 'Failed to delete owner');
        } finally {
          setDialogState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      isLoading: false,
    });
  };

  return (
    <AdminLayout
      title="Mess Owners Directory"
      subtitle={`Manage ${pagination.total} registered mess partners & vendors`}
    >
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
            <input
              type="text"
              placeholder="Search by owner name, business, email, phone, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>

            <select
              value={verifiedFilter}
              onChange={(e) => setVerifiedFilter(e.target.value)}
              className="w-full sm:w-36 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
            >
              <option value="">All Verification</option>
              <option value="true">Verified Only</option>
              <option value="false">Unverified</option>
            </select>
          </div>
        </div>

        {/* Owners Table */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <FaSpinner className="animate-spin text-primary text-2xl mx-auto" />
              <p className="text-xs text-text-secondary">Loading mess owners...</p>
            </div>
          ) : owners.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <FaStore className="text-3xl text-text-muted mx-auto" />
              <p className="text-sm font-bold text-text-primary">No owners found</p>
              <p className="text-xs text-text-secondary">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-background border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Owner / Business</th>
                    <th className="px-5 py-3.5">Contact</th>
                    <th className="px-5 py-3.5">Messes</th>
                    <th className="px-5 py-3.5">Total Seats</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Joined</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {owners.map((owner) => {
                    const isActive = owner.status === 'active';
                    const isVerified = !!owner.roleDetails?.isVerifiedOwner;

                    return (
                      <tr key={owner._id} className="hover:bg-background/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold uppercase text-xs">
                              {owner.name?.[0] || 'O'}
                            </div>
                            <div>
                              <span className="font-bold text-text-primary block">{owner.name}</span>
                              <span className="text-[11px] text-text-secondary font-medium">
                                {owner.roleDetails?.businessName || 'Independent Vendor'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-text-primary font-semibold">{owner.email}</p>
                          <p className="text-text-secondary text-[11px]">{owner.phone || 'No phone'}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-extrabold text-text-primary">{owner.messCount || 0}</span>
                          <span className="text-text-secondary text-[10px] block">
                            ({owner.activeMessCount || 0} active)
                          </span>
                        </td>

                        <td className="px-5 py-4 font-bold text-text-primary">
                          {owner.totalSeats || 0} seats
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleVerify(owner)}
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase transition-all flex items-center gap-1 border ${
                              isVerified
                                ? 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20'
                                : 'bg-background text-text-secondary border-border hover:border-primary'
                            }`}
                          >
                            {isVerified ? <FaCheckCircle size={10} /> : <FaTimesCircle size={10} />}
                            {isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                              isActive
                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                                : 'bg-status-danger/10 text-status-danger border-status-danger/30'
                            }`}
                          >
                            {owner.status || 'active'}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-text-secondary whitespace-nowrap">
                          {new Date(owner.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewDetails(owner._id)}
                              title="View Details & Messes"
                              className="p-1.5 text-text-secondary hover:text-primary hover:bg-background rounded-lg border border-transparent hover:border-border transition-all"
                            >
                              <FaEye size={13} />
                            </button>

                            <button
                              onClick={() => handleToggleStatus(owner)}
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
                              onClick={() => handleDeleteOwner(owner)}
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
                  onClick={() => fetchOwners(pagination.page - 1)}
                  className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchOwners(pagination.page + 1)}
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
        title="Mess Owner Profile & Messes"
        type="owner"
        data={selectedOwner}
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

export default ManageOwners;
