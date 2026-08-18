import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, updateAvatar } from '../../services/userService';
import { getMyFavorites, removeFavorite } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import AvatarUpload from '../../components/AvatarUpload';
import FormInput from '../../components/FormInput';
import MessCard from '../../components/MessCard';
import { FaUser, FaHeart, FaShieldAlt, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user, setAuthUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', college: '', city: '', businessName: '', address: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  const isOwner = profileData?.role === 'owner';

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const { data } = await getProfile();
        const u = data.data.user;
        setProfileData(u);
        setFormData({
          name: u.name || '',
          phone: u.phone || '',
          college: u.roleDetails?.college || '',
          city: u.roleDetails?.city || '',
          businessName: u.roleDetails?.businessName || '',
          address: u.roleDetails?.address || '',
        });

        if (u.role === 'student') {
          loadFavorites();
        }
      } catch (error) {
        toast.error('Could not load profile data');
      }
    };
    loadProfileData();
  }, []);

  const loadFavorites = async () => {
    setIsLoadingFavorites(true);
    try {
      const { data } = await getMyFavorites();
      setFavorites(data.data.favorites);
    } catch (error) {
      toast.error('Could not load favorites');
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data } = await updateProfile(formData);
      const updatedUser = data.data.user;
      setProfileData(updatedUser);
      setAuthUser(updatedUser);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (formDataPayload) => {
    setIsUploadingAvatar(true);
    try {
      const { data } = await updateAvatar(formDataPayload);
      const updatedUser = data.data.user;
      setProfileData(updatedUser);
      setAuthUser(updatedUser);
      toast.success('Profile image updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload profile image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveFavorite = async (messId) => {
    try {
      await removeFavorite(messId);
      setFavorites((prev) => prev.filter((fav) => fav.messId._id !== messId));
      toast.success('Removed from favorites');
    } catch (error) {
      toast.error('Could not remove favorite');
    }
  };

  if (!profileData) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-text-secondary">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header Banner Card */}
      <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <AvatarUpload
          currentAvatarUrl={profileData.avatarUrl}
          userName={profileData.name}
          onUpload={handleAvatarUpload}
          isUploading={isUploadingAvatar}
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold font-heading text-text-primary">{profileData.name}</h1>
            <span className="text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              {profileData.role}
            </span>
          </div>
          <p className="text-xs text-text-secondary">{profileData.email}</p>
          <p className="text-xs text-text-muted pt-1">
            Member since {new Date(profileData.createdAt || Date.now()).getFullYear()}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('details')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'details'
              ? 'bg-primary text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
          }`}
        >
          <FaUser /> Account Details
        </button>

        {!isOwner && (
          <button
            type="button"
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <FaHeart /> Saved Favorites ({favorites.length})
          </button>
        )}
      </div>

      {/* Tab 1: Account Details Form */}
      {activeTab === 'details' && (
        <div className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold font-heading text-text-primary border-b border-border pb-3">
            Personal Information
          </h2>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Full Name" name="name" value={formData.name} onChange={handleFormChange} />
              <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleFormChange} />

              {isOwner ? (
                <>
                  <FormInput label="Business Name" name="businessName" value={formData.businessName} onChange={handleFormChange} />
                  <FormInput label="Address" name="address" value={formData.address} onChange={handleFormChange} />
                </>
              ) : (
                <>
                  <FormInput label="College Name" name="college" value={formData.college} onChange={handleFormChange} />
                  <FormInput label="City / Locality" name="city" value={formData.city} onChange={handleFormChange} />
                </>
              )}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3 rounded-2xl bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <FaSave /> {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Favorites Grid */}
      {activeTab === 'favorites' && !isOwner && (
        <div className="space-y-6">
          {isLoadingFavorites ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-surface border border-border rounded-3xl h-64 shimmer-bg" />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="bg-surface border border-border rounded-3xl p-12 text-center space-y-3">
              <FaHeart className="text-3xl text-text-muted mx-auto" />
              <h3 className="text-base font-bold font-heading text-text-primary">No Favorite Messes Saved</h3>
              <p className="text-xs text-text-secondary">
                Tap the heart icon on any MessCard to save it to your favorites list for quick access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => (
                <MessCard
                  key={fav._id}
                  mess={fav.messId}
                  isFavorited={true}
                  onToggleFavorite={() => handleRemoveFavorite(fav.messId._id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;