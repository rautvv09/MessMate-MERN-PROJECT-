import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUsers, FaRupeeSign, FaChair, FaPlus } from 'react-icons/fa';
import { getDashboardStats, getMyMesses } from '../../services/ownerService';
import StatCard from '../../components/StatCard';

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [messes, setMesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Independent requests — run concurrently, same Promise.all discipline as the backend
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

  if (isLoading) return <p className="text-center py-16 text-gray-400">Loading dashboard...</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
        <Link
          to="/owner/messes/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <FaPlus size={12} /> Add Mess
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Students" value={stats.totalStudents} icon={FaUsers} accent="emerald" />
        <StatCard label="Monthly Income" value={`₹${stats.monthlyIncome.toLocaleString('en-IN')}`} icon={FaRupeeSign} accent="blue" />
        <StatCard label="Available Seats" value={`${stats.availableSeats} / ${stats.totalSeats}`} icon={FaChair} accent="amber" />
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Messes</h2>

      {messes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-400 mb-3">You haven't added any mess yet.</p>
          <Link to="/owner/messes/new" className="text-emerald-600 font-medium hover:underline">
            Add your first mess
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {messes.map((mess) => (
            <Link
              key={mess._id}
              to={`/owner/messes/${mess._id}`}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{mess.name}</p>
                <p className="text-sm text-gray-400">{mess.city} • {mess.totalSeats} seats</p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  mess.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {mess.isActive ? 'Active' : 'Inactive'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;