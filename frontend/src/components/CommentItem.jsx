import { useState } from 'react';
import { Reply, AlertTriangle } from 'lucide-react';
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
    <div className={`space-y-3 ${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-[#343536] pl-3 sm:pl-6' : ''}`}>
      <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-4 hover:border-[#4a4a4b] transition-colors">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-[#FF4500] flex items-center justify-center text-[10px] font-bold text-white">
            {comment.userId?.anonymousName?.substring(0, 2).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-[#d7dadc]">{comment.userId?.anonymousName}</span>
          <span className="text-[10px] text-[#818384]">
            {new Date(comment.createdAt).toLocaleTimeString()}
          </span>
        </div>

        {/* Text */}
        <p className="text-sm text-[#d7dadc] leading-relaxed mb-3">
          {comment.text}
        </p>

        {/* Image */}
        {comment.image && (
          <div className="mb-3 rounded-lg overflow-hidden border border-[#343536] max-w-sm">
            <img 
              src={comment.image} 
              alt="Comment image" 
              loading="lazy"
              className="w-full h-auto max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity" 
              onClick={() => window.open(comment.image, '_blank')}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 -ml-1">
          {/* Reactions */}
          <div className="flex items-center gap-0.5">
            {[
              { type: 'funny', emoji: '😂' },
              { type: 'shocking', emoji: '😲' },
              { type: 'sad', emoji: '😢' },
              { type: 'crazy', emoji: '🤪' }
            ].map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => onReact && onReact(comment._id, reaction.type)}
                className="flex items-center gap-1 px-1.5 py-1 rounded hover:bg-[#272729] transition-colors cursor-pointer"
              >
                <span className="text-sm">{reaction.emoji}</span>
                {comment.reactions?.[reaction.type] > 0 && (
                  <span className="text-[10px] font-medium text-[#818384]">
                    {comment.reactions[reaction.type]}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          {depth < maxDepth && (
            <button 
              onClick={() => setIsReplying(!isReplying)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                isReplying ? 'text-[#FF4500]' : 'text-[#818384] hover:bg-[#272729] hover:text-[#d7dadc]'
              }`}
            >
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
          )}

          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-[#818384] hover:bg-[#272729] hover:text-[#d7dadc] transition-colors ml-auto cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Report
          </button>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              className="w-full bg-[#272729] border border-[#343536] rounded-lg p-3 outline-none focus:border-[#FF4500] transition-colors min-h-[70px] text-sm resize-none text-[#d7dadc] placeholder-[#818384]"
              placeholder={`Replying to ${comment.userId?.anonymousName}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
            />
            <div className="flex justify-end mt-2 gap-2">
              <button 
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#818384] hover:text-[#d7dadc] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <Button className="py-1.5 px-4 text-xs">Reply</Button>
            </div>
          </form>
        )}
      </div>

      <ReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        itemId={comment._id} 
        itemType="comment" 
      />

      {/* Render children */}
      {replies.length > 0 && (
        <div className="space-y-3">
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
