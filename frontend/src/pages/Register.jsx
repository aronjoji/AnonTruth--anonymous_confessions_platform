import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Ghost, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import toast from '../components/Toast';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ email, password });
      toast.success('Account created! Welcome to AnonTruth.');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <GlassCard className="max-w-md w-full p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#FF4500]/10 rounded-xl mb-4">
            <Ghost className="w-8 h-8 text-[#FF4500]" />
          </div>
          <h2 className="text-2xl font-bold text-[#d7dadc] mb-2">Join AnonTruth</h2>
          <p className="text-[#818384] text-sm">Your real identity stays hidden. Forever.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#818384] ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#818384]" />
              <input 
                type="email" 
                required
                className="w-full bg-[#272729] border border-[#343536] rounded-lg py-3 pl-10 pr-4 focus:border-[#FF4500] outline-none transition-colors text-[#d7dadc] placeholder-[#818384]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#818384] ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#818384]" />
              <input 
                type="password" 
                required
                className="w-full bg-[#272729] border border-[#343536] rounded-lg py-3 pl-10 pr-4 focus:border-[#FF4500] outline-none transition-colors text-[#d7dadc] placeholder-[#818384]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#818384] px-1">
            <ShieldCheck className="w-4 h-4 text-[#FF4500]" />
            <span>An anonymous username will be generated for you.</span>
          </div>

          <Button className="w-full py-3" icon={ArrowRight}>
            Create Account
          </Button>
        </form>

        <p className="text-center mt-6 text-sm text-[#818384]">
          Already a member? <Link to="/login" className="text-[#FF4500] font-semibold hover:underline">Log In</Link>
        </p>
      </GlassCard>
    </div>
    </PageTransition>
  );
};

export default Register;
