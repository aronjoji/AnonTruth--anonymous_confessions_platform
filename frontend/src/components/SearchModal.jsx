import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Loader2, Hash } from 'lucide-react';
import { Link } from 'react-router-dom';
import { searchConfessions } from '../services/api';

const trendingTags = [
  { tag: 'college', color: 'from-blue-500 to-cyan-400' },
  { tag: 'relationships', color: 'from-pink-500 to-rose-400' },
  { tag: 'work', color: 'from-amber-500 to-orange-400' },
  { tag: 'family', color: 'from-green-500 to-emerald-400' },
  { tag: 'confession', color: 'from-violet-500 to-purple-400' },
  { tag: 'funny', color: 'from-yellow-500 to-amber-400' },
  { tag: 'school', color: 'from-indigo-500 to-blue-400' },
  { tag: 'crime', color: 'from-red-500 to-rose-500' },
];

const SearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setSearched(false);
    }
  }, [isOpen]);

  const doSearch = async (q) => {
    if (!q || q.length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchConfessions({ q, limit: 12 });
      setResults(res.data);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleTagClick = (tag) => {
    setQuery(tag);
    doSearch(tag);
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4"
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-2xl rounded-2xl bg-[rgba(12,14,22,0.95)] backdrop-blur-xl border border-white/[0.08] shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden z-[101]"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <Search className="w-5 h-5 text-gray-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Search confessions, topics, keywords..."
              className="flex-1 bg-transparent text-base text-white placeholder:text-gray-600 outline-none"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false); }} className="cursor-pointer">
                <X className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
              </button>
            )}
            <button onClick={onClose} className="ml-2 px-3 py-1 rounded-lg text-xs font-medium text-gray-500 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
              ESC
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!searched && !query && (
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-[#4F8CFF]" />
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trending Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((t) => (
                    <button
                      key={t.tag}
                      onClick={() => handleTagClick(t.tag)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer group"
                    >
                      <Hash className={`w-3.5 h-3.5 text-transparent bg-gradient-to-r ${t.color} bg-clip-text`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }} />
                      <span>{t.tag}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['relationship', 'school', 'work', 'crime', 'funny', 'random'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleTagClick(cat)}
                      className="px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 hover:bg-white/10 hover:text-white transition-all capitalize cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-[#4F8CFF] animate-spin" />
              </div>
            )}

            {searched && !loading && results.length === 0 && (
              <div className="py-12 text-center text-gray-600 text-sm">
                No results found for "{query}"
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                <p className="px-5 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </p>
                {results.map((c) => (
                  <Link
                    key={c._id}
                    to={`/confession/${c._id}`}
                    onClick={onClose}
                    className="flex items-start gap-3 px-5 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                      {c.userId?.anonymousName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{c.text}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-600">
                        <span>{c.userId?.anonymousName}</span>
                        <span>•</span>
                        <span className="capitalize">{c.category}</span>
                        <span>•</span>
                        <span>{c.trueVotes + c.fakeVotes} votes</span>
                        <span>•</span>
                        <span>{c.commentCount || 0} comments</span>
                      </div>
                    </div>
                    {c.image && (
                      <img src={c.image} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default SearchModal;
