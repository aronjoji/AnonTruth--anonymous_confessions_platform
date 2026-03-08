import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Share2, MoreVertical, CheckCircle, XCircle, Trash2, AlertTriangle, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import Button from './Button';
import AnimatedCounter from './AnimatedCounter';
import { useFloatingEmojis } from './FloatingEmoji';
import ReportModal from './ReportModal';
import { useAuth } from '../hooks/useAuth';
import { startAnonChat } from '../services/api';
import { useState } from 'react';
import toast from './Toast';

const ConfessionCard = ({ confession, onVote, onReact, onDelete, index = 0 }) => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { spawn, FloatingEmojiContainer } = useFloatingEmojis();
  const totalVotes = confession.trueVotes + confession.fakeVotes;
  const truePercent = totalVotes > 0 ? Math.round((confession.trueVotes / totalVotes) * 100) : 50;
  const fakePercent = totalVotes > 0 ? Math.round((confession.fakeVotes / totalVotes) * 100) : 50;

  const handleReaction = (type, emoji) => {
    spawn(emoji);
    onReact && onReact(confession._id, type);
  };

  const handleStartChat = async () => {
    if (!user) return openAuthModal();
    try {
      const res = await startAnonChat(confession._id);
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      toast.error('Failed to start anonymous chat');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -60, filter: 'blur(4px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ 
          duration: 0.6, 
          delay: index * 0.08,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="glow-hover rounded-3xl"
      >
        <GlassCard className="mb-0 overflow-visible" delay={0}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.15, rotate: 5 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                {confession.userId?.anonymousName?.substring(0, 2).toUpperCase()}
              </motion.div>
              <div>
                <h4 className="font-bold text-sm">{confession.userId?.anonymousName}</h4>
                <span className="text-xs text-gray-500">{new Date(confession.createdAt).toLocaleDateString()} • {confession.category}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onDelete && (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDelete}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
                  title="Delete Neural Trace"
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              )}
              <div className="relative group/report">
                <motion.button 
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsReportModalOpen(true)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all"
                >
                  <AlertTriangle className="w-5 h-5" />
                </motion.button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover/report:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
                  Report Post
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500/90" />
                </div>
              </div>
            </div>
          </div>

          {/* Text with Show More/Less */}
          <div className="relative mb-6">
            <p className={`text-lg leading-relaxed whitespace-pre-wrap ${!isExpanded && confession.text.length > 300 ? 'max-h-[120px] overflow-hidden' : ''}`}>
              {confession.text}
            </p>
            {!isExpanded && confession.text.length > 300 && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none" />
            )}
            {confession.text.length > 300 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-accent-cyan text-sm font-bold mt-2 hover:underline cursor-pointer relative z-10"
              >
                {isExpanded ? 'Show Less ▲' : 'Show More ▼'}
              </motion.button>
            )}
          </div>

          {confession.image && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.5 }}
              className="mb-8 rounded-3xl overflow-hidden border border-white/10 glass shadow-2xl"
            >
              <img 
                src={confession.image} 
                alt="Truth Visualization" 
                className="w-full h-auto max-h-[500px] object-cover cursor-pointer transition-transform duration-700 hover:scale-[1.03]" 
                onClick={() => window.open(confession.image, '_blank')}
              />
            </motion.div>
          )}

          {/* Animated Voting Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold mb-2 uppercase tracking-wider text-gray-500">
              <span className="flex items-center gap-2">
                True (<AnimatedCounter value={truePercent} className="font-mono" />%)
              </span>
              <span className="flex items-center gap-2">
                Fake (<AnimatedCounter value={fakePercent} className="font-mono" />%)
              </span>
            </div>
            <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/10 relative">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${truePercent}%` }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                className="h-full bg-gradient-to-r from-accent-cyan to-cyan-400 relative"
                style={{ 
                  boxShadow: '0 0 15px rgba(6,182,212,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
                  animation: truePercent > fakePercent ? 'bar-glow-cyan 2s ease-in-out infinite' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
              </motion.div>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${fakePercent}%` }}
                transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                className="h-full bg-gradient-to-r from-red-400 to-red-500 ml-auto relative"
                style={{ 
                  boxShadow: '0 0 15px rgba(239,68,68,0.5), inset 0 1px 2px rgba(255,255,255,0.2)',
                  animation: fakePercent > truePercent ? 'bar-glow-red 2s ease-in-out infinite' : 'none'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent shimmer" />
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button variant="outline" className="py-2 text-sm" icon={CheckCircle} onClick={() => onVote(confession._id, 'true')}>
                True · <AnimatedCounter value={confession.trueVotes} className="font-mono ml-1" />
              </Button>
              <Button variant="outline" className="py-2 text-sm border-red-500/50 text-red-500 hover:bg-red-500/10 hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]" icon={XCircle} onClick={() => onVote(confession._id, 'fake')}>
                Fake · <AnimatedCounter value={confession.fakeVotes} className="font-mono ml-1" />
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 space-y-3">
            {/* Row 1: Comments + Reactions */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link to={`/confession/${confession._id}`} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-300 hover:text-[#4F8CFF] transition-colors">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {confession.commentCount || 0} Comments
              </Link>

              {/* Reactions */}
              <div className="flex items-center gap-1 sm:gap-2 p-0.5 sm:p-1 rounded-full bg-white/5 border border-white/10 relative">
                <FloatingEmojiContainer className="absolute inset-0" />
                {[
                  { type: 'funny', emoji: '😂', label: 'Funny' },
                  { type: 'shocking', emoji: '😲', label: 'Shocking' },
                  { type: 'sad', emoji: '😢', label: 'Sad' },
                  { type: 'crazy', emoji: '🤪', label: 'Crazy' }
                ].map((reaction) => (
                  <motion.button
                    key={reaction.type}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => handleReaction(reaction.type, reaction.emoji)}
                    className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-full hover:bg-white/10 transition-colors group relative"
                    title={reaction.label}
                  >
                    <span className="text-sm sm:text-lg leading-none">{reaction.emoji}</span>
                    {confession.reactions?.[reaction.type] > 0 && (
                      <AnimatedCounter
                        value={confession.reactions[reaction.type]}
                        className="text-[9px] sm:text-[10px] font-black font-mono text-gray-400 group-hover:text-white transition-colors"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Row 2: Chat + Share */}
            <div className="flex items-center gap-3">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleStartChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#4F8CFF]/10 border border-[#4F8CFF]/20 text-xs sm:text-sm text-[#4F8CFF] hover:bg-[#4F8CFF]/20 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Chat
              </motion.button>

              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors ml-auto cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Share
              </motion.button>
            </div>
          </div>
          
        </GlassCard>
      </motion.div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        itemId={confession._id} 
        itemType="confession" 
      />
    </>
  );
};

export default ConfessionCard;
