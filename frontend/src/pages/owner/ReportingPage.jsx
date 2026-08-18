import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowLeft,
  FaChartLine,
  FaChartBar,
  FaChartPie,
} from 'react-icons/fa';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import useReporting from '../../hooks/useReporting';
import { getMyMesses } from '../../services/ownerService';

const ReportingPage = () => {
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
        <p className="text-xs font-semibold text-text-secondary">Loading Analytics...</p>
      </div>
    );
  }

  if (!activeMessId && !isResolvingMess) {
    return (
      <div className="min-h-screen bg-background py-16 px-4 max-w-lg mx-auto text-center space-y-4">
        <FaChartLine className="mx-auto text-4xl text-primary" />
        <h2 className="text-xl font-bold font-heading text-text-primary">No Active Mess Found</h2>
        <p className="text-xs text-text-secondary">Create a mess listing to view business analytics.</p>
        <Link to="/owner/messes/new" className="inline-block bg-primary text-white text-xs font-bold px-6 py-3 rounded-full">
          Add Mess
        </Link>
      </div>
    );
  }

  return <ReportingPageContent messId={activeMessId} messes={messes} onSelectMess={setActiveMessId} />;
};

const ReportingPageContent = ({ messId, messes, onSelectMess }) => {
  const [revenueMonths, setRevenueMonths] = useState(6);

  const {
    revenueData,
    attendanceData,
    studentData,
    isLoadingRevenue,
    isLoadingAttendance,
    isLoadingStudents,
    fetchRevenue,
    fetchAll,
  } = useReporting(messId);

  useEffect(() => {
    fetchAll();
  }, [messId, fetchAll]);

  useEffect(() => {
    fetchRevenue(revenueMonths);
  }, [revenueMonths, fetchRevenue]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-background text-text-primary py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/owner/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-3"
          >
            <FaArrowLeft size={10} /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <FaChartLine size={22} />
            </div>
            <div>
              <span className="text-editorial-sub">BUSINESS PERFORMANCE</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-0.5">
                Reports & Analytics
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REVENUE TRENDS */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs col-span-1 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaChartBar className="text-primary" />
              <h2 className="text-lg font-bold font-heading text-text-primary">Revenue Trends</h2>
            </div>
            <select
              value={revenueMonths}
              onChange={(e) => setRevenueMonths(Number(e.target.value))}
              className="text-xs font-bold border border-border rounded-xl px-3 py-1.5 bg-background text-text-primary"
            >
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>

          {isLoadingRevenue ? (
            <div className="h-[300px] flex items-center justify-center text-text-secondary">Loading chart...</div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="monthName" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-secondary)' }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <RechartsTooltip formatter={(value) => [`₹${value}`, '']} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="totalBilled" name="Billed Amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="totalCollected" name="Collected Amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ATTENDANCE TRENDS */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <FaChartLine className="text-blue-500" />
            <h2 className="text-lg font-bold font-heading text-text-primary">Attendance (Last 30 Days)</h2>
          </div>

          {isLoadingAttendance || !attendanceData ? (
            <div className="h-[250px] flex items-center justify-center text-text-secondary">Loading chart...</div>
          ) : (
            <>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData.dailyTrends} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="dayName" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-text-secondary)' }} />
                    <RechartsTooltip />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="breakfast" name="Breakfast" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="lunch" name="Lunch" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="dinner" name="Dinner" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-4 border-t border-border">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">Breakfasts</p>
                  <p className="text-lg font-extrabold text-text-primary">{attendanceData.mealDistribution.breakfast}</p>
                </div>
                <div className="border-l border-r border-border">
                  <p className="text-[10px] font-bold text-text-secondary uppercase">Lunches</p>
                  <p className="text-lg font-extrabold text-text-primary">{attendanceData.mealDistribution.lunch}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase">Dinners</p>
                  <p className="text-lg font-extrabold text-text-primary">{attendanceData.mealDistribution.dinner}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* STUDENT PLAN ANALYTICS */}
        <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <FaChartPie className="text-purple-500" />
            <h2 className="text-lg font-bold font-heading text-text-primary">Student Plan Breakdown</h2>
          </div>

          {isLoadingStudents || !studentData ? (
            <div className="h-[250px] flex items-center justify-center text-text-secondary">Loading chart...</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between h-[250px]">
              <div className="w-full md:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentData.planDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {studentData.planDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-3 px-4">
                {studentData.planDistribution.map((plan, i) => (
                  <div key={plan.name} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-text-secondary">{plan.name}</span>
                    </div>
                    <span className="font-extrabold text-text-primary">{plan.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;
