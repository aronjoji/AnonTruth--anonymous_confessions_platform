import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Shield, Home, MapPin, Compass, PlusSquare, Search, Bell, LogOut, User, Settings, FileText, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markAllNotificationsRead, SOCKET_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useEffect, useRef, useState, useCallback } from 'react';
import SearchModal from './SearchModal';

const Navbar = () => {
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const socketRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getNotifications({ limit: 15 });
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) { /* silently fail */ }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    if (user) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
      socketRef.current.emit('join_user', user._id || user.id);
      socketRef.current.on('new_notification', (data) => {
        setNotifications(prev => [data.notification, ...prev].slice(0, 15));
        setUnreadCount(prev => prev + 1);
      });
    }
    return () => socketRef.current?.disconnect();
  }, [user, fetchNotifications]);

  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    setProfileOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { /* silently fail */ }
  };

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/home?sort=explore', label: 'Explore', icon: Compass },
    { to: '/nearby', label: 'Nearby', icon: MapPin },
  ];

  const isActive = (path) => {
    if (path.includes('?')) return location.pathname + location.search === path;
    return location.pathname === path && !location.search;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return 'now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <>
      {/* ═══ TOP NAVBAR ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1b] border-b border-[#343536]">
        <div className="max-w-[1200px] mx-auto h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF4500] flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-[#d7dadc] tracking-tight">
              anon<span className="text-[#FF4500]">truth</span>
            </span>
          </Link>

          {/* Center: Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-[#272729] text-[#d7dadc]'
                    : 'text-[#818384] hover:bg-[#272729] hover:text-[#d7dadc]'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <Link
              to="/post"
              onClick={!user ? (e) => { e.preventDefault(); openAuthModal(); } : undefined}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[#FF4500] text-white hover:bg-[#FF5722] transition-colors"
            >
              <PlusSquare className="w-4 h-4" />
              Create Post
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#272729] text-[#818384] hover:text-[#d7dadc] transition-colors cursor-pointer"
            >
              <Search className="w-[18px] h-[18px]" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#272729] text-[#818384] hover:text-[#d7dadc] transition-colors cursor-pointer"
              >
                <Bell className="w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-[#FF4500] text-[9px] font-bold text-white flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-[52px] sm:top-full sm:mt-1 sm:w-80 max-h-[70vh] sm:max-h-[420px] rounded-lg bg-[#1a1a1b] border border-[#343536] shadow-lg overflow-hidden flex flex-col z-[60]">
                  <div className="px-4 py-3 border-b border-[#343536] flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#d7dadc]">Notifications</h4>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="text-xs text-[#FF4500] hover:underline cursor-pointer">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="sm:hidden p-1 rounded hover:bg-[#272729] cursor-pointer">
                        <X className="w-4 h-4 text-[#818384]" />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {notifications.length === 0 ? (
                      <div className="py-12 text-center text-[#818384] text-sm">No notifications yet</div>
                    ) : (
                      notifications.map((n, i) => (
                        <button
                          key={n._id || i}
                          onClick={() => {
                            if (n.confessionId) navigate(`/confession/${n.confessionId}`);
                            setNotifOpen(false);
                          }}
                          className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#272729] transition-colors cursor-pointer ${
                            !n.read ? 'bg-[#FF4500]/5' : ''
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                            n.type === 'comment' || n.type === 'reply'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : n.type === 'reaction'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-[#FF4500]/15 text-[#FF4500]'
                          }`}>
                            {n.type === 'comment' || n.type === 'reply' ? '💬' : n.type === 'reaction' ? '🎭' : '🗳️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-[#d7dadc] leading-relaxed line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-[#818384] mt-0.5">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-[#FF4500] shrink-0 mt-1.5" />}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Auth */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 rounded-full hover:bg-[#272729] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FF4500] flex items-center justify-center text-[10px] sm:text-xs font-bold text-white">
                    {user.anonymousName?.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#d7dadc] max-w-[100px] truncate">{user.anonymousName}</span>
                </button>

                {/* Profile Dropdown */}
                {profileOpen && (
                  <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-[52px] sm:top-full sm:mt-1 sm:w-56 rounded-lg bg-[#1a1a1b] border border-[#343536] shadow-lg overflow-hidden z-[60]">
                    <div className="px-4 py-3 border-b border-[#343536] flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-[#FF4500] flex items-center justify-center text-xs font-bold text-white">
                          {user.anonymousName?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#d7dadc]">{user.anonymousName}</p>
                          <p className="text-[10px] text-[#818384]">{user.role === 'admin' ? '🛡️ Admin' : '👤 Anonymous'}</p>
                        </div>
                      </div>
                      <button onClick={() => setProfileOpen(false)} className="sm:hidden p-1 rounded hover:bg-[#272729] cursor-pointer">
                        <X className="w-4 h-4 text-[#818384]" />
                      </button>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#818384] hover:text-[#d7dadc] hover:bg-[#272729] transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#818384] hover:text-[#d7dadc] hover:bg-[#272729] transition-colors">
                        <FileText className="w-4 h-4" /> My Confessions
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF4500] hover:bg-[#FF4500]/5 transition-colors">
                          <Settings className="w-4 h-4" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-[#343536]">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/login" className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-[#818384] hover:text-[#d7dadc] transition-colors hidden sm:block">
                  Log In
                </Link>
                <Link to="/register" className="px-3 py-1.5 rounded-full text-[11px] sm:text-sm font-semibold bg-[#FF4500] text-white hover:bg-[#FF5722] transition-colors whitespace-nowrap">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE BOTTOM NAV ═══ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a1b] border-t border-[#343536]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-14 px-2 max-w-md mx-auto">
          {[
            { to: '/home', icon: Home, label: 'Home' },
            { to: '/home?sort=explore', icon: Compass, label: 'Explore' },
            { to: '/post', icon: PlusSquare, label: 'Post', special: true, auth: true },
            { to: '/nearby', icon: MapPin, label: 'Nearby' },
            { to: '/profile', icon: User, label: 'Profile', auth: true },
          ].map((item) => {
            const active = isActive(item.to);
            if (item.special) {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={item.auth && !user ? (e) => { e.preventDefault(); openAuthModal(); } : undefined}
                  className="relative -mt-3"
                >
                  <div className="w-11 h-11 rounded-full bg-[#FF4500] flex items-center justify-center shadow-lg">
                    <PlusSquare className="w-5 h-5 text-white" />
                  </div>
                </Link>
              );
            }
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={item.auth && !user ? (e) => { e.preventDefault(); openAuthModal(); } : undefined}
                className="flex flex-col items-center gap-0.5 py-1 min-w-[48px]"
              >
                <item.icon className={`w-5 h-5 transition-colors ${
                  active ? 'text-[#FF4500]' : 'text-[#818384]'
                }`} />
                <span className={`text-[10px] font-medium transition-colors ${
                  active ? 'text-[#d7dadc]' : 'text-[#818384]'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};

export default Navbar;
