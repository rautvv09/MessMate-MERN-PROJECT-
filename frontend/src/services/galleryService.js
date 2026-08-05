import api from './api';

export const uploadGalleryImages = (messId, formData) =>
  api.post(`/messes/${messId}/gallery`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteGalleryImage = (messId, publicId) =>
  api.delete(`/messes/${messId}/gallery/${encodeURIComponent(publicId)}`);