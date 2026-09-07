import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getMyBills, downloadMyBillPDF, getMyBillById } from '../services/studentBillingService';
import { loadRazorpayScript, createPaymentOrder, verifyPaymentSignature } from '../services/paymentService';

const useStudentBilling = (user) => {
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  
  // Filters
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [selectedBillDetails, setSelectedBillDetails] = useState(null);
  const [isLoadingBillDetails, setIsLoadingBillDetails] = useState(false);

  const fetchBills = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (selectedYear) filters.year = selectedYear;
      if (selectedMonth) filters.month = selectedMonth;
      if (paymentStatusFilter) filters.paymentStatus = paymentStatusFilter;

      const { data } = await getMyBills(filters);
      setBills(data.data.bills);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bills');
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, paymentStatusFilter]);

  const handleDownloadPDF = async (billId, billNumber) => {
    try {
      const response = await downloadMyBillPDF(billId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download invoice');
    }
  };

  const handlePayment = async (bill) => {
    setIsProcessingPayment(true);
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // Create order
      const { data: orderData } = await createPaymentOrder(bill._id);
      const { orderId, amount, currency, keyId } = orderData.data;

      const options = {
        key: keyId,
        amount: amount.toString(),
        currency: currency,
        name: 'MessMate',
        description: `Bill Payment: ${bill.billNumber}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await verifyPaymentSignature({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              billId: bill._id,
            });
            toast.success('Payment successful!');
            fetchBills(); // Refresh bills
          } catch (verifyError) {
            toast.error('Payment verification failed.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: {
          color: '#10b981',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const fetchBillDetails = async (billId) => {
    setIsLoadingBillDetails(true);
    try {
      const { data } = await getMyBillById(billId);
      setSelectedBillDetails(data.data);
    } catch (error) {
      toast.error('Failed to load bill details');
    } finally {
      setIsLoadingBillDetails(false);
    }
  };

  const clearBillDetails = () => setSelectedBillDetails(null);

  return {
    bills,
    isLoading,
    isProcessingPayment,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    paymentStatusFilter,
    setPaymentStatusFilter,
    fetchBills,
    handleDownloadPDF,
    handlePayment,
    selectedBillDetails,
    isLoadingBillDetails,
    fetchBillDetails,
    clearBillDetails,
  };
};

export default useStudentBilling;
