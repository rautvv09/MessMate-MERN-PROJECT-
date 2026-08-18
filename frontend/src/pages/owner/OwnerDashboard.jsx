import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUsers, FaRupeeSign, FaChair, FaPlus, FaUtensils, FaCalendarCheck, FaReceipt, FaChartBar, FaArrowRight, FaStore } from 'react-icons/fa';
import { getDashboardStats, getMyMesses } from '../../services/ownerService';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [messes, setMesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, messesRes] = await Promise.all([
          getDashboardStats(),
          getMyMesses(),
        ]);
        setStats(statsRes.data.data);
        setMesses(messesRes.data.data.messes);
      } catch (error) {
        toast.error('Could not load your dashboard.');
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-text-secondary">Loading Owner Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-editorial-sub flex items-center gap-1.5">
            <FaStore className="text-primary" /> OWNER COMMAND CENTER
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-primary mt-1">
            Welcome, {user?.name?.split(' ')[0] || 'Owner'}! 🏪
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Manage your mess listings, track active student subscriptions, and monitor monthly revenues.
          </p>
        </div>

        {/* Quick Action Button */}
        <Link
          to="/owner/messes/new"
          className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <FaPlus size={12} /> ADD NEW MESS
        </Link>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/owner/attendance"
          className="bg-surface border border-border p-4 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <FaCalendarCheck size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Attendance</span>
            <span className="text-[10px] text-text-secondary">Daily Check-ins</span>
          </div>
        </Link>

        <Link
          to="/owner/students"
          className="bg-surface border border-border p-4 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <FaUsers size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Students</span>
            <span className="text-[10px] text-text-secondary">Student Directory</span>
          </div>
        </Link>

        <Link
          to="/owner/billing"
          className="bg-surface border border-border p-4 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <FaReceipt size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Billing</span>
            <span className="text-[10px] text-text-secondary">Bills & Payments</span>
          </div>
        </Link>

        <Link
          to="/owner/reports"
          className="bg-surface border border-border p-4 rounded-2xl hover:border-primary/50 transition-all flex items-center gap-3 group shadow-xs"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <FaChartBar size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors block">Reports</span>
            <span className="text-[10px] text-text-secondary">Revenue & CSV</span>
          </div>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          label="Total Active Students"
          value={stats?.totalStudents || 0}
          icon={FaUsers}
          accent="emerald"
          subtext="Currently enrolled across all messes"
        />
        <StatCard
          label="Estimated Monthly Income"
          value={`₹${(stats?.monthlyIncome || 0).toLocaleString('en-IN')}`}
          icon={FaRupeeSign}
          accent="blue"
          subtext="Calculated from active subscriptions"
        />
        <StatCard
          label="Available Seat Capacity"
          value={`${stats?.availableSeats || 0} / ${stats?.totalSeats || 0}`}
          icon={FaChair}
          accent="amber"
          subtext="Remaining open dining seats"
        />
      </div>

      {/* Mess Listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-text-primary">
            Your Mess Listings ({messes.length})
          </h2>
        </div>

        {messes.length === 0 ? (
          <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto">
            <FaUtensils className="text-4xl text-text-muted mx-auto" />
            <p className="text-xs text-text-secondary">You haven't listed any mess yet.</p>
            <Link
              to="/owner/messes/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-dark transition-all"
            >
              <FaPlus size={10} /> Add Your First Mess
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {messes.map((mess) => (
              <Link
                key={mess._id}
                to={`/owner/messes/${mess._id}`}
                className="bg-surface border border-border rounded-3xl p-6 hover:border-primary/50 transition-all flex items-center justify-between group shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-extrabold text-lg text-text-primary group-hover:text-primary transition-colors">
                      {mess.name}
                    </h3>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        mess.isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-border text-text-secondary'
                      }`}
                    >
                      {mess.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary">
                    {mess.city} • <span className="font-semibold text-text-primary">{mess.totalSeats} Total Seats</span>
                  </p>
                </div>

                <div className="w-10 h-10 rounded-full bg-background text-text-secondary group-hover:text-primary group-hover:bg-primary/10 flex items-center justify-center transition-all">
                  <FaArrowRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;