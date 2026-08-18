import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaFileInvoiceDollar,
  FaCog,
  FaUsers,
  FaListAlt,
  FaCheckCircle,
  FaFilePdf,
  FaMoneyBillWave,
  FaDownload,
} from 'react-icons/fa';
import useBilling from '../../hooks/useBilling';
import PricingConfig from '../../components/PricingConfig';
import GenerateBillModal from '../../components/GenerateBillModal';
import { getMyMesses } from '../../services/ownerService';

const BillingPage = () => {
  const { messId: paramMessId } = useParams();
  const [activeMessId, setActiveMessId] = useState(paramMessId || '');
  const [messes, setMesses] = useState([]);
  const [isResolvingMess, setIsResolvingMess] = useState(!paramMessId);

  useEffect(() => {
    if (!paramMessId) {
      const loadOwnerMesses = async () => {
        try {
          const { data } = await getMyMesses();
          const list = data.data.messes || [];
          setMesses(list);
          if (list.length > 0) setActiveMessId(list[0]._id);
        } catch (err) {
          toast.error('Could not load messes');
        } finally {
          setIsResolvingMess(false);
        }
      };
      loadOwnerMesses();
    }
  }, [paramMessId]);

  if (isResolvingMess) {
    return (
      <div className="min-h-screen bg-background py-16 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-text-secondary">Loading Billing Portal...</p>
      </div>
    );
  }

  if (!activeMessId && !isResolvingMess) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 max-w-lg mx-auto text-center space-y-4">
        <FaFileInvoiceDollar className="mx-auto text-4xl text-primary" />
        <h2 className="text-xl font-bold font-heading text-text-primary">No Active Mess Found</h2>
        <p className="text-xs text-text-secondary">Create a mess listing to manage student billing.</p>
        <Link to="/owner/messes/new" className="inline-block bg-primary text-white text-xs font-bold px-6 py-3 rounded-full">
          Add Mess
        </Link>
      </div>
    );
  }

  return <BillingPageContent messId={activeMessId} messes={messes} onSelectMess={setActiveMessId} />;
};

