import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/* ─── Toast Context ─── */
const ToastContext = createContext(null);
let externalAddToast = () => {};

/* ─── Toast Item ─── */
const ToastItem = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const icons = {
    success: <CheckCircle className="w-[18px] h-[18px]" />,
    error: <XCircle className="w-[18px] h-[18px]" />,
    warning: <AlertTriangle className="w-[18px] h-[18px]" />,
    info: <Info className="w-[18px] h-[18px]" />,
  };

  const colors = {
    success: {
      border: 'border-emerald-500/30',
      icon: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
      bar: 'bg-gradient-to-r from-emerald-400 to-cyan-400',
    },
    error: {
      border: 'border-red-500/30',
      icon: 'text-red-400',
      glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
      bar: 'bg-gradient-to-r from-red-400 to-rose-500',
    },
    warning: {
      border: 'border-amber-500/30',
      icon: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
      bar: 'bg-gradient-to-r from-amber-400 to-orange-400',
    },
    info: {
      border: 'border-[#4F8CFF]/30',
      icon: 'text-[#4F8CFF]',
      glow: 'shadow-[0_0_20px_rgba(79,140,255,0.15)]',
      bar: 'bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6]',
    },
  };

  const style = colors[toast.type] || colors.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 80, scale: 0.9, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`relative w-full max-w-[380px] rounded-2xl overflow-hidden bg-[rgba(12,14,22,0.92)] backdrop-blur-xl border ${style.border} ${style.glow}`}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
        className={`absolute top-0 left-0 right-0 h-[2px] origin-left ${style.bar}`}
      />

      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className={`shrink-0 mt-0.5 ${style.icon}`}>
          {toast.icon || icons[toast.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-gray-200 font-medium leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="shrink-0 mt-0.5 p-0.5 rounded-md hover:bg-white/5 text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

/* ─── Toast Container ─── */
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }].slice(-5)); // max 5 toasts
    return id;
  }, []);

  useEffect(() => {
    externalAddToast = addToast;
  }, [addToast]);

  return createPortal(
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

/* ─── Toast API (drop-in replacement for react-hot-toast) ─── */
const toast = (message, options = {}) => {
  return externalAddToast({ message, type: 'info', ...options });
};

toast.success = (message, options = {}) => {
  return externalAddToast({ message, type: 'success', ...options });
};

toast.error = (message, options = {}) => {
  return externalAddToast({ message, type: 'error', ...options });
};

toast.warning = (message, options = {}) => {
  return externalAddToast({ message, type: 'warning', ...options });
};

toast.info = (message, options = {}) => {
  return externalAddToast({ message, type: 'info', ...options });
};

export default toast;
