import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Share2, Download, Send, Twitter, MessageCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
import toast from './Toast';
import { shareConfession } from '../services/api';

const ShareModal = ({ isOpen, onClose, confession }) => {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!confession || !mounted) return null;

  const shareUrl = `${window.location.origin}/post/${confession._id}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Check out this anonymous confession on AnonTruth: "${confession.text.substring(0, 100)}..."`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
    incrementShare();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Anonymous Confession',
          text: confession.text,
          url: shareUrl,
        });
        incrementShare();
      } catch (err) {
        if (err.name !== 'AbortError') toast.error('Sharing failed');
      }
    }
  };

  const incrementShare = async () => {
    try {
      await shareConfession(confession._id);
    } catch (err) {
      console.error('Failed to increment share count', err);
    }
  };

  const downloadImage = async () => {
    if (cardRef.current === null) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = `anontruth-confession-${confession._id.substring(0, 6)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Image downloaded!');
      incrementShare();
    } catch (err) {
      toast.error('Failed to generate image');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const socialLinks = [
    { name: 'WhatsApp', icon: MessageCircle, color: 'bg-green-500', url: `https://wa.me/?text=${encodedText}%20${encodedUrl}` },
    { name: 'Twitter', icon: Twitter, color: 'bg-blue-400', url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` },
    { name: 'Telegram', icon: Send, color: 'bg-blue-500', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0c0e16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl my-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#4F8CFF]" /> Share Truth
              </h3>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Share Options Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                >
                  <div className="p-3 rounded-xl bg-gray-500/20 text-gray-400 group-hover:text-white group-hover:bg-gray-500/30 transition-all">
                    <Copy className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-400">Copy Link</span>
                </button>

                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => incrementShare()}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                  >
                    <div className={`p-3 rounded-xl ${social.color}/20 text-${social.color.replace('bg-', '')} group-hover:scale-110 transition-transform`}>
                      <social.icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-gray-400">{social.name}</span>
                  </a>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {navigator.share && (
                  <button
                    onClick={handleNativeShare}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#4F8CFF] hover:bg-[#3b7ff5] text-white font-bold transition-all shadow-lg shadow-[#4F8CFF]/20"
                  >
                    <Share2 className="w-5 h-5" /> More Share Options
                  </button>
                )}
                <button
                  onClick={downloadImage}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all disabled:opacity-50"
                >
                  <Download className={`w-5 h-5 ${isGenerating ? 'animate-bounce' : ''}`} />
                  {isGenerating ? 'Generating Image...' : 'Download Share Card'}
                </button>
              </div>

              {/* Hidden Share Card for Export */}
              <div className="fixed left-[-9999px] top-[-9999px] pointer-events-none">
                <div 
                  ref={cardRef}
                  className="w-[500px] p-10 bg-[#09090b] relative overflow-hidden flex flex-col items-center text-center justify-center"
                  style={{ minHeight: '600px' }}
                >
                  {/* Background Accents */}
                  <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] opacity-20 bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] blur-[100px]" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F8CFF] to-[#8B5CF6]" />
                  
                  <div className="relative z-10 w-full space-y-12">
                    {/* Header */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F8CFF] to-[#8B5CF6] flex items-center justify-center">
                        <Share2 className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-2xl font-black tracking-tighter text-white">AnonTruth</h4>
                      <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-[#4F8CFF]">
                        Anonymous Confession
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-[#12141c]/60 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 sm:p-12 shadow-2xl relative">
                      <div className="absolute -top-4 -left-4 text-6xl text-white/5 font-serif">"</div>
                      <p className="text-2xl sm:text-3xl font-medium leading-relaxed text-white drop-shadow-md">
                        {confession.text}
                      </p>
                      <div className="absolute -bottom-10 -right-4 text-6xl text-white/5 font-serif rotate-180">"</div>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500 text-sm font-medium">Read the full truth at</p>
                      <p className="text-lg font-bold text-white opacity-80">anontruth.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(modalContent, document.body) : null;
};

export default ShareModal;
