import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMess } from '../../services/messService';
import { getMenu } from '../../services/menuService';
import GalleryManager from '../../components/GalleryManager';
import MenuEditor from '../../components/MenuEditor';

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

  if (isLoading) return <p className="text-center py-16 text-gray-400">Loading...</p>;
  if (!mess) return <p className="text-center py-16 text-gray-400">Mess not found.</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/owner/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-2 inline-block">
        ← Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{mess.name}</h1>
      <p className="text-gray-400 mb-6">Manage photos and menu</p>

      <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'gallery' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
          }`}
        >
          Gallery
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'menu' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'
          }`}
        >
          Menu
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {activeTab === 'gallery' ? (
          <GalleryManager
            messId={messId}
            gallery={mess.gallery}
            onGalleryChange={(gallery) => setMess({ ...mess, gallery })}
          />
        ) : (
          <MenuEditor messId={messId} menu={menu} onMenuChange={setMenu} />
        )}
      </div>
    </div>
  );
};

export default ManageMess;