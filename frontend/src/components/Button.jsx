import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = "", variant = "primary", icon: Icon, type = "submit" }) => {
  const variants = {
    primary: "bg-accent-cyan text-black hover:bg-white hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]",
    secondary: "glass border-white/10 hover:border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] text-white",
    outline: "border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan/10 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]",
  };

  return (
    <motion.button
      whileHover={{ 
        scale: 1.03, 
        y: -2,
      }}
      whileTap={{ 
        scale: 0.95,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      onClick={onClick}
      type={type}
      className={`px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${variants[variant]} ${className}`}
      style={{ willChange: 'transform' }}
    >
      {Icon && (
        <motion.span
          initial={{ rotate: 0 }}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon className="w-5 h-5" />
        </motion.span>
      )}
      {children}
    </motion.button>
  );
};

export default Button;
