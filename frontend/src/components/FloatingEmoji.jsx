import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const FloatingEmoji = ({ emoji, id }) => {
  return (
    <motion.span
      key={id}
      initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      animate={{
        opacity: 0,
        y: -80,
        x: Math.random() * 40 - 20,
        scale: 1.5,
        rotate: Math.random() * 30 - 15,
      }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className="absolute text-2xl pointer-events-none z-50"
      style={{ willChange: 'transform, opacity' }}
    >
      {emoji}
    </motion.span>
  );
};

// Container that manages floating emojis
export const useFloatingEmojis = () => {
  const [emojis, setEmojis] = useState([]);

  const spawn = (emoji) => {
    const id = Date.now() + Math.random();
    setEmojis((prev) => [...prev, { emoji, id }]);

    // Auto-cleanup after animation
    setTimeout(() => {
      setEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 1000);
  };

  const FloatingEmojiContainer = ({ className = '' }) => (
    <div className={`relative ${className}`}>
      <AnimatePresence>
        {emojis.map((e) => (
          <FloatingEmoji key={e.id} emoji={e.emoji} id={e.id} />
        ))}
      </AnimatePresence>
    </div>
  );

  return { spawn, FloatingEmojiContainer };
};

export default FloatingEmoji;
