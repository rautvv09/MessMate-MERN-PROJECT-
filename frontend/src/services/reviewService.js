import api from './api';

export const getMessReviews = (messId, params) => api.get(`/messes/${messId}/reviews`, { params });
export const getMyReviewForMess = (messId) => api.get(`/messes/${messId}/reviews/me`);
export const submitReview = (messId, data) => api.post(`/messes/${messId}/reviews`, data);
export const deleteReview = (reviewId) => api.delete(`/reviews/${reviewId}`);