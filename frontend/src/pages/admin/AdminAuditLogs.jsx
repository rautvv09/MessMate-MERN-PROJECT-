import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FaHistory,
  FaFilter,
  FaSpinner,
  FaChevronLeft,
  FaChevronRight,
  FaShieldAlt,
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/AdminLayout';
import { getAuditLogs } from '../../services/adminService';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const { data } = await getAuditLogs({
        page,
        limit: 15,
        targetType: targetTypeFilter || undefined,
        action: actionFilter.trim() || undefined,
      });
      setLogs(data.data.logs);
      setPagination(data.data.pagination);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [targetTypeFilter, actionFilter]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return (
    <AdminLayout
      title="Platform Audit Trail"
      subtitle={`Security and activity trail logging all ${pagination.total} administrative operations`}
    >
      <div className="space-y-6">
        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-surface p-4 rounded-2xl border border-border">
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Filter by action keyword (e.g. SUSPENDED, DELETED, VERIFIED)..."
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-primary transition-all"
            />
          </div>

          <select
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-background border border-border rounded-xl text-xs font-semibold text-text-primary focus:outline-hidden focus:border-primary"
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="MessListing">MessListing</option>
            <option value="Booking">Booking</option>
            <option value="Review">Review</option>
          </select>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <FaSpinner className="animate-spin text-primary text-2xl mx-auto" />
              <p className="text-xs text-text-secondary">Loading audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <FaHistory className="text-3xl text-text-muted mx-auto" />
              <p className="text-sm font-bold text-text-primary">No audit logs recorded</p>
              <p className="text-xs text-text-secondary">System actions will automatically appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-background border-b border-border text-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5">Admin</th>
                    <th className="px-5 py-3.5">Action</th>
                    <th className="px-5 py-3.5">Target Entity</th>
                    <th className="px-5 py-3.5">Target Name / ID</th>
                    <th className="px-5 py-3.5">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-background/50 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-text-secondary font-mono">
                        {new Date(log.createdAt).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'medium',
                        })}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-bold text-text-primary block">{log.adminId?.name || 'Admin'}</span>
                        <span className="text-[10px] text-text-secondary">{log.adminId?.email}</span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-bold text-text-primary">
                        {log.targetType}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-bold text-text-primary block">{log.targetName || '—'}</span>
                        {log.targetId && (
                          <span className="text-[10px] text-text-muted font-mono">{String(log.targetId)}</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-text-secondary font-mono text-[11px]">
                        {log.ipAddress || '—'}
                      </td>
                    </tr>
                  ))}
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
                  onClick={() => fetchLogs(pagination.page - 1)}
                  className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
                >
                  <FaChevronLeft size={10} />
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchLogs(pagination.page + 1)}
                  className="p-2 rounded-xl bg-surface border border-border text-text-primary hover:border-primary disabled:opacity-40 disabled:hover:border-border transition-all"
                >
                  <FaChevronRight size={10} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
