import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Shield, Lock, Eye, Zap, ArrowRight, MapPin } from 'lucide-react';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    if (user) {
      navigate('/home');
      return;
    }

    const ctx = gsap.context(() => {
      // Hero Animations
      gsap.from(".hero-text", {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.2
      });

      gsap.from(".hero-blob", {
        scale: 0,
        opacity: 0,
        duration: 2,
        ease: "elastic.out(1, 0.5)",
        stagger: 0.3
      });

      // Floating particles
      gsap.to(".particle", {
        y: "random(-20, 20)",
        x: "random(-20, 20)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <PageTransition>
    <div ref={containerRef} className="min-h-screen pt-24 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="floating-blob absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-accent-cyan/10 blur-[100px] rounded-full" />
        <div className="floating-blob absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] bg-accent-violet/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-24">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-accent-cyan text-sm font-bold mb-8"
          >
            <Zap className="w-4 h-4 fill-accent-cyan" />
            <span>The Future of Anonymous Social</span>
          </motion.div>
          
          <h1 className="hero-text text-7xl md:text-9xl font-black mb-8 leading-tight tracking-tighter">
            Speak Your <span className="gradient-text">Truth</span> <br /> 
            Stay <span className="text-white/20">Hidden</span>
          </h1>
          
          <p className="hero-text text-xl text-gray-400 max-w-3xl mx-auto mb-12">
            The ultimate anonymous confession platform. Share your deepest secrets, 
            vote on what's real, and connect with the community without ever revealing who you are.
          </p>

          <div className="hero-text flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/register">
              <Button className="px-10 py-4 text-lg" icon={ArrowRight}>
                Get Started
              </Button>
            </Link>
            <Link to="/home">
              <Button variant="secondary" className="px-10 py-4 text-lg">
                Explore Feed
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          <GlassCard delay={0.4}>
            <div className="p-3 bg-red-500/20 rounded-2xl w-fit mb-6">
              <Lock className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Total Anonymity</h3>
            <p className="text-gray-400">
              Your identity is protected by our advanced ghost-account system. 
              No one, not even admins, can see your real profile.
            </p>
          </GlassCard>

          <GlassCard delay={0.5}>
            <div className="p-3 bg-accent-cyan/20 rounded-2xl w-fit mb-6">
              <Eye className="w-8 h-8 text-accent-cyan" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Community Voting</h3>
            <p className="text-gray-400">
              Is it True or Fake? Let the community decide with real-time 
              voting and animated results.
            </p>
          </GlassCard>

          <GlassCard delay={0.6}>
            <div className="p-3 bg-accent-violet/20 rounded-2xl w-fit mb-6">
              <MapPin className="w-8 h-8 text-accent-violet" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Nearby Secrets</h3>
            <p className="text-gray-400">
              Discover confessions happening right in your city using our 
              precise geospatial filtering.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Landing;
