import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Home, MapPin, Compass, PlusSquare, Search, Bell, LogOut, User, Settings, FileText, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getNotifications, markAllNotificationsRead, SOCKET_URL } from '../services/api';
import { io } from 'socket.io-client';
import { useEffect, useRef, useState, useCallback } from 'react';
import SearchModal from './SearchModal';

/* ─── Desktop Nav Link ─── */
const NavItem = ({ to, icon: Icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 group"
  >
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-0.5"
    >
      <Icon className={`w-[18px] h-[18px] transition-all duration-300 ${
        active
          ? 'text-[#4F8CFF] drop-shadow-[0_0_6px_rgba(79,140,255,0.6)]'
          : 'text-gray-500 group-hover:text-gray-300'
      }`} />
      <span className={`text-[11px] font-medium transition-colors duration-300 ${
        active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'
      }`}>
        {label}
      </span>
    </motion.div>
    {active && (
      <motion.div
        layoutId="desktop-nav-pill"
        className="absolute -bottom-[11px] left-1 right-1 h-[2px] rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] shadow-[0_0_8px_rgba(79,140,255,0.5)]"
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    )}
  </Link>
);

/* ─── Navbar ─── */
const Navbar = () => {
  const { user, logout, openAuthModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    { to: '/post', label: 'Post', icon: PlusSquare, auth: true },
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
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[rgba(8,10,18,0.88)] backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.35)] border-b border-white/[0.06]'
            : 'bg-[rgba(8,10,18,0.4)] backdrop-blur-lg border-b border-transparent'
        }`}
      >
        <div className="max-w-[1200px] mx-auto h-[56px] sm:h-[64px] flex items-center justify-between px-3 sm:px-5">

          {/* ── Left: Logo ── */}
          <Link to="/home" className="flex items-center gap-2 shrink-0 group">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_14px_rgba(79,140,255,0.25)] group-hover:shadow-[0_0_20px_rgba(79,140,255,0.4)] transition-shadow duration-300">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] bg-clip-text text-transparent">
              AnonTruth
            </span>
          </Link>

          {/* ── Center: Desktop Nav Items ── */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={isActive(item.to)}
                onClick={item.auth && !user ? (e) => { e.preventDefault(); openAuthModal(); } : undefined}
              />
            ))}
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-500 hover:text-white transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </motion.button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center hover:bg-white/5 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[14px] sm:min-w-[16px] h-3.5 sm:h-4 rounded-full bg-[#4F8CFF] text-[8px] sm:text-[9px] font-bold text-white flex items-center justify-center px-0.5 shadow-[0_0_8px_rgba(79,140,255,0.5)]">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </motion.button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-[60px] sm:top-full sm:mt-2 sm:w-80 max-h-[70vh] sm:max-h-[420px] rounded-2xl bg-[rgba(12,14,22,0.97)] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col z-[60]"
                  >
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <h4 className="text-sm font-bold">Notifications</h4>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-[11px] text-[#4F8CFF] hover:underline cursor-pointer">
                            Mark all read
                          </button>
                        )}
                        <button onClick={() => setNotifOpen(false)} className="sm:hidden p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center text-gray-600 text-sm">No notifications yet</div>
                      ) : (
                        notifications.map((n, i) => (
                          <button
                            key={n._id || i}
                            onClick={() => {
                              if (n.confessionId) navigate(`/confession/${n.confessionId}`);
                              setNotifOpen(false);
                            }}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors cursor-pointer ${
                              !n.read ? 'bg-[#4F8CFF]/5' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${
                              n.type === 'comment' || n.type === 'reply'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : n.type === 'reaction'
                                ? 'bg-amber-500/15 text-amber-400'
                                : 'bg-[#4F8CFF]/15 text-[#4F8CFF]'
                            }`}>
                              {n.type === 'comment' || n.type === 'reply' ? '💬' : n.type === 'reaction' ? '🎭' : '🗳️'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-600 mt-0.5">{timeAgo(n.createdAt)}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 rounded-full bg-[#4F8CFF] shrink-0 mt-1.5" />}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile / Auth */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-[0_0_12px_rgba(79,140,255,0.2)]">
                    {user.anonymousName?.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-300 max-w-[100px] truncate">{user.anonymousName}</span>
                </motion.button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.18 }}
                      className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-[60px] sm:top-full sm:mt-2 sm:w-56 rounded-2xl bg-[rgba(12,14,22,0.97)] backdrop-blur-2xl border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-[60]"
                    >
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-xs font-bold">
                            {user.anonymousName?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{user.anonymousName}</p>
                            <p className="text-[10px] text-gray-500">{user.role === 'admin' ? '🛡️ Admin' : '👤 Anonymous'}</p>
                          </div>
                        </div>
                        <button onClick={() => setProfileOpen(false)} className="sm:hidden p-1 rounded-lg hover:bg-white/5 cursor-pointer">
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      {/* Menu Items */}
                      <div className="py-1">
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                          <User className="w-4 h-4" /> My Profile
                        </Link>
                        <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                          <FileText className="w-4 h-4" /> My Confessions
                        </Link>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#4F8CFF] hover:bg-[#4F8CFF]/5 transition-colors">
                            <Settings className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-white/5">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link to="/login" className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-gray-400 hover:text-white transition-colors hidden sm:block">
                  Login
                </Link>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6] text-white shadow-[0_0_12px_rgba(79,140,255,0.2)] hover:shadow-[0_0_20px_rgba(79,140,255,0.35)] transition-shadow inline-block">
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ MOBILE BOTTOM NAV ═══ */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[rgba(8,10,18,0.92)] backdrop-blur-2xl border-t border-white/[0.06]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-around h-[56px] px-2 max-w-md mx-auto">
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
                  className="relative -mt-4"
                >
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(79,140,255,0.3)] ${
                    active 
                      ? 'bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6]' 
                      : 'bg-gradient-to-br from-[#4F8CFF]/80 to-[#8B5CF6]/80'
                  }`}>
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
                <item.icon className={`w-[20px] h-[20px] transition-colors duration-200 ${
                  active ? 'text-[#4F8CFF] drop-shadow-[0_0_6px_rgba(79,140,255,0.5)]' : 'text-gray-600'
                }`} />
                <span className={`text-[10px] font-medium transition-colors duration-200 ${
                  active ? 'text-white' : 'text-gray-600'
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
