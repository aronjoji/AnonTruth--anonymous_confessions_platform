import { useEffect, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedCounter = ({ value = 0, className = '', duration = 0.8 }) => {
  const spring = useSpring(0, { 
    stiffness: 100, 
    damping: 30, 
    duration: duration * 1000 
  });
  const display = useTransform(spring, (v) => Math.round(v));
  const nodeRef = useRef(null);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      if (nodeRef.current) {
        nodeRef.current.textContent = latest;
      }
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <motion.span
      ref={nodeRef}
      className={className}
    >
      {value}
    </motion.span>
  );
};

export default AnimatedCounter;
