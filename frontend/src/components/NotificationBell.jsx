import { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationService';

const POLL_INTERVAL = 30000; // 30 seconds

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Poll the unread count periodically, independent of whether the dropdown is open
  useEffect(() => {
    const fetchCount = () => {
      getUnreadCount()
        .then(({ data }) => setUnreadCount(data.data.count))
        .catch(() => {}); // silently ignore — a failed badge-count check shouldn't show an error toast
    };

    fetchCount();
    const interval = setInterval(fetchCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Close the dropdown when clicking anywhere outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      const { data } = await getMyNotifications({ limit: 10 });
      setNotifications(data.data.notifications);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
      );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleOpen} className="relative p-2 text-text-secondary hover:text-text-primary rounded-full transition-colors" aria-label="Notifications">
        <FaBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-status-danger text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-border max-h-96 overflow-y-auto z-50">
          <div className="flex items-center justify-between p-3 border-b border-border">
            <p className="font-bold text-sm text-text-primary">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-sm text-text-muted text-center py-6">No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className={`w-full text-left p-3 text-sm border-b border-border/50 hover:bg-background transition-colors ${
                  !n.isRead ? 'bg-primary/10' : ''
                }`}
              >
                <p className={`text-text-primary ${!n.isRead ? 'font-semibold' : ''}`}>{n.message}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;