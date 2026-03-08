import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, ThumbsUp, Reply, Smile, Trash2, AlertTriangle } from 'lucide-react';
import GlassCard from './GlassCard';
import Button from './Button';
import ReportModal from './ReportModal';
import { useAuth } from '../hooks/useAuth';

const CommentItem = ({ comment, allComments, onReply, onReact, depth = 0 }) => {
  const { user, openAuthModal } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  
  const replies = allComments.filter(c => c.parentId === comment._id);
  const maxDepth = 3;

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!user) return openAuthModal();
    if (!replyText.trim()) return;
    
    await onReply(comment._id, replyText);
    setReplyText('');
    setIsReplying(false);
  };

  return (
    <div className={`space-y-4 ${depth > 0 ? 'ml-6 md:ml-12 border-l border-white/5 pl-4 md:pl-8' : ''}`}>
      <GlassCard className="p-6 relative group border-white/5 hover:border-accent-cyan/20 transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet/20 to-accent-cyan/10 flex items-center justify-center text-[10px] font-bold text-accent-violet`}>
              {comment.userId?.anonymousName?.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h5 className="font-bold text-sm text-gray-300">{comment.userId?.anonymousName}</h5>
              <span className="text-[10px] text-gray-600 uppercase tracking-wider">
                {new Date(comment.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             {/* Future: Add delete for admin/owner */}
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {comment.text}
        </p>

        {comment.image && (
          <div className="mb-6 rounded-2xl overflow-hidden border border-white/10 glass max-w-sm">
            <img 
              src={comment.image} 
              alt="Comment Visual" 
              className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-500" 
              onClick={() => window.open(comment.image, '_blank')}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-4 border-t border-white/5">
          {/* Unified Reaction Bar for Comments */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
            {[
              { type: 'funny', emoji: '😂' },
              { type: 'shocking', emoji: '😲' },
              { type: 'sad', emoji: '😢' },
              { type: 'crazy', emoji: '🤪' }
            ].map((reaction) => (
              <motion.button
                key={reaction.type}
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onReact && onReact(comment._id, reaction.type)}
                className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-white/10 transition-colors group"
              >
                <span className="text-sm">{reaction.emoji}</span>
                {comment.reactions?.[reaction.type] > 0 && (
                  <span className="text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors">
                    {comment.reactions[reaction.type]}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
          
          {depth < maxDepth && (
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-2 text-xs transition-colors ${isReplying ? 'text-accent-cyan' : 'text-gray-500 hover:text-white'}`}
            >
              <Reply className="w-4 h-4" /> Reply
            </button>
          )}

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-red-500 transition-colors ml-auto"
          >
            <AlertTriangle className="w-4 h-4" /> Report
          </button>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {isReplying && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleReplySubmit}
              className="mt-6 overflow-hidden"
            >
              <textarea
                className="w-full glass p-4 rounded-2xl outline-none focus:border-accent-cyan transition-all min-h-[80px] text-sm resize-none border-white/10"
                placeholder={`Replying to ${comment.userId?.anonymousName}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end mt-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setIsReplying(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <Button className="py-2 px-4 text-xs">Send Reply</Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </GlassCard>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        itemId={comment._id} 
        itemType="comment" 
      />

      {/* Render children */}
      {replies.length > 0 && (
        <div className="space-y-4">
          {replies.map(reply => (
            <CommentItem 
              key={reply._id} 
              comment={reply} 
              allComments={allComments}
              onReply={onReply}
              onReact={onReact}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
