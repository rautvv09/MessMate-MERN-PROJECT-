import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile, updateAvatar } from '../../services/userService';
import { getMyFavorites, removeFavorite } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import AvatarUpload from '../../components/AvatarUpload';
import FormInput from '../../components/FormInput';
import MessCard from '../../components/MessCard';

const Profile = () => {
  const { user, loginUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', college: '', city: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await getProfile();
      const u = data.data.user;
      setProfileData(u);
      setFormData({
        name: u.name,
        phone: u.phone,
        college: u.roleDetails?.college || '',
        city: u.roleDetails?.city || '',
      });
    };
    loadProfile();
    loadFavorites();
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

      // Keep AuthContext (and therefore the Navbar/anywhere else showing the user's name) in sync
      const token = localStorage.getItem('messmate_token');
      loginUser(updatedUser, token);

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

      const token = localStorage.getItem('messmate_token');
      loginUser(updatedUser, token);

      toast.success('Avatar updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not upload avatar');
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

  if (!profileData) return <p className="text-center py-16 text-gray-400">Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <AvatarUpload
            currentAvatarUrl={profileData.avatarUrl}
            userName={profileData.name}
            onUpload={handleAvatarUpload}
            isUploading={isUploadingAvatar}
          />
          <div>
            <p className="font-semibold text-gray-900">{profileData.name}</p>
            <p className="text-sm text-gray-400">{profileData.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <FormInput label="Name" name="name" value={formData.name} onChange={handleFormChange} />
            <FormInput label="Phone" name="phone" value={formData.phone} onChange={handleFormChange} />
            <FormInput label="College" name="college" value={formData.college} onChange={handleFormChange} />
            <FormInput label="City" name="city" value={formData.city} onChange={handleFormChange} />
          </div>
          <button
            type="submit"
            disabled={isSavingProfile}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-medium px-5 py-2 rounded-lg text-sm mt-2"
          >
            {isSavingProfile ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">Favourite Messes</h2>
      {isLoadingFavorites ? (
        <p className="text-gray-400">Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-400">No favorites yet — explore the dashboard to add some!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
  );
};

export default Profile;