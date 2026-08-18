import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getMealPricing,
  updateMealPricing,
  getBillableBookings,
  generateBill,
  getMessBills,
  updatePaymentStatus,
  downloadBillPDF,
  downloadBillsCSV,
} from '../services/billingService';

/**
 * Custom hook for the Owner Billing Dashboard.
 * Manages state for pricing config, billable students, and generated bills.
 */
const useBilling = (messId) => {
  const now = new Date();
  
  // State
  const [pricing, setPricing] = useState(null);
  const [bills, setBills] = useState([]);
  const [billableBookings, setBillableBookings] = useState([]);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  
  // Loading states
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [isLoadingBills, setIsLoadingBills] = useState(true);
  const [isLoadingBillable, setIsLoadingBillable] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingPricing, setIsUpdatingPricing] = useState(false);

  // Fetch Pricing
  const fetchPricing = useCallback(async () => {
    setIsLoadingPricing(true);
    try {
      const { data } = await getMealPricing(messId);
      setPricing(data.data.mealPricing);
    } catch (error) {
      toast.error('Failed to load pricing configuration');
    } finally {
      setIsLoadingPricing(false);
    }
  }, [messId]);

  // Update Pricing
  const savePricing = async (newPricing) => {
    setIsUpdatingPricing(true);
    try {
      const { data } = await updateMealPricing(messId, newPricing);
      setPricing(data.data);
      toast.success('Pricing updated successfully');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pricing');
      return false;
    } finally {
      setIsUpdatingPricing(false);
    }
  };

  // Fetch Bills
  const fetchBills = useCallback(async () => {
    setIsLoadingBills(true);
    try {
      const filters = {};
      if (selectedYear) filters.year = selectedYear;
      if (selectedMonth) filters.month = selectedMonth;
      if (paymentStatusFilter) filters.paymentStatus = paymentStatusFilter;

      const { data } = await getMessBills(messId, filters);
      setBills(data.data.bills);
    } catch (error) {
      toast.error('Failed to load bills');
    } finally {
      setIsLoadingBills(false);
    }
  }, [messId, selectedYear, selectedMonth, paymentStatusFilter]);

  // Fetch Billable Bookings for generation
  const fetchBillable = useCallback(async () => {
    setIsLoadingBillable(true);
    try {
      const { data } = await getBillableBookings(messId, selectedYear, selectedMonth);
      setBillableBookings(data.data.billable);
      return data.data;
    } catch (error) {
      toast.error('Failed to load billable students');
      return null;
    } finally {
      setIsLoadingBillable(false);
    }
  }, [messId, selectedYear, selectedMonth]);

  // Generate a Bill
  const handleGenerateBill = async (bookingId, extras) => {
    setIsGenerating(true);
    try {
      const payload = {
        bookingId,
        year: selectedYear,
        month: selectedMonth,
        ...extras,
      };
      
      const { data } = await generateBill(messId, payload);
      toast.success(data.message);
      
      // Refresh data
      await Promise.all([fetchBills(), fetchBillable()]);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate bill');
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  // Mark Bill as Paid
  const handleMarkAsPaid = async (billId, paymentMethod) => {
    try {
      await updatePaymentStatus(billId, { status: 'paid', paymentMethod });
      toast.success('Payment recorded');
      await fetchBills();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment status');
    }
  };
  
  // Download PDF
  const handleDownloadPDF = async (billId, billNumber) => {
    try {
      const response = await downloadBillPDF(billId);
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      const filters = {};
      if (selectedYear) filters.year = selectedYear;
      if (selectedMonth) filters.month = selectedMonth;
      if (paymentStatusFilter) filters.paymentStatus = paymentStatusFilter;

      const response = await downloadBillsCSV(messId, filters);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bills_export_${selectedYear}_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Export downloaded successfully');
    } catch (error) {
      toast.error('Failed to export data to CSV');
    }
  };

  return {
    pricing,
    bills,
    billableBookings,
    
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    paymentStatusFilter,
    setPaymentStatusFilter,
    
    isLoadingPricing,
    isLoadingBills,
    isLoadingBillable,
    isGenerating,
    isUpdatingPricing,
    
    fetchPricing,
    fetchBills,
    fetchBillable,
    savePricing,
    handleGenerateBill,
    handleMarkAsPaid,
    handleDownloadPDF,
    handleExportCSV,
  };
};

export default useBilling;