const BillingPageContent = ({ messId, messes, onSelectMess }) => {
  const [activeTab, setActiveTab] = useState('generate');
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);

  const {
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
  } = useBilling(messId);

  useEffect(() => {
    fetchPricing();
    fetchBills();
    fetchBillable();
  }, [messId, fetchPricing, fetchBills, fetchBillable]);

  const TABS = [
    { id: 'generate', label: 'Generate Bills', icon: FaUsers },
    { id: 'history', label: 'Bill History', icon: FaListAlt },
    { id: 'config', label: 'Pricing Config', icon: FaCog },
  ];

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-6 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-2"
          >
            <FaArrowLeft size={10} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <FaFileInvoiceDollar size={22} />
            </div>
            <div>
              <span className="text-editorial-sub">BILLING & INVOICING</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-0.5">
                Monthly Invoices & Revenue
              </h1>
            </div>
          </div>
        </div>

        {messes.length > 1 && (
          <select
            value={messId}
            onChange={(e) => onSelectMess(e.target.value)}
            className="px-4 py-2.5 rounded-2xl bg-surface border border-border text-xs font-bold text-text-primary"
          >
            {messes.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6 overflow-x-auto gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold rounded-t-2xl transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'config' && (
          <div className="max-w-3xl mx-auto">
            {isLoadingPricing ? (
              <p className="text-center py-10 text-text-secondary">Loading pricing configuration...</p>
            ) : (
              <PricingConfig
                initialPricing={pricing}
                onSave={savePricing}
                isSaving={isUpdatingPricing}
              />
            )}
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-3xl border border-border shadow-xs">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">Billing Period</label>
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="px-3 py-1.5 border border-border rounded-xl text-xs font-bold text-text-primary bg-background"
                  >
                    {monthNames.slice(1).map((m, i) => (
                      <option key={m} value={i + 1}>{m}</option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-1.5 border border-border rounded-xl text-xs font-bold text-text-primary bg-background"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {isLoadingBillable || isLoadingPricing ? (
              <p className="text-center py-10 text-text-secondary">Loading billable students...</p>
            ) : billableBookings.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-3xl border border-border space-y-2">
                <FaCheckCircle className="mx-auto text-emerald-500 text-3xl" />
                <p className="text-text-primary font-bold text-base">All Caught Up!</p>
                <p className="text-xs text-text-secondary">No pending bills to generate for this month.</p>
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full">
                  <thead>
                    <tr className="bg-background border-b border-border">
                      <th className="text-left text-xs font-bold text-text-secondary uppercase px-4 py-3">Student</th>
                      <th className="text-left text-xs font-bold text-text-secondary uppercase px-4 py-3">Plan</th>
                      <th className="text-left text-xs font-bold text-text-secondary uppercase px-4 py-3">Joining Date</th>
                      <th className="text-right text-xs font-bold text-text-secondary uppercase px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {billableBookings.map((booking) => (
                      <tr key={booking._id} className="hover:bg-background/40">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-text-primary">{booking.studentId.name}</span>
                            <span className="text-[10px] text-text-secondary">{booking.studentId.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">
                            {booking.planType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-text-secondary">
                          {new Date(booking.joiningDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedBookingForBill(booking)}
                            className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xs"
                          >
                            Generate Bill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface p-4 rounded-3xl border border-border">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Month / Year</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-3 py-1.5 border border-border rounded-xl text-xs font-bold text-text-primary bg-background"
                    >
                      <option value="">All Months</option>
                      {monthNames.slice(1).map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-1">Status</label>
                  <select
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="px-3 py-1.5 border border-border rounded-xl text-xs font-bold text-text-primary bg-background"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 text-xs font-bold rounded-2xl hover:bg-primary/20 transition-all"
              >
                <FaDownload size={12} /> Export CSV
              </button>
            </div>

            {isLoadingBills ? (
              <p className="text-center py-10 text-text-secondary">Loading bills...</p>
            ) : bills.length === 0 ? (
              <div className="text-center py-16 bg-surface rounded-3xl border border-border space-y-2">
                <FaListAlt className="mx-auto text-text-muted text-3xl" />
                <p className="text-text-primary font-bold text-base">No Bills Found</p>
                <p className="text-xs text-text-secondary">Try adjusting filters or generating a new bill.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bills.map((bill) => (
                  <BillCard
                    key={bill._id}
                    bill={bill}
                    onMarkPaid={() => handleMarkAsPaid(bill._id, 'cash')}
                    onDownloadPDF={() => handleDownloadPDF(bill._id, bill.billNumber)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <GenerateBillModal
        isOpen={!!selectedBookingForBill}
        onClose={() => setSelectedBookingForBill(null)}
        booking={selectedBookingForBill}
        year={selectedYear}
        month={selectedMonth}
        pricing={pricing}
        onGenerate={handleGenerateBill}
        isGenerating={isGenerating}
      />
    </div>
  );
};

const BillCard = ({ bill, onMarkPaid, onDownloadPDF }) => {
  const isPaid = bill.paymentStatus === 'paid';

  return (
    <div className="bg-surface border border-border rounded-3xl p-5 hover:border-primary/50 transition-all shadow-xs space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xs font-bold text-text-primary">{bill.studentId.name}</h3>
          <p className="text-[10px] text-text-secondary">{bill.billNumber}</p>
        </div>
        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${isPaid ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>
          {bill.paymentStatus}
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-text-secondary">
        <div className="flex justify-between">
          <span>Period:</span>
          <span className="font-bold text-text-primary">{bill.billingPeriod.month}/{bill.billingPeriod.year}</span>
        </div>
        <div className="flex justify-between">
          <span>Amount:</span>
          <span className="font-extrabold text-primary text-sm">₹{bill.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-border">
        {!isPaid && (
          <button
            onClick={onMarkPaid}
            className="flex-1 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-all text-center"
          >
            Mark Paid
          </button>
        )}
        <button
          onClick={onDownloadPDF}
          className="flex-1 py-2 bg-background border border-border text-text-primary text-xs font-bold rounded-xl hover:border-primary transition-all text-center"
        >
          PDF
        </button>
      </div>
    </div>
  );
};

export default BillingPage;
