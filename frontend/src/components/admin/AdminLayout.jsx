import { Link, useLocation } from 'react-router-dom';
import {
  FaChartBar,
  FaUsers,
  FaStore,
  FaUtensils,
  FaReceipt,
  FaStar,
  FaHistory,
  FaShieldAlt,
} from 'react-icons/fa';

const AdminLayout = ({ title, subtitle, actions, children }) => {
  const location = useLocation();

  const navTabs = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FaChartBar },
    { to: '/admin/students', label: 'Students', icon: FaUsers },
    { to: '/admin/owners', label: 'Owners', icon: FaStore },
    { to: '/admin/messes', label: 'Mess Listings', icon: FaUtensils },
    { to: '/admin/bookings', label: 'Bookings', icon: FaReceipt },
    { to: '/admin/reviews', label: 'Reviews', icon: FaStar },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FaHistory },
  ];

  return (
    <div className="min-h-screen bg-background text-text-primary py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <FaShieldAlt size={10} /> ADMIN PORTAL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-primary mt-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Admin Sub-Navigation Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-border/60">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.to;

          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
            >
              <Icon size={13} className={isActive ? 'text-white' : 'text-primary'} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
};

export default AdminLayout;
