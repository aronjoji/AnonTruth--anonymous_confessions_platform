import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "", delay = 0 }) => {
  const cardRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--glow-x', `${x}px`);
    card.style.setProperty('--glow-y', `${y}px`);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseMove={handleMouseMove}
      className={`rounded-3xl p-4 sm:p-6 border border-white/[0.08] transition-all duration-300 group relative overflow-hidden
        hover:border-accent-cyan/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] ${className}`}
      style={{
        willChange: 'transform, opacity',
        background: 'rgba(10, 12, 20, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Mouse-tracking glow */}
      <div
        className="pointer-events-none absolute w-[200px] h-[200px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          left: 'var(--glow-x, 50%)',
          top: 'var(--glow-y, 50%)',
          transform: 'translate(-50%, -50%)',
        }}
      />
      {/* Inner shimmer */}
      <div className="absolute inset-0 shimmer rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      {/* Content — always on top */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default GlassCard;
