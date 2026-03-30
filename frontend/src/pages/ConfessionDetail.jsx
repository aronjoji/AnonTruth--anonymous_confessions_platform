import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getConfessionById, getComments, createComment, reactToComment, voteConfession, reactToConfession, SOCKET_URL } from '../services/api';
import ConfessionCard from '../components/ConfessionCard';
import CommentItem from '../components/CommentItem';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../hooks/useAuth';
import { Send, MessageSquare, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from '../components/Toast';
import { Helmet } from 'react-helmet-async';

const ConfessionDetail = () => {
  const { id } = useParams();
  const [confession, setConfession] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentImage, setCommentImage] = useState(null);
  const [commentImagePreview, setCommentImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });

    socketRef.current.on('content_deleted', (data) => {
      if (data.id === id) {
        toast.error('This post has been removed.');
        navigate('/');
      } else if (data.type === 'comment') {
        setComments(prev => prev.filter(c => c._id !== data.id));
      }
    });

    socketRef.current.on('content_hidden', (data) => {
      if (data.id === id && data.isHidden) {
        toast.error('This post has been hidden.');
        navigate('/');
      } else if (data.type === 'comment' && data.isHidden) {
        setComments(prev => prev.filter(c => c._id !== data.id));
      }
    });

    socketRef.current.on('content_updated', (data) => {
      if (data.id === id) {
        setConfession(prev => ({ ...prev, text: data.text }));
      } else if (data.type === 'comment') {
        setComments(prev => prev.map(c => c._id === data.id ? { ...c, text: data.text } : c));
      }
    });

    socketRef.current.on('reaction_update', (data) => {
      if (data.confessionId === id) {
        setConfession(prev => ({ ...prev, reactions: data.reactions }));
      }
    });

    socketRef.current.on('comment_reaction_update', (data) => {
      if (data.confessionId === id) {
        setComments(prev => prev.map(c => 
          c._id === data.commentId ? { ...c, reactions: data.reactions } : c
        ));
      }
    });

    return () => socketRef.current?.disconnect();
  }, [id, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image too large! (Max 5MB)');
      setCommentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [confRes, commRes] = await Promise.all([
        getConfessionById(id),
        getComments(id)
      ]);
      setConfession(confRes.data);
      setComments(commRes.data);
    } catch (err) {
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const { user, openAuthModal } = useAuth();

  const handleVote = async (id, voteType) => {
    if (!user) return openAuthModal();
    setConfession(prev => ({
      ...prev,
      trueVotes: voteType === 'true' ? prev.trueVotes + 1 : prev.trueVotes,
      fakeVotes: voteType === 'fake' ? prev.fakeVotes + 1 : prev.fakeVotes
    }));

    try {
      await voteConfession(id, voteType);
    } catch (err) {
      toast.error('Failed to vote');
      fetchData();
    }
  };

  const handleReact = async (id, reactionType) => {
    if (!user) return openAuthModal();
    setConfession(prev => {
      const reactions = { ...prev.reactions };
      reactions[reactionType] = (reactions[reactionType] || 0) + 1;
      return { ...prev, reactions };
    });

    try {
      await reactToConfession(id, reactionType);
    } catch (err) {
      toast.error('Reaction failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return openAuthModal();
    if (!newComment.trim() && !commentImage) return;
    try {
      const formData = new FormData();
      formData.append('confessionId', id);
      formData.append('text', newComment);
      if (commentImage) formData.append('image', commentImage);

      await createComment(formData);
      setNewComment('');
      setCommentImage(null);
      setCommentImagePreview(null);
      toast.success('Comment posted');
      const res = await getComments(id);
      setComments(res.data);
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleReply = async (parentId, text) => {
    if (!user) return openAuthModal();
    try {
      const formData = new FormData();
      formData.append('confessionId', id);
      formData.append('text', text);
      formData.append('parentId', parentId);

      await createComment(formData);
      toast.success('Reply posted');
      const res = await getComments(id);
      setComments(res.data);
    } catch (err) {
      toast.error('Failed to reply');
    }
  };

  const handleCommentReact = async (commentId, reactionType) => {
    if (!user) return openAuthModal();
    setComments(prev => prev.map(c => {
      if (c._id === commentId) {
        const reactions = { ...c.reactions };
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        return { ...c, reactions };
      }
      return c;
    }));

    try {
      await reactToComment(commentId, reactionType);
    } catch (err) {
      toast.error('Reaction failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
    </div>
  );

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <PageTransition>
      {confession && (
        <Helmet>
          <title>AnonTruth | Confession</title>
          <meta name="description" content={confession.text.substring(0, 160)} />
          <meta property="og:title" content="Anonymous Confession on AnonTruth" />
          <meta property="og:description" content={confession.text.substring(0, 120)} />
          <meta property="og:url" content={window.location.href} />
          {confession.image && <meta property="og:image" content={confession.image} />}
        </Helmet>
      )}
    <div className="max-w-[680px] mx-auto px-2 sm:px-4 pt-16 sm:pt-20 pb-24 lg:pb-16">
      {confession && (
        <ConfessionCard 
          confession={confession} 
          onVote={handleVote} 
          onReact={handleReact}
        />
      )}

      <div className="mt-6 space-y-4">
        <h3 className="text-base font-bold text-[#d7dadc] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#FF4500]" />
          Comments ({comments.length})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleComment}>
          <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg overflow-hidden focus-within:border-[#FF4500] transition-colors">
            {commentImagePreview && (
              <div className="relative w-full h-40 border-b border-[#343536]">
                <img src={commentImagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setCommentImage(null); setCommentImagePreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <textarea
              className="w-full bg-transparent p-4 outline-none min-h-[100px] resize-none text-[#d7dadc] text-sm placeholder-[#818384]"
              placeholder="What are your thoughts?"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="bg-[#272729] p-2.5 flex items-center justify-between border-t border-[#343536]">
              <label className="p-1.5 hover:bg-[#343536] rounded-lg transition-colors text-[#818384] cursor-pointer flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-4 h-4" />
                {commentImage && <span className="font-medium text-[#FF4500]">Image added</span>}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              <Button className="py-1.5 px-5 text-xs" icon={Send}>Comment</Button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-3">
          {rootComments.map(comment => (
            <CommentItem 
              key={comment._id} 
              comment={comment} 
              allComments={comments}
              onReply={handleReply}
              onReact={handleCommentReact}
            />
          ))}
          {comments.length === 0 && (
            <div className="text-center py-12 text-[#818384] text-sm">
              No comments yet. Be the first to respond.
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default ConfessionDetail;
