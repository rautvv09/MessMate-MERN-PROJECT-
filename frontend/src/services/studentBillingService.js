import api from './api';

export const getMyBills = (filters = {}) =>
  api.get('/student/billing', { params: filters });

export const getMyBillById = (billId) =>
  api.get(`/student/billing/${billId}`);

export const downloadMyBillPDF = (billId) =>
  api.get(`/student/billing/${billId}/pdf`, { responseType: 'blob' });
