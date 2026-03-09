import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Shield, Lock, Eye, Zap, ArrowRight, MapPin } from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const FeatureCard = ({ icon: Icon, iconBg, iconColor, title, description, delay }) => (
  <GlassCard delay={delay}>
    <div className={`p-2.5 sm:p-3 ${iconBg} rounded-xl w-fit mb-4 sm:mb-5`}>
      <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${iconColor}`} />
    </div>
    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-white">{title}</h3>
    <p className="text-[14px] sm:text-[15px] text-gray-200/90 leading-[1.7]">
      {description}
    </p>
  </GlassCard>
);

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/home');
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(".hero-text", {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.2
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <PageTransition>
    <div ref={containerRef} className="min-h-screen pt-16 sm:pt-24 overflow-hidden">
      {/* Background blobs — lower opacity on mobile */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="floating-blob absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-accent-cyan/[0.06] sm:bg-accent-cyan/10 blur-[100px] rounded-full" />
        <div className="floating-blob absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] bg-accent-violet/[0.06] sm:bg-accent-violet/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-12 pb-28 lg:pb-20">
        {/* ── Hero ── */}
        <div className="text-center mb-14 sm:mb-24">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="hero-text inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 text-accent-cyan text-xs sm:text-sm font-bold mb-6 sm:mb-8"
            style={{ background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(12px)' }}
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-accent-cyan" />
            <span>The Future of Anonymous Social</span>
          </motion.div>
          
          <h1 className="hero-text text-[2.75rem] leading-[1.1] sm:text-7xl md:text-8xl font-black mb-5 sm:mb-8 tracking-tighter">
            Speak Your <span className="gradient-text">Truth</span>
            <br />
            Stay <span className="text-gray-500">Hidden</span>
          </h1>
          
          <p className="hero-text text-[15px] sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 sm:mb-12 leading-[1.7] px-1">
            The ultimate anonymous confession platform. Share your deepest secrets, 
            vote on what's real, and connect without ever revealing who you are.
          </p>

          <div className="hero-text flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <Link to="/register">
              <Button className="px-8 sm:px-10 py-3 sm:py-4 text-[15px] sm:text-lg w-full sm:w-auto" icon={ArrowRight}>
                Get Started
              </Button>
            </Link>
            <Link to="/home">
              <Button variant="secondary" className="px-8 sm:px-10 py-3 sm:py-4 text-[15px] sm:text-lg w-full sm:w-auto">
                Explore Feed
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Features ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            delay={0.4}
            icon={Lock}
            iconBg="bg-red-500/20"
            iconColor="text-red-400"
            title="Total Anonymity"
            description="Your identity is protected by our advanced ghost-account system. No one, not even admins, can see your real profile."
          />
          <FeatureCard
            delay={0.5}
            icon={Eye}
            iconBg="bg-accent-cyan/20"
            iconColor="text-accent-cyan"
            title="Community Voting"
            description="Is it True or Fake? Let the community decide with real-time voting and animated results."
          />
          <FeatureCard
            delay={0.6}
            icon={MapPin}
            iconBg="bg-accent-violet/20"
            iconColor="text-accent-violet"
            title="Nearby Secrets"
            description="Discover confessions happening right in your city using our precise geospatial filtering."
          />
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Landing;
