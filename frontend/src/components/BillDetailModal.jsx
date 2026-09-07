import { FaTimes, FaFilePdf, FaCreditCard, FaCheckCircle, FaMoneyBillWave, FaSpinner, FaRupeeSign } from 'react-icons/fa';

const monthNames = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * BillDetailModal — Shared modal that displays the full breakdown of a bill.
 * Used by both the owner BillingPage and the student StudentBillingPage.
 */
const BillDetailModal = ({
  isOpen,
  onClose,
  bill,
  isLoading,
  onDownloadPDF,
  onPayNow,
  onMarkPaid,
  isProcessingPayment,
}) => {
  if (!isOpen || !bill) return null;

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl border border-border overflow-hidden flex flex-col items-center justify-center py-20">
          <FaSpinner className="animate-spin text-primary text-3xl mb-3" />
          <p className="text-sm text-text-secondary">Loading bill details…</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: 'Pending', classes: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    paid: { label: 'Paid', classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
    overdue: { label: 'Overdue', classes: 'bg-status-danger/10 text-status-danger border-status-danger/30' },
    partially_paid: { label: 'Partially Paid', classes: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  };

  const status = statusConfig[bill.paymentStatus] || statusConfig.pending;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-surface rounded-2xl w-full max-w-2xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background">
          <div>
            <h3 className="text-lg font-extrabold font-heading text-text-primary">
              Bill #{bill.billNumber}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              {monthNames[bill.billingPeriod?.month]} {bill.billingPeriod?.year}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-colors border border-transparent hover:border-border"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">

          {/* Info Bar */}
          <div className="bg-primary/10 rounded-xl p-3 border border-primary/20 flex flex-wrap gap-x-6 gap-y-1 text-xs text-primary font-medium">
            {bill.studentId?.name && (
              <span><span className="font-bold">Student:</span> {bill.studentId.name}</span>
            )}
            {bill.messId?.name && (
              <span><span className="font-bold">Mess:</span> {bill.messId.name}</span>
            )}
            {bill.planType && (
              <span><span className="font-bold">Plan:</span> {bill.planType}</span>
            )}
            <span>
              <span className="font-bold">Period:</span>{' '}
              {monthNames[bill.billingPeriod?.month]} {bill.billingPeriod?.year}
            </span>
          </div>

          {/* Meal Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold text-text-primary mb-2">Meal Breakdown</h4>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background text-text-secondary text-xs">
                    <th className="text-left px-4 py-2.5 font-bold">Meal Type</th>
                    <th className="text-center px-4 py-2.5 font-bold">Count</th>
                    <th className="text-right px-4 py-2.5 font-bold">Rate (₹)</th>
                    <th className="text-right px-4 py-2.5 font-bold">Subtotal (₹)</th>
                  </tr>
                </thead>
                <tbody className="text-text-primary">
                  <tr className="border-t border-border">
                    <td className="px-4 py-2.5">Breakfast</td>
                    <td className="text-center px-4 py-2.5">{bill.mealCounts?.breakfastCount ?? 0}</td>
                    <td className="text-right px-4 py-2.5">{formatCurrency(bill.priceSnapshot?.breakfastPrice)}</td>
                    <td className="text-right px-4 py-2.5">{formatCurrency(bill.breakfastTotal)}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2.5">Lunch</td>
                    <td className="text-center px-4 py-2.5">{bill.mealCounts?.lunchCount ?? 0}</td>
                    <td className="text-right px-4 py-2.5">{formatCurrency(bill.priceSnapshot?.lunchPrice)}</td>
                    <td className="text-right px-4 py-2.5">{formatCurrency(bill.lunchTotal)}</td>
                  </tr>
                  <tr className="border-t border-border">
                    <td className="px-4 py-2.5">Dinner</td>
                    <td className="text-center px-4 py-2.5">{bill.mealCounts?.dinnerCount ?? 0}</td>
                    <td className="text-right px-4 py-2.5">{formatCurrency(bill.priceSnapshot?.dinnerPrice)}</td>
                    <td className="text-right px-4 py-2.5">{formatCurrency(bill.dinnerTotal)}</td>
                  </tr>
                  <tr className="border-t border-border bg-background font-bold">
                    <td className="px-4 py-2.5">Total</td>
                    <td className="text-center px-4 py-2.5">{bill.mealCounts?.totalMeals ?? 0}</td>
                    <td className="px-4 py-2.5"></td>
                    <td className="text-right px-4 py-2.5">{formatCurrency(bill.mealSubtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Charges Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-text-primary mb-2">Charges Breakdown</h4>
            <div className="bg-background rounded-xl border border-border p-4 space-y-2 text-sm">
              <ChargeRow label="Meal Subtotal" amount={formatCurrency(bill.mealSubtotal)} />
              {bill.deposit > 0 && (
                <ChargeRow label="+ Deposit" amount={formatCurrency(bill.deposit)} />
              )}
              {bill.registrationFee > 0 && (
                <ChargeRow label="+ Registration Fee" amount={formatCurrency(bill.registrationFee)} />
              )}
              <div className="border-t border-border pt-2">
                <ChargeRow label="Subtotal" amount={formatCurrency(bill.subtotal)} />
              </div>
              {bill.discount > 0 && (
                <ChargeRow label="− Discount" amount={`-${formatCurrency(bill.discount)}`} className="text-emerald-500" />
              )}
              <ChargeRow label="Taxable Amount" amount={formatCurrency(bill.taxableAmount)} />
              <ChargeRow
                label={`+ GST (${bill.priceSnapshot?.gstPercentage ?? 0}%)`}
                amount={formatCurrency(bill.gstAmount)}
              />
              <div className="border-t border-border pt-2">
                <div className="flex items-center justify-between font-extrabold text-text-primary text-base">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h4 className="text-xs font-bold text-text-primary mb-2">Payment Info</h4>
            <div className="bg-background rounded-xl border border-border p-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Status</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${status.classes}`}>
                  {status.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Due Date</span>
                <span className="text-text-primary font-medium">{formatDate(bill.dueDate)}</span>
              </div>
              {bill.paymentStatus === 'paid' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Paid At</span>
                    <span className="text-text-primary font-medium">{formatDate(bill.paidAt)}</span>
                  </div>
                  {bill.paymentMethod && (
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Payment Method</span>
                      <span className="text-text-primary font-medium capitalize">{bill.paymentMethod}</span>
                    </div>
                  )}
                </>
              )}
              {bill.paymentStatus === 'partially_paid' && bill.paidAmount != null && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Paid Amount</span>
                  <span className="text-text-primary font-medium">{formatCurrency(bill.paidAmount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {bill.notes && (
            <div>
              <h4 className="text-xs font-bold text-text-primary mb-2">Notes</h4>
              <div className="bg-background rounded-xl border border-border p-4 text-sm text-text-secondary">
                {bill.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-background">
          {onDownloadPDF && (
            <button
              type="button"
              onClick={() => onDownloadPDF(bill._id, bill.billNumber)}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-surface rounded-xl transition-colors border border-border"
            >
              <FaFilePdf />
              Download PDF
            </button>
          )}

          {onPayNow && bill.paymentStatus !== 'paid' && (
            <button
              type="button"
              onClick={() => onPayNow(bill)}
              disabled={isProcessingPayment}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                isProcessingPayment ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark shadow-md'
              }`}
            >
              {isProcessingPayment ? <FaSpinner className="animate-spin" /> : <FaCreditCard />}
              Pay Now
            </button>
          )}

          {onMarkPaid && bill.paymentStatus !== 'paid' && (
            <button
              type="button"
              onClick={() => onMarkPaid(bill._id)}
              disabled={isProcessingPayment}
              className={`flex items-center gap-2 px-5 py-2 text-xs font-bold text-white rounded-xl shadow-sm transition-all ${
                isProcessingPayment ? 'bg-emerald-500/50 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 shadow-md'
              }`}
            >
              {isProcessingPayment ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
              Mark Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/** Reusable row for the charges breakdown section */
const ChargeRow = ({ label, amount, className = '' }) => (
  <div className={`flex items-center justify-between ${className}`}>
    <span className="text-text-secondary">{label}</span>
    <span className="text-text-primary font-medium">{amount}</span>
  </div>
);

export default BillDetailModal;
