import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { uploadGalleryImages, deleteGalleryImage } from '../services/galleryService';

const MAX_IMAGES = 10;

const GalleryManager = ({ messId, gallery, onGalleryChange }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (gallery.length + files.length > MAX_IMAGES) {
      toast.error(`Gallery limit is ${MAX_IMAGES} images. You have ${gallery.length} already.`);
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    setIsUploading(true);
    try {
      const { data } = await uploadGalleryImages(messId, formData);
      onGalleryChange(data.data.gallery);
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (publicId) => {
    if (!window.confirm('Remove this image?')) return;

    setDeletingId(publicId);
    try {
      const { data } = await deleteGalleryImage(messId, publicId);
      onGalleryChange(data.data.gallery);
      toast.success('Image removed');
    } catch (error) {
      toast.error('Could not remove image');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-text-secondary">{gallery.length} / {MAX_IMAGES} images uploaded</p>
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          disabled={isUploading || gallery.length >= MAX_IMAGES}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <FaPlus size={12} /> {isUploading ? 'Uploading...' : 'Add Photos'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFilesSelected}
          className="hidden"
        />
      </div>

      {gallery.length === 0 ? (
        <p className="text-text-muted text-xs py-12 text-center bg-background border border-dashed border-border rounded-2xl">
          No photos yet — add some to attract more students.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gallery.map((img) => (
            <div key={img.publicId} className="relative group aspect-square rounded-2xl overflow-hidden border border-border">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleDelete(img.publicId)}
                disabled={deletingId === img.publicId}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs"
                aria-label="Delete image"
              >
                <FaTrash className="text-status-danger" size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;