import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, Send } from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';
import toast from './Toast';
import { reportContent } from '../services/api';

const ReportModal = ({ isOpen, onClose, itemId, itemType }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Spam',
    'Harassment',
    'Hate speech',
    'False information',
    'Inappropriate content'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return toast.error('Please select a reason');

    try {
      setLoading(true);
      await reportContent({ reportedItemId: itemId, itemType, reason });
      toast.success('Report transmitted to the Oracle');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md relative z-[101]"
          >
            <GlassCard className="p-8 border-red-500/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-2xl text-red-500">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Neural Incident</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Report Content</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Select Violation</span>
                  <div className="grid gap-2">
                    {reasons.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReason(r)}
                        className={`w-full p-4 rounded-2xl text-left text-sm font-medium transition-all flex items-center justify-between border ${
                          reason === r 
                            ? 'bg-red-500/20 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {r}
                        {reason === r && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full py-4 bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  loading={loading}
                  icon={Send}
                >
                  Submit Report
                </Button>
                
                <p className="text-[10px] text-center text-gray-600 font-medium">
                  Reporting a truth initiates an Oracle review. Abuse of this system may result in account exile.
                </p>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ReportModal;
