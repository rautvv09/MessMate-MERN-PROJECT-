import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ui/ThemeToggle';
import { FaUtensils, FaBars, FaTimes, FaUser, FaSignOutAlt, FaHeart, FaCalendarAlt, FaReceipt, FaStore, FaCompass, FaUsers, FaStar, FaHistory, FaChartBar, FaShieldAlt } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';

  const guestLinks = [
    { to: '/#messes', label: 'Find Mess', icon: FaCompass },
    { to: '/#how-it-works', label: 'How It Works', icon: FaUtensils },
    { to: '/#owners', label: 'For Owners', icon: FaStore },
  ];

  const studentLinks = [
    { to: '/dashboard', label: 'Find Mess', icon: FaCompass },
    { to: '/student/subscription', label: 'My Subscription', icon: FaUtensils },
    { to: '/my-attendance', label: 'Attendance', icon: FaCalendarAlt },
    { to: '/student/bills', label: 'Bills', icon: FaReceipt },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Dashboard', icon: FaStore },
    { to: '/profile', label: 'My Profile', icon: FaUser },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: FaChartBar },
    { to: '/admin/students', label: 'Students', icon: FaUsers },
    { to: '/admin/owners', label: 'Owners', icon: FaStore },
    { to: '/admin/messes', label: 'Messes', icon: FaUtensils },
    { to: '/admin/bookings', label: 'Bookings', icon: FaReceipt },
    { to: '/admin/reviews', label: 'Reviews', icon: FaStar },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: FaHistory },
  ];

  const activeLinks = !isAuthenticated
    ? guestLinks
    : isAdmin
    ? adminLinks
    : isOwner
    ? ownerLinks
    : studentLinks;

  const isActive = (path) => {
    if (path === '/student/subscription') {
      return location.pathname === '/student/subscription' || location.pathname === '/bookings/me';
    }
    if (path === '/student/bills') {
      return location.pathname.startsWith('/student/bills') || location.pathname.startsWith('/my-bills');
    }
    return location.pathname === path;
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/90 dark:bg-surface/90 backdrop-blur-md border-b border-border shadow-sm py-2.5'
          : 'bg-surface/75 dark:bg-surface/75 backdrop-blur-md border-b border-border/50 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to={isAuthenticated ? (isAdmin ? '/admin/dashboard' : isOwner ? '/owner/dashboard' : '/dashboard') : '/'}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-200">
              <FaUtensils size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-xl tracking-tight text-text-primary group-hover:text-primary transition-colors">
                Mess<span className="text-primary">Mate</span>
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary -mt-1">
                Food Tech
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-background/60 dark:bg-background/40 p-1.5 rounded-full border border-border">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  {Icon && <Icon size={12} className={active ? 'text-white' : 'text-primary'} />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions (Notifications, Theme Toggle, Profile / Auth Buttons) */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-border">
                <NotificationBell />

                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full hover:bg-surface border border-transparent hover:border-border transition-all"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-primary/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-text-primary max-w-[100px] truncate leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-text-secondary capitalize">
                      {user.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-text-secondary hover:text-status-danger hover:bg-status-danger/10 rounded-full transition-colors"
                  title="Logout"
                  aria-label="Logout"
                >
                  <FaSignOutAlt size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="text-xs font-bold text-text-primary hover:text-primary px-4 py-2 rounded-full transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && <NotificationBell />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-text-primary hover:bg-background rounded-xl transition-colors border border-border"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface/95 dark:bg-surface/95 backdrop-blur-xl animate-in slide-in-from-top duration-200 px-4 pt-3 pb-6 space-y-4">
          <div className="space-y-1">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-text-secondary hover:bg-background hover:text-text-primary'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isAuthenticated ? (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-3 px-2">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/profile"
                  className="flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl border border-border text-text-primary hover:bg-background"
                >
                  <FaUser size={12} /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-xl bg-status-danger/10 text-status-danger hover:bg-status-danger/20"
                >
                  <FaSignOutAlt size={12} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
              <Link
                to="/login"
                className="text-center text-xs font-bold text-text-primary py-2.5 rounded-xl border border-border"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-center text-xs font-bold bg-primary text-white py-2.5 rounded-xl shadow-sm"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;