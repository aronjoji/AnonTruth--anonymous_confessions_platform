import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FloatingPostButton = () => {
  const { user, openAuthModal } = useAuth();

  const handleClick = (e) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
      className="fixed bottom-24 lg:bottom-8 right-6 z-40 group"
    >
      <Link to="/post" onClick={handleClick}>
        <motion.div
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_25px_rgba(79,140,255,0.35)] cursor-pointer"
        >
          {/* Glow ping */}
          <div className="absolute inset-0 rounded-full bg-[#4F8CFF]/20 animate-ping opacity-30 pointer-events-none" />
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-br from-[#4F8CFF]/15 to-[#8B5CF6]/15 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Plus className="w-6 h-6 text-white relative z-10" />
        </motion.div>
      </Link>
      {/* Tooltip */}
      <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-3 py-1.5 rounded-lg bg-[rgba(12,14,22,0.9)] backdrop-blur-sm border border-white/10 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        Create Post
        <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-[rgba(12,14,22,0.9)]" />
      </div>
    </motion.div>
  );
};

export default FloatingPostButton;
