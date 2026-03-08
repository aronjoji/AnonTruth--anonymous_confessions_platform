import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Users, AlertTriangle, ShieldCheck, Trash2, Ban, 
  Loader2, TrendingUp, CheckCircle2, XCircle, MoreVertical, 
  Calendar, MapPin, Mail, Shield, EyeOff, Eye, UserMinus
} from 'lucide-react';
import { io } from 'socket.io-client';
import API, { SOCKET_URL } from '../services/api';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import toast from '../components/Toast';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'reports', 'users'
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchAdminData();
    setupSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  const setupSocket = () => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.on('vote_update', () => fetchStats());
    socketRef.current.on('content_deleted', () => fetchAdminData());
    socketRef.current.on('content_hidden', () => fetchAdminData());
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/reports'),
        API.get('/admin/users')
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {}
  };

  const handleAction = async (action, id, type, currentData) => {
    try {
      if (action === 'delete') {
        const confirm = window.confirm(`Are you sure you want to permanently delete this ${type}?`);
        if (!confirm) return;
        if (type === 'confession') await API.delete(`/admin/confession/${id}`);
        else await API.delete(`/admin/comment/${id}`);
        toast.success(`Neural trace deleted.`);
      } else if (action === 'hide') {
        const isHidden = !currentData;
        await API.patch(`/admin/confession/${id}/hide`, { isHidden });
        toast.success(isHidden ? 'Neural trace concealed.' : 'Neural trace revealed.');
      } else if (action === 'edit') {
        const newText = window.prompt('Enter new text:', currentData);
        if (newText) {
          if (type === 'confession') await API.patch(`/admin/confession/${id}`, { text: newText });
          else await API.patch(`/admin/comment/${id}`, { text: newText });
          toast.success('Neural record updated.');
        }
      } else if (action === 'ban') {
        const isBanned = !currentData;
        await API.patch(`/admin/user/${id}/ban`, { isBanned });
        toast.success(isBanned ? 'Citizen exiled.' : 'Citizen reinstated.');
      } else if (action === 'deleteUser') {
        const confirm = window.confirm('Permanently delete this citizen record?');
        if (confirm) {
          await API.delete(`/admin/user/${id}`);
          toast.success('Citizen record purged.');
        }
      } else if (action === 'resolve') {
        await API.patch(`/admin/report/${id}/resolve`);
        toast.success('Anomaly resolved.');
      }
      fetchAdminData();
    } catch (err) {
      toast.error('Oracle intervention failed.');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent-cyan animate-spin" />
    </div>
  );

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all ${
        activeTab === id 
          ? 'bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.3)]' 
          : 'glass hover:bg-white/5 text-gray-400'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <GlassCard className="flex items-center gap-6 group hover:border-white/20 transition-all">
      <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 ${colorClass}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <span className="text-gray-400 text-sm font-medium">{label}</span>
        <h4 className="text-3xl font-black">{value}</h4>
      </div>
    </GlassCard>
  );

  if (loading && !stats) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent-cyan animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl font-black gradient-text mb-2">Oracle Console</h2>
          <p className="text-gray-400 font-medium">Moderating the whispers of the neural network.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl flex items-center gap-2 text-red-500 text-xs font-black animate-pulse">
            <ShieldCheck className="w-4 h-4" /> ADMIN LEVEL 5
          </div>
          <Button onClick={fetchAdminData} variant="outline" className="py-2" icon={TrendingUp}>Sync Network</Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
        <TabButton id="stats" label="Network Stats" icon={BarChart3} />
        <TabButton id="reports" label={`Incidents (${reports.filter(r => r.status === 'pending').length})`} icon={AlertTriangle} />
        <TabButton id="users" label="Citizen Registry" icon={Users} />
      </div>

      {/* Tab Content */}
      <div className="space-y-12">
        {activeTab === 'stats' && (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              <StatCard icon={Users} label="Total Citizens" value={stats?.totalUsers} colorClass="bg-accent-cyan/20 text-accent-cyan" />
              <StatCard icon={BarChart3} label="Neural Traces" value={stats?.totalConfessions} colorClass="bg-accent-violet/20 text-accent-violet" />
              <StatCard icon={AlertTriangle} label="Detected Anomalies" value={stats?.totalReports} colorClass="bg-red-500/20 text-red-500" />
            </div>

            <section>
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-accent-cyan" /> Trending Neural activity
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats?.trendingPosts?.map(post => (
                  <GlassCard key={post._id} className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp className="w-12 h-12" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent-cyan mb-3 block">
                      {post.category}
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6 line-clamp-3 italic">"{post.text}"</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-accent-cyan flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {post.trueVotes}
                        </span>
                        <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {post.fakeVotes}
                        </span>
                      </div>
                      <Link to={`/confession/${post._id}`} className="text-[10px] font-black uppercase tracking-tighter text-gray-500 hover:text-white transition-colors">
                        Inspect
                      </Link>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'reports' && (
          <section>
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" /> Active Incident Reports
            </h3>
            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Origin</th>
                      <th className="px-8 py-5">Substance</th>
                      <th className="px-8 py-5">Reporter</th>
                      <th className="px-8 py-5">Breach Reason</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Intervention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reports.map(report => (
                      <tr key={report._id} className={`hover:bg-white/5 transition-colors ${report.status === 'resolved' ? 'opacity-40 grayscale' : ''}`}>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${report.itemType === 'confession' ? 'bg-accent-cyan/10 text-accent-cyan' : 'bg-accent-violet/10 text-accent-violet'}`}>
                            {report.itemType}
                          </span>
                        </td>
                        <td className="px-8 py-6 max-w-xs">
                          <p className="text-sm text-gray-300 truncate" title={report.content}>{report.content}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-400">{report.reportedBy?.anonymousName}</td>
                        <td className="px-8 py-6">
                          <span className="text-xs font-bold text-red-500/80">{report.reason}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-black uppercase ${report.status === 'pending' ? 'text-yellow-500 animate-pulse' : 'text-green-500'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {report.status === 'pending' && (
                              <Button variant="outline" className="p-2 border-green-500/20 text-green-500 hover:bg-green-500/10" icon={ShieldCheck} onClick={() => handleAction('resolve', report._id)} />
                            )}
                            <Button variant="outline" className="p-2 border-accent-cyan/20 text-accent-cyan" icon={Shield} onClick={() => handleAction('edit', report.reportedItemId, report.itemType, report.content)} />
                            <Button variant="outline" className="p-2 border-red-500/20 text-red-500" icon={Trash2} onClick={() => handleAction('delete', report.reportedItemId, report.itemType)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            {reports.length === 0 && (
              <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10 opacity-30 italic">No neural breaches detected.</div>
            )}
          </section>
        )}

        {activeTab === 'users' && (
          <section>
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Users className="w-6 h-6 text-accent-violet" /> Citizen Identification Registry
            </h3>
            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Anonymous ID</th>
                      <th className="px-8 py-5">Email Pointer</th>
                      <th className="px-8 py-5">Entry Date</th>
                      <th className="px-8 py-5">Role</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center text-[10px] font-bold">
                              {u.anonymousName?.substring(0,2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-gray-300">{u.anonymousName}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-500 font-mono italic">{u.email}</td>
                        <td className="px-8 py-6 text-sm text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-sm font-bold">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-black uppercase ${u.isBanned ? 'text-red-500' : 'text-green-500'}`}>
                            {u.isBanned ? 'EXILED' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              className={`p-2 ${u.isBanned ? 'border-green-500/20 text-green-500' : 'border-orange-500/20 text-orange-500'}`} 
                              icon={u.isBanned ? ShieldCheck : Ban} 
                              onClick={() => handleAction('ban', u._id, 'user', u.isBanned)} 
                            />
                            <Button 
                              variant="outline" 
                              className="p-2 border-red-500/20 text-red-500" 
                              icon={UserMinus} 
                              onClick={() => handleAction('deleteUser', u._id)} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
