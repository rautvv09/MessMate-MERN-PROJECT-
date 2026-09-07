import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUsers,
  FaStore,
  FaUtensils,
  FaReceipt,
  FaStar,
  FaUserCheck,
  FaUserSlash,
  FaArrowRight,
  FaHistory,
  FaChartLine,
} from 'react-icons/fa';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/StatCard';
import { getDashboardStats } from '../../services/adminService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getDashboardStats();
        setStats(data.data);
      } catch (error) {
        toast.error('Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <AdminLayout title="Platform Command Center" subtitle="Real-time ecosystem metrics & administration">
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-text-secondary">Loading Platform Statistics...</p>
        </div>
      </AdminLayout>
    );
  }

  // Prepare chart data
  const bookingPieData = [
    { name: 'Confirmed', value: stats?.bookings?.confirmed || 0, color: '#10b981' },
    { name: 'Waitlisted', value: stats?.bookings?.waitlisted || 0, color: '#f59e0b' },
    { name: 'Cancelled', value: stats?.bookings?.cancelled || 0, color: '#ef4444' },
    { name: 'Completed', value: stats?.bookings?.completed || 0, color: '#3b82f6' },
  ].filter((item) => item.value > 0);

  const ratingBarData = [
    { star: '5 ★', count: stats?.reviews?.ratingCounts?.['5'] || 0 },
    { star: '4 ★', count: stats?.reviews?.ratingCounts?.['4'] || 0 },
    { star: '3 ★', count: stats?.reviews?.ratingCounts?.['3'] || 0 },
    { star: '2 ★', count: stats?.reviews?.ratingCounts?.['2'] || 0 },
    { star: '1 ★', count: stats?.reviews?.ratingCounts?.['1'] || 0 },
  ];

  const userDistributionData = [
    { role: 'Students', count: stats?.users?.totalStudents || 0 },
    { role: 'Mess Owners', count: stats?.users?.totalOwners || 0 },
    { role: 'Admins', count: stats?.users?.totalAdmins || 0 },
  ];

  return (
    <AdminLayout
      title="Platform Command Center"
      subtitle="Complete real-time oversight of MessMate students, mess providers, bookings, and revenue"
    >
      <div className="space-y-8">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard
            label="Total Students"
            value={stats?.users?.totalStudents || 0}
            icon={FaUsers}
            accent="emerald"
            subtext={`${stats?.users?.activeUsers || 0} Active`}
          />
          <StatCard
            label="Mess Owners"
            value={stats?.users?.totalOwners || 0}
            icon={FaStore}
            accent="blue"
            subtext="Mess Operators"
          />
          <StatCard
            label="Mess Listings"
            value={stats?.messes?.totalMesses || 0}
            icon={FaUtensils}
            accent="amber"
            subtext={`${stats?.messes?.activeMesses || 0} Active`}
          />
          <StatCard
            label="Total Bookings"
            value={stats?.bookings?.total || 0}
            icon={FaReceipt}
            accent="purple"
            subtext={`${stats?.bookings?.confirmed || 0} Confirmed`}
          />
          <StatCard
            label="Gross Volume"
            value={`₹${((stats?.bookings?.totalVolume || 0) / 1000).toFixed(1)}k`}
            icon={FaChartLine}
            accent="emerald"
            subtext="Total Transacted"
          />
          <StatCard
            label="Platform Reviews"
            value={stats?.reviews?.totalReviews || 0}
            icon={FaStar}
            accent="amber"
            subtext={`Avg ${stats?.reviews?.avgRating || 0} ★`}
          />
        </div>

        {/* Quick Management Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/admin/students"
            className="bg-surface border border-border p-3.5 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FaUsers size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Students</span>
              <span className="text-[10px] text-text-secondary">Directory & Status</span>
            </div>
          </Link>

          <Link
            to="/admin/owners"
            className="bg-surface border border-border p-3.5 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <FaStore size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Owners</span>
              <span className="text-[10px] text-text-secondary">Verification & Messes</span>
            </div>
          </Link>

          <Link
            to="/admin/messes"
            className="bg-surface border border-border p-3.5 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <FaUtensils size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Listings</span>
              <span className="text-[10px] text-text-secondary">Approve & Manage</span>
            </div>
          </Link>

          <Link
            to="/admin/bookings"
            className="bg-surface border border-border p-3.5 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <FaReceipt size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Bookings</span>
              <span className="text-[10px] text-text-secondary">Monitor Orders</span>
            </div>
          </Link>

          <Link
            to="/admin/reviews"
            className="bg-surface border border-border p-3.5 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <FaStar size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Reviews</span>
              <span className="text-[10px] text-text-secondary">Moderation</span>
            </div>
          </Link>

          <Link
            to="/admin/audit-logs"
            className="bg-surface border border-border p-3.5 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
          >
            <div className="w-9 h-9 rounded-xl bg-text-secondary/10 text-text-secondary flex items-center justify-center font-bold">
              <FaHistory size={14} />
            </div>
            <div>
              <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Audit Trail</span>
              <span className="text-[10px] text-text-secondary">Security Logs</span>
            </div>
          </Link>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Monthly Booking & Growth Trends
              </h3>
              <span className="text-[10px] font-bold text-text-secondary uppercase">Last 6 Months</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.trends || []}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={11} />
                  <YAxis stroke="currentColor" opacity={0.5} fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface, #ffffff)',
                      borderColor: 'var(--color-border, #e5e7eb)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                  />
                  <Area
                    type="monotone"
                    dataKey="students"
                    name="New Students"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                  />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bookings Status Distribution */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Bookings by Status
              </h3>
              <span className="text-[10px] font-bold text-text-secondary uppercase">
                {stats?.bookings?.total || 0} Total Orders
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="h-64 w-full">
                {bookingPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={bookingPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {bookingPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--color-surface, #ffffff)',
                          borderColor: 'var(--color-border, #e5e7eb)',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-text-secondary">
                    No bookings logged yet
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Confirmed
                  </span>
                  <span className="font-extrabold text-text-primary">{stats?.bookings?.confirmed || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Waitlisted
                  </span>
                  <span className="font-extrabold text-text-primary">{stats?.bookings?.waitlisted || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-danger" /> Cancelled
                  </span>
                  <span className="font-extrabold text-text-primary">{stats?.bookings?.cancelled || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-background border border-border">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Completed
                  </span>
                  <span className="font-extrabold text-text-primary">{stats?.bookings?.completed || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tables Row: Recent Bookings & Audit Trail Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Recent Bookings
              </h3>
              <Link to="/admin/bookings" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View all <FaArrowRight size={10} />
              </Link>
            </div>

            {stats?.recentBookings?.length === 0 ? (
              <p className="text-xs text-text-secondary py-8 text-center">No bookings logged yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {stats?.recentBookings?.map((b) => (
                  <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-primary">{b.bookingId}</span>
                      <p className="font-semibold text-text-primary mt-0.5">{b.studentId?.name || 'Unknown'}</p>
                      <p className="text-[10px] text-text-secondary">{b.messId?.name} • {b.messId?.city}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-text-primary">₹{b.priceSnapshot?.totalPayable || 0}</span>
                      <span
                        className={`block text-[10px] font-bold uppercase mt-0.5 ${
                          b.status === 'confirmed'
                            ? 'text-emerald-500'
                            : b.status === 'cancelled'
                            ? 'text-status-danger'
                            : 'text-amber-500'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Administrative Logs */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-base text-text-primary">
                Admin Activity Trail
              </h3>
              <Link to="/admin/audit-logs" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View all <FaArrowRight size={10} />
              </Link>
            </div>

            {stats?.recentLogs?.length === 0 ? (
              <p className="text-xs text-text-secondary py-8 text-center">No administrative actions logged yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {stats?.recentLogs?.map((log) => (
                  <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{log.adminId?.name || 'Admin'}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-primary/10 text-primary font-mono font-bold">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-secondary">
                        Target: <span className="text-text-primary font-semibold">{log.targetName || log.targetType}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
