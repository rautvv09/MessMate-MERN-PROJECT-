import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/NotificationBell';

const Navbar = () => {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/dashboard', label: 'Find Mess' },
    { to: '/bookings/me', label: 'My Bookings' },
    { to: '/profile', label: 'Profile' },
  ];

  const ownerLinks = [
    { to: '/owner/dashboard', label: 'Dashboard' },
  ];

  const links = user?.role === 'owner' ? ownerLinks : studentLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to={isAuthenticated ? (user.role === 'owner' ? '/owner/dashboard' : '/dashboard') : '/'} className="font-bold text-lg text-emerald-600">
          MessMate
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-5">
              {links.map((link) => (
                <Link key={link.to} to={link.to} className="text-sm font-medium text-gray-600 hover:text-emerald-600">
                  {link.label}
                </Link>
              ))}
            </div>

            <NotificationBell />

            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-semibold text-emerald-600">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500">
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-emerald-600">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;