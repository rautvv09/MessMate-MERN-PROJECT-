import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUserGraduate, FaStore, FaArrowLeft, FaUtensils } from 'react-icons/fa';
import { getMyMesses } from '../../services/ownerService';
import OwnerStudentDirectory from '../../components/OwnerStudentDirectory';

const StudentsPage = () => {
  const [messes, setMesses] = useState([]);
  const [selectedMessId, setSelectedMessId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerMesses = async () => {
      setIsLoading(true);
      try {
        const { data } = await getMyMesses();
        const messList = data.data.messes || [];
        setMesses(messList);
        if (messList.length > 0) {
          setSelectedMessId(messList[0]._id);
        }
      } catch (error) {
        toast.error('Could not load mess listings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOwnerMesses();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-text-secondary">Loading Student Directory...</p>
      </div>
    );
  }

  if (messes.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 max-w-lg mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
          <FaUserGraduate />
        </div>
        <h2 className="text-xl font-bold font-heading text-text-primary">No Mess Listings Found</h2>
        <p className="text-xs text-text-secondary leading-relaxed">
          You need to add a mess listing first before viewing enrolled students.
        </p>
        <Link
          to="/owner/messes/new"
          className="inline-flex items-center gap-2 bg-primary text-white text-xs font-bold px-6 py-3 rounded-full shadow-md hover:bg-primary-dark transition-all"
        >
          Add Your First Mess
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div>
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-2"
          >
            <FaArrowLeft size={10} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <FaUserGraduate size={22} />
            </div>
            <div>
              <span className="text-editorial-sub">ENROLLED MEMBERS</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-0.5">
                Student Directory & Attendance
              </h1>
            </div>
          </div>
        </div>

        {/* Mess Switcher Selector */}
        {messes.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-text-secondary flex items-center gap-1">
              <FaUtensils className="text-primary" /> Select Mess:
            </span>
            <select
              value={selectedMessId}
              onChange={(e) => setSelectedMessId(e.target.value)}
              className="px-4 py-2.5 rounded-2xl bg-surface border border-border text-xs font-bold text-text-primary focus:ring-2 focus:ring-primary cursor-pointer shadow-xs"
            >
              {messes.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.city})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Student Directory Component */}
      {selectedMessId && <OwnerStudentDirectory messId={selectedMessId} />}
    </div>
  );
};

export default StudentsPage;
