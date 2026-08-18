import api from './api';

// ==================== MEAL PRICING ====================

export const getMealPricing = (messId) =>
  api.get(`/owner/messes/${messId}/pricing`);

export const updateMealPricing = (messId, data) =>
  api.put(`/owner/messes/${messId}/pricing`, data);

// ==================== BILL GENERATION ====================

export const getBillableBookings = (messId, year, month) =>
  api.get(`/owner/messes/${messId}/billing/billable`, {
    params: { year, month },
  });

export const generateBill = (messId, data) =>
  api.post(`/owner/messes/${messId}/billing/generate`, data);

// ==================== BILL MANAGEMENT ====================

export const getMessBills = (messId, filters = {}) =>
  api.get(`/owner/messes/${messId}/billing`, { params: filters });

export const getBillById = (billId) =>
  api.get(`/owner/billing/${billId}`);

export const updatePaymentStatus = (billId, data) =>
  api.patch(`/owner/billing/${billId}/payment`, data);

export const downloadBillPDF = (billId) =>
  api.get(`/owner/billing/${billId}/pdf`, { responseType: 'blob' });

export const downloadBillsCSV = (messId, filters = {}) =>
  api.get(`/owner/messes/${messId}/export/bills`, {
    params: filters,
    responseType: 'blob',
  });
