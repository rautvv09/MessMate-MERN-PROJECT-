import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaClipboardList, FaFileInvoiceDollar, FaChartLine, FaArrowLeft } from 'react-icons/fa';
import { getMess } from '../../services/messService';
import { getMenu } from '../../services/menuService';
import GalleryManager from '../../components/GalleryManager';
import MenuEditor from '../../components/MenuEditor';
import OwnerStudentDirectory from '../../components/OwnerStudentDirectory';

const ManageMess = () => {
  const { messId } = useParams();
  const [mess, setMess] = useState(null);
  const [menu, setMenu] = useState(null);
  const [activeTab, setActiveTab] = useState('gallery');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [messRes, menuRes] = await Promise.all([getMess(messId), getMenu(messId)]);
        setMess(messRes.data.data.mess);
        setMenu(menuRes.data.data.menu);
      } catch (error) {
        toast.error('Could not load this mess');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [messId]);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-text-secondary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Loading Mess Details...</p>
      </div>
    );
  }
  if (!mess) return <p className="text-center py-16 text-text-secondary">Mess not found.</p>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <Link to="/owner/dashboard" className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-3">
          <FaArrowLeft size={10} /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary">{mess.name}</h1>
            <p className="text-xs text-text-secondary mt-1">Manage mess details, students, menu, and photos</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to={`/owner/messes/${messId}/reports`}
              className="flex items-center gap-2 bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-purple-500/20"
            >
              <FaChartLine size={13} />
              Reports
            </Link>
            <Link
              to={`/owner/messes/${messId}/attendance`}
              className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all border border-primary/20"
            >
              <FaClipboardList size={13} />
              Today's Attendance
            </Link>
            <Link
              to={`/owner/messes/${messId}/billing`}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
            >
              <FaFileInvoiceDollar size={13} />
              Billing
            </Link>
          </div>
        </div>
      </div>

      <div className="flex bg-surface border border-border rounded-2xl p-1 w-fit flex-wrap gap-1 shadow-xs">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gallery' ? 'bg-background shadow-xs text-primary border border-border' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Gallery
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'menu' ? 'bg-background shadow-xs text-primary border border-border' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Menu
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'students' ? 'bg-background shadow-xs text-primary border border-border' : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Students & Attendance
        </button>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
        {activeTab === 'gallery' && (
          <GalleryManager
            messId={messId}
            gallery={mess.gallery}
            onGalleryChange={(gallery) => setMess({ ...mess, gallery })}
          />
        )}
        {activeTab === 'menu' && <MenuEditor messId={messId} menu={menu} onMenuChange={setMenu} />}
        {activeTab === 'students' && <OwnerStudentDirectory messId={messId} />}
      </div>
    </div>
  );
};

export default ManageMess;