import { Shield, Lock, Eye, MapPin, ArrowRight, Users, MessageSquare } from 'lucide-react';
import Button from '../components/Button';
import PageTransition from '../components/PageTransition';
import { Link } from 'react-router-dom';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-5 sm:p-6 hover:border-[#4a4a4b] transition-colors">
    <div className="w-10 h-10 rounded-lg bg-[#FF4500]/10 flex items-center justify-center mb-4">
      <Icon className="w-5 h-5 text-[#FF4500]" />
    </div>
    <h3 className="text-base sm:text-lg font-bold text-[#d7dadc] mb-2">{title}</h3>
    <p className="text-sm text-[#818384] leading-relaxed">{description}</p>
  </div>
);

const StatBadge = ({ value, label }) => (
  <div className="text-center">
    <div className="text-2xl sm:text-3xl font-bold text-[#FF4500]">{value}</div>
    <div className="text-xs sm:text-sm text-[#818384] mt-1">{label}</div>
  </div>
);

const Landing = () => {

  return (
    <PageTransition>
      <div className="pt-16 sm:pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16 pb-28 lg:pb-16">
          
          {/* Hero */}
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#343536] bg-[#1a1a1b] text-[#FF4500] text-xs sm:text-sm font-semibold mb-6">
              <Shield className="w-3.5 h-3.5" />
              <span>Anonymous Confessions Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-5 sm:mb-6 tracking-tight text-[#d7dadc] leading-[1.1]">
              Speak Your{' '}
              <span className="text-[#FF4500]">Truth</span>
              <br />
              Stay Hidden
            </h1>
            
            <p className="text-sm sm:text-lg text-[#818384] max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
              Share your deepest secrets anonymously. Vote on what's real, 
              react, and connect — without ever revealing who you are.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register">
                <Button className="px-8 py-3 text-sm sm:text-base w-full sm:w-auto" icon={ArrowRight}>
                  Get Started
                </Button>
              </Link>
              <Link to="/home">
                <Button variant="secondary" className="px-8 py-3 text-sm sm:text-base w-full sm:w-auto">
                  Browse Feed
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-6 sm:p-8 mb-8 sm:mb-12">
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <StatBadge value="100%" label="Anonymous" />
              <StatBadge value="∞" label="Confessions" />
              <StatBadge value="24/7" label="Active" />
            </div>
          </div>

          {/* Features */}
          <h2 className="text-lg sm:text-xl font-bold text-[#d7dadc] mb-4 sm:mb-6 px-1">Why AnonTruth?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <FeatureCard
              icon={Lock}
              title="Total Anonymity"
              description="Ghost-account system protects your identity. No one can trace your confessions back to you."
            />
            <FeatureCard
              icon={Eye}
              title="True or Fake Voting"
              description="The community decides what's real. Upvote truth, downvote fiction — democracy at its finest."
            />
            <FeatureCard
              icon={MapPin}
              title="Nearby Confessions"
              description="Discover secrets happening in your area with precise geospatial filtering."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Anonymous Chat"
              description="Start private conversations with confession authors without revealing identities."
            />
            <FeatureCard
              icon={Users}
              title="Community Reactions"
              description="React with emojis, comment, and engage with confessions from around the world."
            />
            <FeatureCard
              icon={Shield}
              title="Safe & Moderated"
              description="Active moderation, report system, and community guidelines keep the platform safe."
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Landing;
