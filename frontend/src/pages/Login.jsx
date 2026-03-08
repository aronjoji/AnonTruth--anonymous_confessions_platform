import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import toast from '../components/Toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      toast.success('Welcome back!');
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <PageTransition>
    <div className="min-h-screen flex items-center justify-center px-6 pt-20">
      <GlassCard className="max-w-md w-full p-8">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-accent-violet/20 rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-accent-violet" />
          </div>
          <h2 className="text-3xl font-black mb-2">Welcome Back</h2>
          <p className="text-gray-400">The truth is waiting for you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="email" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-accent-violet outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input 
                type="password" 
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-accent-violet outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full py-4 bg-accent-violet hover:bg-white" icon={ArrowRight}>
            Login to Account
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-gray-400">
          Not a member? <Link to="/register" className="text-accent-violet font-bold hover:underline">Sign Up</Link>
        </p>
      </GlassCard>
    </div>
    </PageTransition>
  );
};

export default Login;
