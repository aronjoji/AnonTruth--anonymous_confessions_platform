import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getConfessions, voteConfession, reactToConfession, SOCKET_URL } from '../services/api';
import ConfessionCard from '../components/ConfessionCard';
import PageTransition from '../components/PageTransition';
import { TrendingUp, Clock, ArrowUpDown, Zap, Loader2 } from 'lucide-react';
import toast from '../components/Toast';
import { io } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { user, openAuthModal } = useAuth();
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const observer = useRef();
  const socketRef = useRef(null);

  const lastElementRef = (node) => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  };

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 5
    });

    socketRef.current.on('vote_update', (data) => {
      setConfessions(prev => prev.map(c => 
        c._id === data.confessionId 
          ? { ...c, trueVotes: data.trueVotes, fakeVotes: data.fakeVotes } 
          : c
      ));
    });

    socketRef.current.on('reaction_update', (data) => {
      setConfessions(prev => prev.map(c => 
        c._id === data.confessionId ? { ...c, reactions: data.reactions } : c
      ));
    });

    socketRef.current.on('content_deleted', (data) => {
      if (data.type === 'confession') {
        setConfessions(prev => prev.filter(c => c._id !== data.id));
      }
    });

    socketRef.current.on('content_hidden', (data) => {
      if (data.type === 'confession' && data.isHidden) {
        setConfessions(prev => prev.filter(c => c._id !== data.id));
      } else if (data.type === 'confession' && !data.isHidden) {
        fetchConfessions(1, true); 
      }
    });

    socketRef.current.on('content_updated', (data) => {
      if (data.type === 'confession') {
        setConfessions(prev => prev.map(c => 
          c._id === data.id ? { ...c, text: data.text } : c
        ));
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off('vote_update');
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    setPage(1);
    setConfessions([]);
    setHasMore(true);
    fetchConfessions(1, true);
  }, [filter]);

  useEffect(() => {
    if (page > 1) {
      fetchConfessions(page);
    }
  }, [page]);

  const fetchConfessions = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setFetchingMore(true);

      const res = await getConfessions({ sort: filter, page: pageNum, limit: 10 });
      
      if (res.data.length < 10) setHasMore(false);
      
      setConfessions(prev => isInitial ? res.data : [...prev, ...res.data]);
    } catch (err) {
      toast.error('Failed to load confessions');
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  const handleVote = async (id, voteType) => {
    if (!user) return openAuthModal();
    setConfessions(prev => prev.map(c => {
      if (c._id === id) {
        return {
          ...c,
          trueVotes: voteType === 'true' ? c.trueVotes + 1 : c.trueVotes,
          fakeVotes: voteType === 'fake' ? c.fakeVotes + 1 : c.fakeVotes
        };
      }
      return c;
    }));

    try {
      await voteConfession(id, voteType);
      toast.success('Vote submitted!');
    } catch (err) {
      toast.error('Failed to vote');
      fetchConfessions(1, true); 
    }
  };

  const handleReact = async (id, reactionType) => {
    if (!user) return openAuthModal();
    setConfessions(prev => prev.map(c => {
      if (c._id === id) {
        const reactions = { ...c.reactions };
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        return { ...c, reactions };
      }
      return c;
    }));

    try {
      await reactToConfession(id, reactionType);
    } catch (err) {
      toast.error('Reaction failed');
    }
  };

  const filterButtons = [
    { id: 'newest', label: 'Newest', Icon: Clock },
    { id: 'trending', label: 'Trending', Icon: TrendingUp },
    { id: 'top', label: 'Top', Icon: ArrowUpDown },
    { id: 'controversial', label: 'Controversial', Icon: Zap },
  ];

  return (
    <PageTransition>
      <div className="max-w-[800px] mx-auto px-3 sm:px-6 pt-20 sm:pt-24 pb-24 lg:pb-20 relative">
        {/* Radial glow behind feed */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-cyan/[0.03] blur-[100px] rounded-full pointer-events-none" />
        {/* Segmented Feed Control */}
        <div className="mb-6 sm:mb-8 -mx-3 sm:mx-0 px-3 sm:px-0 overflow-x-auto scrollbar-hide">
          <div className="relative inline-flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
            {filterButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`relative px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300 cursor-pointer z-10 ${
                  filter === btn.id ? 'text-black' : 'text-gray-400 hover:text-white'
                }`}
              >
                {filter === btn.id && (
                  <motion.div
                    layoutId="feed-tab-bg"
                    className="absolute inset-0 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                  <btn.Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {btn.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-10 h-10 text-accent-cyan" />
            </motion.div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-gray-500 font-medium"
            >
              Scanning the neural network...
            </motion.p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {confessions.map((confession, index) => (
                <motion.div
                  key={confession._id}
                  ref={index === confessions.length - 1 ? lastElementRef : null}
                  layout
                  exit={{ opacity: 0, x: 60, filter: 'blur(5px)', transition: { duration: 0.3 } }}
                >
                  <ConfessionCard 
                    confession={confession} 
                    onVote={handleVote}
                    onReact={handleReact}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {fetchingMore && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center py-8"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-6 h-6 text-accent-cyan" />
                </motion.div>
              </motion.div>
            )}
            
            {!hasMore && confessions.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12 text-gray-600 font-medium italic"
              >
                You've reached the end of the void.
              </motion.div>
            ) : confessions.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 glass rounded-3xl border-dashed border-white/10"
              >
                <p className="text-gray-500">No truths found in this dimension yet.</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Home;
