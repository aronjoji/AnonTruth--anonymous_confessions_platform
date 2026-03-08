import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, ArrowRight, Ghost } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import GlassCard from './GlassCard';

const AuthModal = () => {
  const { showAuthModal, closeAuthModal } = useAuth();

  if (!showAuthModal) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden"
        >
          <GlassCard className="p-8 border-accent-cyan/20">
            <button 
              onClick={closeAuthModal}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="inline-flex p-4 bg-accent-cyan/10 rounded-2xl mb-6">
                <Shield className="w-10 h-10 text-accent-cyan" />
              </div>
              <h2 className="text-3xl font-black mb-3">Neural Access Denied</h2>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto">
                You must establish a secure anonymous connection to interact with the shadows.
              </p>

              <div className="grid gap-4">
                <Link to="/register" onClick={closeAuthModal}>
                  <Button className="w-full py-4 text-lg" icon={Ghost}>
                    Create Ghost Identity
                  </Button>
                </Link>
                <Link to="/login" onClick={closeAuthModal}>
                  <button className="w-full py-4 rounded-2xl border border-white/10 hover:border-accent-cyan/50 hover:bg-white/5 transition-all text-sm font-bold text-gray-400 hover:text-white">
                    Decrypt Existing Session
                  </button>
                </Link>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-gray-600 uppercase tracking-[0.2em]">
                <Lock className="w-3 h-3" /> Secure End-to-End Neural Link
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
