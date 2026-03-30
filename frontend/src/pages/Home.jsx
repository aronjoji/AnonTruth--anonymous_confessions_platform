import { useState, useEffect, useRef } from 'react';
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
    { id: 'newest', label: 'New', Icon: Clock },
    { id: 'trending', label: 'Hot', Icon: TrendingUp },
    { id: 'top', label: 'Top', Icon: ArrowUpDown },
    { id: 'controversial', label: 'Spicy', Icon: Zap },
  ];

  return (
    <PageTransition>
      <div className="max-w-[680px] mx-auto px-2 sm:px-4 pt-16 sm:pt-20 pb-24 lg:pb-16">
        {/* Sort Tabs */}
        <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg mb-3 px-2 sm:px-3 py-2 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filter === btn.id
                  ? 'bg-[#272729] text-[#d7dadc]'
                  : 'text-[#818384] hover:bg-[#272729] hover:text-[#d7dadc]'
              }`}
            >
              <btn.Icon className="w-4 h-4" />
              {btn.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
            <p className="text-[#818384] text-sm">Loading posts...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {confessions.map((confession, index) => (
              <div
                key={confession._id}
                ref={index === confessions.length - 1 ? lastElementRef : null}
              >
                <ConfessionCard 
                  confession={confession} 
                  onVote={handleVote}
                  onReact={handleReact}
                  index={index}
                />
              </div>
            ))}

            {fetchingMore && (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-[#FF4500] animate-spin" />
              </div>
            )}
            
            {!hasMore && confessions.length > 0 && (
              <div className="text-center py-8 text-[#818384] text-sm">
                You've reached the end of the feed.
              </div>
            )}

            {confessions.length === 0 && !loading && (
              <div className="text-center py-16 bg-[#1a1a1b] border border-[#343536] rounded-lg">
                <p className="text-[#818384]">No posts found. Be the first to share!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Home;
