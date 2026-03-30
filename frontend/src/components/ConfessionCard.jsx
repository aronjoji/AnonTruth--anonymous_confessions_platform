import { MessageSquare, Share2, AlertTriangle, MessageCircle, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ReportModal from './ReportModal';
import { useAuth } from '../hooks/useAuth';
import { startAnonChat } from '../services/api';
import { useState, memo } from 'react';
import toast from './Toast';
import ShareModal from './ShareModal';

const ConfessionCard = ({ confession, onVote, onReact, onDelete, index = 0 }) => {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voteCooldown, setVoteCooldown] = useState(false);

  const handleVote = (voteType) => {
    if (voteCooldown) return;
    if (!user) return openAuthModal();
    setVoteCooldown(true);
    onVote(confession._id, voteType);
    setTimeout(() => setVoteCooldown(false), 800);
  };

  const netVotes = confession.trueVotes - confession.fakeVotes;

  const handleStartChat = async () => {
    if (!user) return openAuthModal();
    try {
      const res = await startAnonChat(confession._id);
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      toast.error('Failed to start anonymous chat');
    }
  };

  const reactionEmojis = [
    { type: 'funny', emoji: '😂' },
    { type: 'shocking', emoji: '😲' },
    { type: 'sad', emoji: '😢' },
    { type: 'crazy', emoji: '🤪' }
  ];

  return (
    <>
      <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg hover:border-[#4a4a4b] transition-colors duration-150 overflow-hidden">
        <div className="flex">
          {/* ── Vote Sidebar ── */}
          <div className="flex flex-col items-center gap-0.5 px-2 sm:px-3 py-3 bg-[#161617] min-w-[40px] sm:min-w-[48px]">
            <button
              onClick={() => handleVote('true')}
              disabled={voteCooldown}
              className={`vote-btn hover:text-[#FF4500] rounded ${voteCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="True"
            >
              <ArrowBigUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <span className={`text-xs sm:text-sm font-bold tabular-nums ${
              netVotes > 0 ? 'text-[#FF4500]' : netVotes < 0 ? 'text-[#7193FF]' : 'text-[#818384]'
            }`}>
              {netVotes}
            </span>
            <button
              onClick={() => handleVote('fake')}
              disabled={voteCooldown}
              className={`vote-btn hover:text-[#7193FF] rounded ${voteCooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Fake"
            >
              <ArrowBigDown className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* ── Card Content ── */}
          <div className="flex-1 py-2 sm:py-3 pr-3 sm:pr-4 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1.5 sm:mb-2 text-xs text-[#818384]">
              <span className="px-1.5 py-0.5 rounded bg-[#272729] text-[10px] sm:text-xs font-semibold text-[#d7dadc] uppercase">
                {confession.category}
              </span>
              <span>•</span>
              <span>Posted by <span className="hover:underline cursor-pointer">{confession.userId?.anonymousName || 'Anonymous'}</span></span>
              <span>•</span>
              <span className="hidden sm:inline">{new Date(confession.createdAt).toLocaleDateString()}</span>
              <span className="sm:hidden">{timeAgo(confession.createdAt)}</span>
            </div>

            {/* Text Content */}
            <div className="mb-2 sm:mb-3">
              <p className={`text-sm sm:text-[15px] leading-relaxed text-[#d7dadc] whitespace-pre-wrap ${
                !isExpanded && confession.text.length > 300 ? 'max-h-[120px] overflow-hidden relative' : ''
              }`}>
                {confession.text}
              </p>
              {!isExpanded && confession.text.length > 300 && (
                <div className="h-8 bg-gradient-to-t from-[#1a1a1b] to-transparent -mt-8 relative" />
              )}
              {confession.text.length > 300 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-[#4F8CFF] text-xs font-semibold mt-1 hover:underline cursor-pointer"
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>

            {/* Image */}
            {confession.image && (
              <div className="mb-2 sm:mb-3 rounded-lg overflow-hidden border border-[#343536]">
                <img
                  src={confession.image}
                  alt="Post image"
                  loading="lazy"
                  className="w-full h-auto max-h-[400px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(confession.image, '_blank')}
                />
              </div>
            )}

            {/* Reactions Row */}
            <div className="flex items-center gap-1 mb-2 sm:mb-3">
              {reactionEmojis.map((reaction) => (
                <button
                  key={reaction.type}
                  onClick={() => {
                    if (!user) return openAuthModal();
                    onReact && onReact(confession._id, reaction.type);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-[#272729] transition-colors text-xs cursor-pointer"
                >
                  <span className="text-sm leading-none">{reaction.emoji}</span>
                  {confession.reactions?.[reaction.type] > 0 && (
                    <span className="text-[#818384] font-medium tabular-nums">
                      {confession.reactions[reaction.type]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-1 flex-wrap -ml-1.5">
              <Link
                to={`/confession/${confession._id}`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-[#272729] text-[#818384] hover:text-[#d7dadc] transition-colors text-xs font-semibold"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{confession.commentCount || 0} Comments</span>
              </Link>

              <button
                onClick={handleStartChat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-[#272729] text-[#818384] hover:text-[#d7dadc] transition-colors text-xs font-semibold cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-[#272729] text-[#818384] hover:text-[#d7dadc] transition-colors text-xs font-semibold cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-[#272729] text-[#818384] hover:text-[#d7dadc] transition-colors text-xs font-semibold cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Report</span>
              </button>

              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-red-500/10 text-[#818384] hover:text-red-400 transition-colors text-xs font-semibold cursor-pointer ml-auto"
                >
                  <span>🗑️</span>
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        itemId={confession._id}
        itemType="confession"
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        confession={confession}
      />
    </>
  );
};

// Helper
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default memo(ConfessionCard);
