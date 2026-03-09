import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { io } from 'socket.io-client';
import { getConfessionById, getComments, createComment, reactToComment, voteConfession, reactToConfession, SOCKET_URL } from '../services/api';
import ConfessionCard from '../components/ConfessionCard';
import CommentItem from '../components/CommentItem';
import GlassCard from '../components/GlassCard';
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
        toast.error('This neural trace has been purged by the Oracle.');
        navigate('/');
      } else if (data.type === 'comment') {
        setComments(prev => prev.filter(c => c._id !== data.id));
      }
    });

    socketRef.current.on('content_hidden', (data) => {
      if (data.id === id && data.isHidden) {
        toast.error('This neural trace has been concealed by the Oracle.');
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
      toast.error('Failed to load confession details');
    } finally {
      setLoading(false);
    }
  };

  const { user, openAuthModal } = useAuth();

  const handleVote = async (id, voteType) => {
    if (!user) return openAuthModal();
    // Optimistic update
    setConfession(prev => ({
      ...prev,
      trueVotes: voteType === 'true' ? prev.trueVotes + 1 : prev.trueVotes,
      fakeVotes: voteType === 'fake' ? prev.fakeVotes + 1 : prev.fakeVotes
    }));

    try {
      await voteConfession(id, voteType);
      toast.success('Vote submitted!');
    } catch (err) {
      toast.error('Failed to vote');
      fetchData(); // Rollback/Refresh
    }
  };

  const handleReact = async (id, reactionType) => {
    if (!user) return openAuthModal();
    // Optimistic update
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
      toast.success('Comment posted anonymously');
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
      toast.success('Reply transmitted');
      const res = await getComments(id);
      setComments(res.data);
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  const handleCommentReact = async (commentId, reactionType) => {
    if (!user) return openAuthModal();
    // Optimistic update
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
      <Loader2 className="w-12 h-12 text-accent-cyan animate-spin" />
    </div>
  );

  const rootComments = comments.filter(c => !c.parentId);

  return (
    <PageTransition>
      {confession && (
        <Helmet>
          <title>Anonymous Truth | Confession</title>
          <meta name="description" content={confession.text.substring(0, 160)} />
          <meta property="og:title" content="Anonymous Confession on AnonTruth" />
          <meta property="og:description" content={confession.text.substring(0, 120)} />
          <meta property="og:url" content={window.location.href} />
          {confession.image && <meta property="og:image" content={confession.image} />}
        </Helmet>
      )}
    <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
      {confession && (
        <ConfessionCard 
          confession={confession} 
          onVote={handleVote} 
          onReact={handleReact}
        />
      )}

      <div className="mt-12 space-y-8">
        <h3 className="text-2xl font-black flex items-center gap-3">
          <MessageSquare className="w-6 h-6 text-accent-cyan" />
          Neural Responses
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleComment} className="relative flex flex-col gap-4">
          <GlassCard className="p-0 overflow-hidden border-white/10 group focus-within:border-accent-cyan transition-all">
            {commentImagePreview && (
              <div className="relative w-full h-48 border-b border-white/10">
                <img src={commentImagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setCommentImage(null); setCommentImagePreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 backdrop-blur-md rounded-full hover:bg-black/70 transition-all"
                >
                  <ImageIcon className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <textarea
              className="w-full bg-transparent p-6 outline-none min-h-[120px] resize-none text-white placeholder:text-gray-600"
              placeholder="Add your anonymous response..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="bg-white/5 p-3 flex items-center justify-between border-t border-white/10">
              <label className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400 cursor-pointer flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                {commentImage && <span className="text-[10px] font-bold uppercase tracking-widest text-accent-violet animate-pulse">Neural Data Ready</span>}
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
              <Button className="py-2 px-6" icon={Send}>Post</Button>
            </div>
          </GlassCard>
        </form>

        {/* Comments List */}
        <div className="space-y-8">
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
            <div className="text-center py-20 opacity-30 italic font-medium">No responses yet. Break the silence.</div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default ConfessionDetail;
