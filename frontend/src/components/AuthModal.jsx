import { AnimatePresence, motion } from 'framer-motion';
import { X, Shield, Lock, Ghost } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';

const AuthModal = () => {
  const { showAuthModal, closeAuthModal } = useAuth();

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/70"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-sm bg-[#1a1a1b] border border-[#343536] rounded-lg p-6 sm:p-8"
        >
          <button 
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded hover:bg-[#272729] transition-colors text-[#818384] hover:text-[#d7dadc] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center">
            <div className="inline-flex p-3 bg-[#FF4500]/10 rounded-xl mb-4">
              <Shield className="w-8 h-8 text-[#FF4500]" />
            </div>
            <h2 className="text-xl font-bold text-[#d7dadc] mb-2">Sign in required</h2>
            <p className="text-sm text-[#818384] mb-6">
              Create an anonymous account or sign in to continue.
            </p>

            <div className="grid gap-3">
              <Link to="/register" onClick={closeAuthModal}>
                <Button className="w-full py-3" icon={Ghost}>
                  Create Account
                </Button>
              </Link>
              <Link to="/login" onClick={closeAuthModal}>
                <button className="w-full py-3 rounded-full border border-[#343536] hover:border-[#4a4a4b] hover:bg-[#272729] transition-colors text-sm font-semibold text-[#d7dadc] cursor-pointer">
                  Log In
                </button>
              </Link>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#818384] uppercase tracking-wider">
              <Lock className="w-3 h-3" /> Your identity stays anonymous
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
