import { useState, useEffect } from 'react';
import { getMyConfessions, deleteConfession, getUserStats } from '../services/api';
import ConfessionCard from '../components/ConfessionCard';
import GlassCard from '../components/GlassCard';
import PageTransition from '../components/PageTransition';
import { Ghost, Loader2, Zap, MessageSquare, BarChart3, Shield } from 'lucide-react';
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
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deleteConfession(id);
      toast.success('Post deleted');
      setConfessions(prev => prev.filter(c => c._id !== id));
      const statsRes = await getUserStats();
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
      <p className="text-[#818384] text-sm">Loading profile...</p>
    </div>
  );

  return (
    <PageTransition>
    <div className="max-w-[680px] mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-24 lg:pb-16">
      {/* Profile Header */}
      <div className="bg-[#1a1a1b] border border-[#343536] rounded-lg p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FF4500] flex items-center justify-center text-xl sm:text-2xl font-bold text-white">
            {user?.anonymousName?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#d7dadc]">{user?.anonymousName}</h2>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#818384] mt-1">
              <Shield className="w-3.5 h-3.5 text-[#FF4500]" /> Anonymous User
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <GlassCard className="p-4 flex flex-col items-center text-center">
          <Zap className="w-4 h-4 text-yellow-500 mb-1.5" />
          <span className="text-[10px] text-[#818384] uppercase font-bold">Impact</span>
          <span className="text-xl font-bold text-[#d7dadc] mt-0.5">{stats?.neuralImpact || 0}</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center text-center">
          <Ghost className="w-4 h-4 text-[#FF4500] mb-1.5" />
          <span className="text-[10px] text-[#818384] uppercase font-bold">Posts</span>
          <span className="text-xl font-bold text-[#d7dadc] mt-0.5">{stats?.totalConfessions || 0}</span>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center text-center">
          <BarChart3 className="w-4 h-4 text-[#7193FF] mb-1.5" />
          <span className="text-[10px] text-[#818384] uppercase font-bold">Votes</span>
          <span className="text-xl font-bold text-[#d7dadc] mt-0.5">{stats?.totalVotesReceived || 0}</span>
        </GlassCard>
      </div>

      {/* My Confessions */}
      <div className="flex items-center gap-3 mb-4 mt-6">
        <h3 className="text-base font-bold text-[#d7dadc] flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#FF4500]" />
          My Posts
        </h3>
        <div className="h-px flex-1 bg-[#343536]" />
      </div>

      <div className="space-y-3">
        {confessions.map(confession => (
          <ConfessionCard 
            key={confession._id} 
            confession={confession} 
            onDelete={() => handleDelete(confession._id)}
          />
        ))}

        {confessions.length === 0 && (
          <div className="text-center py-12 bg-[#1a1a1b] border border-[#343536] rounded-lg">
            <p className="text-[#818384] text-sm">You haven't posted anything yet.</p>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
};

export default Profile;
