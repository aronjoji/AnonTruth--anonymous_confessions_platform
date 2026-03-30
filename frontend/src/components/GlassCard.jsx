const GlassCard = ({ children, className = "", delay = 0 }) => {
  return (
    <div
      className={`rounded-lg p-4 sm:p-5 bg-[#1a1a1b] border border-[#343536] 
        hover:border-[#4a4a4b] transition-colors duration-200 ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
