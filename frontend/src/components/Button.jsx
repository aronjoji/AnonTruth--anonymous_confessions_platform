const Button = ({ children, onClick, className = "", variant = "primary", icon: Icon, type = "submit", disabled = false, title }) => {
  const variants = {
    primary: "bg-[#FF4500] text-white hover:bg-[#FF5722] active:bg-[#E03D00]",
    secondary: "bg-[#1a1a1b] border border-[#343536] text-[#d7dadc] hover:border-[#4a4a4b] hover:bg-[#272729]",
    outline: "border border-[#343536] text-[#d7dadc] hover:bg-[#272729] hover:border-[#4a4a4b]",
  };

  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      title={title}
      className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center justify-center gap-2 
        transition-colors duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
