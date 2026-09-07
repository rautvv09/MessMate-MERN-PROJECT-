import { useEffect } from 'react';
import { FaFileInvoiceDollar, FaFilePdf, FaExclamationCircle, FaCreditCard, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import useStudentBilling from '../../hooks/useStudentBilling';
import BillDetailModal from '../../components/BillDetailModal';
import { useAuth } from '../../context/AuthContext';

const StudentBillingPage = () => {
  const { user } = useAuth();
  
  const {
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
  } = useStudentBilling(user);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    paid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
    overdue: 'bg-status-danger/10 text-status-danger border-status-danger/30',
    partially_paid: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <FaFileInvoiceDollar className="text-primary" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold font-heading text-text-primary">My Bills</h1>
          <p className="text-sm text-text-secondary">View and download your monthly invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-surface p-4 rounded-2xl border border-border shadow-sm">
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">Month</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-background border border-border text-text-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[120px]"
          >
            <option value="">All Months</option>
            {monthNames.slice(1).map((m, i) => (
              <option key={m} value={i + 1} className="bg-surface text-text-primary">{m}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 bg-background border border-border text-text-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[100px]"
          >
            <option value="">All Years</option>
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y} className="bg-surface text-text-primary">{y}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary mb-1">Status</label>
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border text-text-primary rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[140px]"
          >
            <option value="">All Statuses</option>
            <option value="pending" className="bg-surface text-text-primary">Pending</option>
            <option value="paid" className="bg-surface text-text-primary">Paid</option>
            <option value="partially_paid" className="bg-surface text-text-primary">Partially Paid</option>
            <option value="overdue" className="bg-surface text-text-primary">Overdue</option>
          </select>
        </div>
      </div>

      {/* Summary Stats Bar */}
      {!isLoading && bills.length > 0 && (() => {
        const totalPending = bills.filter(b => b.paymentStatus !== 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
        const totalPaid = bills.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0);
        const unpaidCount = bills.filter(b => b.paymentStatus !== 'paid').length;
        return (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FaMoneyBillWave size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase">Pending</p>
                <p className="text-sm font-extrabold text-text-primary">₹{totalPending.toFixed(0)}</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FaCheckCircle size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase">Paid</p>
                <p className="text-sm font-extrabold text-text-primary">₹{totalPaid.toFixed(0)}</p>
              </div>
            </div>
            <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FaFileInvoiceDollar size={16} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-secondary uppercase">Unpaid Bills</p>
                <p className="text-sm font-extrabold text-text-primary">{unpaidCount}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Bills List */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bills.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-2xl border border-border shadow-sm">
          <div className="w-16 h-16 mx-auto mb-4 bg-background rounded-full flex items-center justify-center border border-border">
            <FaExclamationCircle className="text-text-muted" size={24} />
          </div>
          <h2 className="text-lg font-extrabold font-heading text-text-primary mb-1">No Bills Found</h2>
          <p className="text-text-secondary text-sm">You don't have any bills matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bills.map((bill) => (
            <div key={bill._id} className="bg-surface border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-md transition-all flex flex-col justify-between">
              
              <div
                className="cursor-pointer"
                onClick={() => fetchBillDetails(bill._id)}
                title="Click to view full breakdown"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-base font-extrabold font-heading text-text-primary">{monthNames[bill.billingPeriod.month]} {bill.billingPeriod.year}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{bill.messId.name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${statusColors[bill.paymentStatus] || 'bg-background text-text-secondary border-border'}`}>
                    {bill.paymentStatus.replace('_', ' ')}
                  </span>
                </div>

                <div className="bg-background rounded-xl p-3.5 mb-4 space-y-2 border border-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Invoice:</span>
                    <span className="font-mono font-bold text-text-primary">{bill.billNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-secondary">Due Date:</span>
                    <span className={`font-bold ${new Date(bill.dueDate) < new Date() && bill.paymentStatus !== 'paid' ? 'text-status-danger' : 'text-text-primary'}`}>
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {bill.mealCounts && (
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Meals:</span>
                      <span className="font-bold text-text-primary">
                        {bill.mealCounts.breakfastCount}B + {bill.mealCounts.lunchCount}L + {bill.mealCounts.dinnerCount}D
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-text-primary font-bold">Total Amount:</span>
                    <span className="font-extrabold text-primary font-heading text-base">₹{bill.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex gap-2 pt-2">
                {bill.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => handlePayment(bill)}
                    disabled={isProcessingPayment}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                  >
                    <FaCreditCard size={13} />
                    {isProcessingPayment ? 'Processing...' : 'Pay Now'}
                  </button>
                )}
                <button
                  onClick={() => handleDownloadPDF(bill._id, bill.billNumber)}
                  className={`flex items-center justify-center gap-2 py-2.5 bg-background hover:bg-surface text-text-primary text-xs font-bold rounded-xl transition-all border border-border ${
                    bill.paymentStatus !== 'paid' ? 'flex-1' : 'w-full'
                  }`}
                >
                  <FaFilePdf size={13} className="text-status-danger" />
                  PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BillDetailModal
        isOpen={!!selectedBillDetails || isLoadingBillDetails}
        onClose={clearBillDetails}
        bill={selectedBillDetails}
        isLoading={isLoadingBillDetails}
        onDownloadPDF={handleDownloadPDF}
        onPayNow={(bill) => {
          clearBillDetails();
          handlePayment(bill);
        }}
        isProcessingPayment={isProcessingPayment}
      />
    </div>
  );
};

export default StudentBillingPage;
