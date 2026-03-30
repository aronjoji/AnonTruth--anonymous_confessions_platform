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
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for Global Post Management
  const [posts, setPosts] = useState([]);
  const [postFilters, setPostFilters] = useState({ page: 1, limit: 10, search: '', filter: 'newest' });
  const [postPagination, setPostPagination] = useState({ totalPages: 1, totalPosts: 0 });

  const socketRef = useRef(null);

  useEffect(() => {
    fetchAdminData();
    setupSocket();
    return () => socketRef.current?.disconnect();
  }, []);

  useEffect(() => {
    if (activeTab === 'posts') {
      fetchPosts();
    }
  }, [activeTab, postFilters]);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/admin/posts', { params: postFilters });
      setPosts(res.data.posts);
      setPostPagination({ totalPages: res.data.totalPages, totalPosts: res.data.totalPosts });
    } catch (err) {
      toast.error('Failed to fetch posts');
    }
  };

  const setupSocket = () => {
    socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current.on('vote_update', () => fetchStats());
    socketRef.current.on('content_deleted', () => fetchAdminData());
    socketRef.current.on('content_hidden', () => fetchAdminData());
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, usersRes, msgsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/reports'),
        API.get('/admin/users'),
        API.get('/admin/messages')
      ]);
      setStats(statsRes.data);
      setReports(reportsRes.data);
      setUsers(usersRes.data);
      setMessages(msgsRes.data);
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
      } else if (action === 'warnUser') {
        const confirm = window.confirm('Issue an official warning to this citizen? This decreases their trust score.');
        if (confirm) {
          await API.patch(`/admin/user/${id}/warn`);
          toast.success('Citizen warned.');
        }
      } else if (action === 'resolve') {
        await API.patch(`/admin/report/${id}/resolve`);
        toast.success('Anomaly resolved.');
      } else if (action === 'updateMessageStatus') {
        await API.patch(`/admin/messages/${id}/status`, { status: currentData });
        toast.success('Message status updated.');
      } else if (action === 'deleteMessage') {
        const confirm = window.confirm('Permanently delete this message?');
        if (confirm) {
          await API.delete(`/admin/messages/${id}`);
          toast.success('Message permanently deleted.');
        }
      }
      fetchAdminData();
    } catch (err) {
      toast.error('Oracle intervention failed.');
    }
  };



  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${
        activeTab === id 
          ? 'bg-[#272729] text-[#d7dadc]' 
          : 'text-[#818384] hover:bg-[#272729] hover:text-[#d7dadc]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const StatCard = ({ icon: Icon, label, value, colorClass }) => (
    <GlassCard className="flex items-center gap-4 group">
      <div className={`p-3 rounded-lg transition-colors ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <span className="text-[#818384] text-sm">{label}</span>
        <h4 className="text-2xl font-bold text-[#d7dadc]">{value}</h4>
      </div>
    </GlassCard>
  );

  if (loading && !stats) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
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
        <TabButton id="posts" label="Global Posts" icon={Eye} />
        <TabButton id="reports" label={`Incidents (${reports.filter(r => r.status === 'pending').length})`} icon={AlertTriangle} />
        <TabButton id="users" label="Citizen Registry" icon={Users} />
        <TabButton id="messages" label={`Comms (${messages.filter(m => m.status === 'unread').length})`} icon={Mail} />
      </div>

      {/* Tab Content */}
      <div className="space-y-12">
        {activeTab === 'stats' && (
          <>
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <StatCard icon={Users} label="Total Users" value={stats?.totalUsers} colorClass="bg-[#FF4500]/15 text-[#FF4500]" />
              <StatCard icon={BarChart3} label="Total Posts" value={stats?.totalConfessions} colorClass="bg-[#7193FF]/15 text-[#7193FF]" />
              <StatCard icon={AlertTriangle} label="Detected Anomalies" value={stats?.totalReports} colorClass="bg-red-500/20 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold mb-4 text-gray-400">Past 24 Hours Activity</h3>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <StatCard icon={Users} label="Active Citizens Today" value={stats?.usersToday || 0} colorClass="bg-blue-500/20 text-blue-500" />
              <StatCard icon={BarChart3} label="New Traces Today" value={stats?.postsToday || 0} colorClass="bg-purple-500/20 text-purple-500" />
              <StatCard icon={AlertTriangle} label="New Anomalies Today" value={stats?.reportsToday || 0} colorClass="bg-orange-500/20 text-orange-500" />
            </div>

            <section>
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-[#FF4500]" /> Trending Posts
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats?.trendingPosts?.map(post => (
                  <GlassCard key={post._id} className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp className="w-12 h-12" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF4500] mb-2 block">
                      {post.category}
                    </span>
                    <p className="text-sm text-gray-300 leading-relaxed mb-6 line-clamp-3 italic">"{post.text}"</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-[#FF4500] flex items-center gap-1">
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
                      <th className="px-8 py-5">Severity</th>
                      <th className="px-8 py-5">Breach Reasons</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Intervention</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reports.map(report => (
                      <tr key={report.reportedItemId} className={`hover:bg-white/5 transition-colors ${report.status === 'resolved' ? 'opacity-40 grayscale' : ''}`}>
                        <td className="px-8 py-6">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${report.itemType === 'confession' ? 'bg-[#FF4500]/10 text-[#FF4500]' : 'bg-[#7193FF]/10 text-[#7193FF]'}`}>
                            {report.itemType}
                          </span>
                        </td>
                        <td className="px-8 py-6 max-w-xs">
                          <p className="text-sm text-gray-300 truncate" title={report.content}>{report.content}</p>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`text-sm font-black flex items-center gap-1 ${report.reportCount >= 3 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                                <AlertTriangle className="w-4 h-4" /> {report.reportCount} Reports
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex flex-wrap gap-1">
                                {report.reasons.map((reason, idx) => (
                                    <span key={idx} className="bg-red-500/10 border border-red-500/20 px-2 py-1 rounded text-[10px] text-red-500/80 font-bold">
                                        {reason}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-black uppercase ${report.status === 'pending' ? 'text-yellow-500 animate-pulse' : 'text-green-500'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {report.status === 'pending' && (
                              <Button variant="outline" className="p-2 border-green-500/20 text-green-500 hover:bg-green-500/10" icon={ShieldCheck} onClick={() => handleAction('resolve', report.reportedItemId)} title="Mark Safe" />
                            )}
                            {report.userId && (
                                <Button variant="outline" className="p-2 border-yellow-500/20 text-yellow-500" icon={Users} onClick={() => handleAction('warnUser', report.userId)} title="Warn Author" />
                            )}
                            <Button variant="outline" className="p-2 border-[#FF4500]/20 text-[#FF4500]" icon={Shield} onClick={() => handleAction('edit', report.reportedItemId, report.itemType, report.content)} title="Edit Content" />
                            <Button variant="outline" className="p-2 border-red-500/20 text-red-500" icon={Trash2} onClick={() => handleAction('delete', report.reportedItemId, report.itemType)} title="Delete Content" />
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
              <Users className="w-5 h-5 text-[#FF4500]" /> User Registry
            </h3>
            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Anonymous ID</th>
                      <th className="px-8 py-5">Activity</th>
                      <th className="px-8 py-5">Trust Score</th>
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
                            <div className="w-8 h-8 rounded-full bg-[#FF4500] flex items-center justify-center text-[10px] font-bold text-white">
                              {u.anonymousName?.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-gray-300 block">{u.anonymousName}</span>
                              <span className="text-[10px] text-gray-500 font-mono italic">{u.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">Last seen: {new Date(u.lastLogin || u.createdAt).toLocaleDateString()}</span>
                                <Button 
                                  variant="outline" 
                                  className="py-1 px-3 text-[10px] border-[#FF4500]/20 text-[#FF4500] w-fit"
                                  onClick={() => {
                                      setActiveTab('posts');
                                      setPostFilters({ ...postFilters, search: u._id, page: 1 });
                                  }}
                                >
                                    View Comm Logs
                                </Button>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={`text-sm font-black ${u.trustScore < 50 ? 'text-red-500' : u.trustScore < 80 ? 'text-yellow-500' : 'text-green-500'}`}>
                                    {u.trustScore}/100
                                </span>
                            </div>
                            <span className="text-[10px] text-red-500/80 font-bold">{u.warningsCount > 0 ? `${u.warningsCount} Warnings` : 'Clean Record'}</span>
                          </div>
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
                              className="p-2 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10" 
                              icon={AlertTriangle} 
                              onClick={() => handleAction('warnUser', u._id)} 
                              title="Warn Citizen"
                            />
                            <Button 
                              variant="outline" 
                              className={`p-2 ${u.isBanned ? 'border-green-500/20 text-green-500' : 'border-orange-500/20 text-orange-500'}`} 
                              icon={u.isBanned ? ShieldCheck : Ban} 
                              onClick={() => handleAction('ban', u._id, 'user', u.isBanned)} 
                              title={u.isBanned ? "Reinstate" : "Exile"}
                            />
                            <Button 
                              variant="outline" 
                              className="p-2 border-red-500/20 text-red-500" 
                              icon={UserMinus} 
                              onClick={() => handleAction('deleteUser', u._id)} 
                              title="Delete Record"
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
        {activeTab === 'posts' && (
          <section>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <h3 className="text-2xl font-black flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#FF4500]" /> All Posts
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search traces..."
                  value={postFilters.search}
                  onChange={(e) => setPostFilters({ ...postFilters, search: e.target.value, page: 1 })}
                  className="bg-[#272729] border border-[#343536] rounded-lg px-4 py-2 text-sm focus:border-[#FF4500] outline-none text-[#d7dadc] w-64"
                />
                <select
                  value={postFilters.filter}
                  onChange={(e) => setPostFilters({ ...postFilters, filter: e.target.value, page: 1 })}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none text-white cursor-pointer"
                >
                  <option value="newest" className="bg-[#0c0e16]">Newest</option>
                  <option value="most_reacted" className="bg-[#0c0e16]">Most Reacted</option>
                  <option value="most_reported" className="bg-[#0c0e16]">Most Reported</option>
                </select>
              </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Author</th>
                      <th className="px-8 py-5">Content</th>
                      <th className="px-8 py-5">Stats</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {posts.map(post => (
                      <tr key={post._id} className={`hover:bg-white/5 transition-colors ${post.isHidden ? 'opacity-40 grayscale' : ''}`}>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-300">{post.userId?.anonymousName || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 font-mono italic">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6 max-w-sm">
                          <span className="px-2 py-1 bg-[#FF4500]/10 text-[#FF4500] rounded text-[10px] font-bold uppercase mb-2 inline-block">
                            {post.category}
                          </span>
                          <p className="text-sm text-gray-300 line-clamp-2">{post.text}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-3 text-xs font-bold">
                            <span className="text-[#FF4500] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {post.trueVotes}</span>
                            <span className="text-red-500 flex items-center gap-1"><XCircle className="w-3 h-3" /> {post.fakeVotes}</span>
                            {post.reportCount > 0 && (
                              <span className="text-yellow-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {post.reportCount}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[10px] font-black uppercase ${post.isHidden ? 'text-gray-500' : 'text-green-500'}`}>
                            {post.isHidden ? 'HIDDEN' : 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Link to={`/confession/${post._id}`} target="_blank" className="p-2 rounded-xl border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-colors">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Button 
                              variant="outline" 
                              className={`p-2 ${post.isHidden ? 'border-green-500/20 text-green-500' : 'border-orange-500/20 text-orange-500'}`} 
                              icon={post.isHidden ? Eye : EyeOff} 
                              onClick={() => handleAction('hide', post._id, 'confession', post.isHidden)} 
                            />
                            <Button 
                              variant="outline" 
                              className="p-2 border-red-500/20 text-red-500" 
                              icon={Trash2} 
                              onClick={() => handleAction('delete', post._id, 'confession')} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            
            {/* Pagination Controls */}
            {postPagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setPostFilters({ ...postFilters, page: Math.max(1, postFilters.page - 1) })}
                  disabled={postFilters.page === 1}
                >Prev</Button>
                <span className="px-4 py-2 text-gray-400 font-bold">Page {postFilters.page} of {postPagination.totalPages}</span>
                <Button 
                  variant="outline" 
                  onClick={() => setPostFilters({ ...postFilters, page: Math.min(postPagination.totalPages, postFilters.page + 1) })}
                  disabled={postFilters.page === postPagination.totalPages}
                >Next</Button>
              </div>
            )}
            
            {posts.length === 0 && (
              <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10 opacity-30 italic">No traces found matching criteria.</div>
            )}
          </section>
        )}

        {activeTab === 'messages' && (
          <section>
            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-500" /> Neural Communications
            </h3>
            <GlassCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-5">Sender</th>
                      <th className="px-8 py-5">Subject</th>
                      <th className="px-8 py-5">Message</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {messages.map(msg => (
                      <tr key={msg._id} className={`hover:bg-white/5 transition-colors ${msg.status === 'closed' ? 'opacity-40 grayscale' : ''}`}>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-300">{msg.name}</p>
                          <p className="text-xs text-gray-500 font-mono italic">{msg.email}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-[10px] font-black uppercase">
                            {msg.reportType}
                          </span>
                        </td>
                        <td className="px-8 py-6 max-w-sm">
                          <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-500">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <select
                            value={msg.status}
                            onChange={(e) => handleAction('updateMessageStatus', msg._id, 'message', e.target.value)}
                            className={`bg-transparent text-xs font-black uppercase outline-none cursor-pointer ${
                              msg.status === 'unread' ? 'text-yellow-500 animate-pulse' : 
                              msg.status === 'replied' ? 'text-green-500' : 
                              msg.status === 'read' ? 'text-blue-500' : 'text-gray-500'
                            }`}
                          >
                            <option value="unread" className="bg-[#0c0e16] text-yellow-500">Unread</option>
                            <option value="read" className="bg-[#0c0e16] text-blue-500">Read</option>
                            <option value="replied" className="bg-[#0c0e16] text-green-500">Replied</option>
                            <option value="closed" className="bg-[#0c0e16] text-gray-500">Closed</option>
                          </select>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <a href={`mailto:${msg.email}?subject=Re: AnonTruth Support - ${msg.reportType}`} className="p-2 rounded-xl border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-colors">
                              <Mail className="w-4 h-4" />
                            </a>
                            <Button 
                              variant="outline" 
                              className="p-2 border-red-500/20 text-red-500" 
                              icon={Trash2} 
                              onClick={() => handleAction('deleteMessage', msg._id)} 
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
            {messages.length === 0 && (
              <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10 opacity-30 italic">No incoming communications.</div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
