import { useState, useEffect } from 'react';
import { getMyConfessions, deleteConfession, getUserStats } from '../services/api';
import ConfessionCard from '../components/ConfessionCard';
import GlassCard from '../components/GlassCard';
import AnimatedCounter from '../components/AnimatedCounter';
import PageTransition from '../components/PageTransition';
import { Ghost, Loader2, Trash2, Zap, MessageSquare, BarChart3, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from '../components/Toast';

const Profile = () => {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [confRes, statsRes] = await Promise.all([
        getMyConfessions(),
        getUserStats()
      ]);
      setConfessions(confRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this truth? This cannot be undone.')) return;
    try {
      await deleteConfession(id);
      toast.success('Truth erased from the network');
      setConfessions(prev => prev.filter(c => c._id !== id));
      // Refresh stats
      const statsRes = await getUserStats();
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to delete confession');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-12 h-12 text-accent-cyan animate-spin" />
      <p className="text-gray-500 font-medium">Synchronizing neural profile...</p>
    </div>
  );

  return (
    <PageTransition>
    <div className="max-w-6xl mx-auto px-6 pt-24 pb-20">
      {/* Profile Header */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <GlassCard className="md:col-span-1 p-8 flex flex-col items-center text-center border-accent-cyan/20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center text-3xl font-black mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
            {user?.anonymousName?.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-black mb-2">{user?.anonymousName}</h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan text-[10px] font-bold uppercase tracking-widest border border-accent-cyan/20">
            <Shield className="w-3 h-3" /> Anonymous Citizen
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <GlassCard className="p-6 flex flex-col justify-center">
            <Zap className="w-5 h-5 text-yellow-500 mb-3" />
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Neural Impact</span>
            <h4 className="text-3xl font-black mt-1"><AnimatedCounter value={stats?.neuralImpact || 0} /></h4>
          </GlassCard>
          <GlassCard className="p-6 flex flex-col justify-center">
            <Ghost className="w-5 h-5 text-accent-cyan mb-3" />
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Truths Shared</span>
            <h4 className="text-3xl font-black mt-1"><AnimatedCounter value={stats?.totalConfessions || 0} /></h4>
          </GlassCard>
          <GlassCard className="p-6 flex flex-col justify-center">
            <BarChart3 className="w-5 h-5 text-accent-violet mb-3" />
            <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Votes Received</span>
            <h4 className="text-3xl font-black mt-1"><AnimatedCounter value={stats?.totalVotesReceived || 0} /></h4>
          </GlassCard>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-accent-cyan" />
            My Neural Echoes
          </h3>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid gap-6">
          {confessions.map(confession => (
            <ConfessionCard 
              key={confession._id} 
              confession={confession} 
              onDelete={() => handleDelete(confession._id)}
            />
          ))}

          {confessions.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
              <p className="text-gray-500 text-lg">You haven't left any echoes in the void yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Profile;
