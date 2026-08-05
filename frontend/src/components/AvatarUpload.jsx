import { useRef, useState } from 'react';
import { FaCamera } from 'react-icons/fa';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB — must match the backend's Multer limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const AvatarUpload = ({ currentAvatarUrl, userName, onUpload, isUploading }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Please select a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert('Image must be under 5MB.');
      return;
    }

    // Show an instant local preview before the upload even starts
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('avatar', file);
    onUpload(formData);
  };

  const displayUrl = previewUrl || currentAvatarUrl;
  const initials = userName?.charAt(0).toUpperCase() || '?';

  return (
    <div className="relative w-24 h-24">
      {displayUrl ? (
        <img
          src={displayUrl}
          alt="Avatar"
          className="w-full h-full rounded-full object-cover border-2 border-gray-100"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-semibold text-emerald-600">
          {initials}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-2 border-2 border-white"
        aria-label="Change avatar"
      >
        <FaCamera size={12} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;