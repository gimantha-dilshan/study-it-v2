"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminPasscode, getAdminData, getAdminUserMessages } from "./actions";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    registeredUsers: 0,
    totalMessages: 0,
    newUsersToday: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // User Detail Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const filteredUsers = filter === "all" ? users : users.filter(u => u.is_registered);

  const templates = [
    { name: "Announcement", text: "We have some exciting news to share! [Type details here...]" },
    { name: "System Update", text: "Study-It has been updated to v2.5! New features: [List features here...]" },
    { name: "Maintenance", text: "Study-It will be under maintenance for some time. We will be back soon!" },
    { name: "New Feature", text: "Check out our new feature! You can now [Feature details...]" },
  ];

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("studyit_admin_verified") === "true") {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await verifyAdminPasscode(passcode);
    if (result.success) {
      setIsAuthorized(true);
      sessionStorage.setItem("studyit_admin_verified", "true");
    } else {
      setError(result.error || "Incorrect passcode.");
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getAdminData(passcode);
      if (result.success && result.data) {
        const { users: usersData, messages: messagesData, broadcasts: broadcastData } = result.data;
        
        const totalCount = usersData.length;
        const registeredCount = usersData.filter((u: any) => u.is_registered).length || 0;
        const today = new Date().toISOString().split('T')[0];
        const newUsersToday = usersData.filter((u: any) => u.created_at?.startsWith(today)).length || 0;
        
        const messagesCount = messagesData.filter((m: any) => m.role === 'model').length;

        setStats({ totalUsers: totalCount, registeredUsers: registeredCount, totalMessages: messagesCount, newUsersToday });
        setUsers(usersData);
        setBroadcasts(broadcastData.slice(0, 5));
      } else {
        setError(result.error || "Failed to load dashboard data.");
      }
    } catch (err) { 
      console.error(err); 
      setError("A server error occurred.");
    } finally { 
      setLoading(false); 
    }
  };

  const fetchUserDetail = async (user: any) => {
    setSelectedUser(user);
    setLoadingDetails(true);
    try {
        const result = await getAdminUserMessages(passcode, user.jid);
        if (result.success && result.data) {
            const messages = result.data;
            const counts = {
                text: messages.filter((m: any) => m.type === 'text' && m.role === 'user').length,
                image: messages.filter((m: any) => m.type === 'image' && m.role === 'user').length,
                audio: messages.filter((m: any) => m.type === 'audio' && m.role === 'user').length,
                document: messages.filter((m: any) => m.type === 'document' && m.role === 'user').length,
                total: messages.filter((m: any) => m.role === 'model').length
            };

            const activity: any = {};
            const last7Days = Array.from({length: 7}, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return d.toISOString().split('T')[0];
            }).reverse();

            last7Days.forEach(day => activity[day] = 0);
            messages.forEach((m: any) => {
                const day = m.created_at?.split('T')[0];
                if (day && activity[day] !== undefined && m.role === 'user') activity[day]++;
            });

            setUserDetails({ counts, activity: Object.entries(activity).map(([day, val]) => ({ day, val })) });
        }
    } catch (err) { console.error(err); } finally { setLoadingDetails(false); }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!mounted) return null;

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden relative text-white font-sans">
        <div className="absolute inset-0 z-0"><div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" /><div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse" /></div>
        <div className="relative z-10 w-full max-w-md glass p-10 rounded-[2.5rem] space-y-8 border border-white/20 shadow-2xl backdrop-blur-3xl bg-white/5">
          <div className="text-center space-y-2"><h1 className="text-4xl font-bold tracking-tight glow-text font-black uppercase tracking-tighter">Study-It Admin</h1><p className="text-gray-400 font-medium">Cloud Identity Required</p></div>
          <form onSubmit={handleLogin} className="space-y-6"><input type="password" required placeholder="••••" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white text-center text-3xl tracking-[0.5em]" value={passcode} onChange={(e) => setPasscode(e.target.value)} />{error && <p className="text-red-400 text-sm text-center font-bold">{error}</p>}<button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95">Enter Control Panel</button></form>
        </div>
      </main>
    );
  }

  const proPercentage = stats.totalUsers > 0 ? (stats.registeredUsers / stats.totalUsers) * 100 : 0;

  return (
    <main className="min-h-screen w-full bg-[#080808] text-white p-4 md:p-12 relative overflow-x-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-40"><div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-indigo-600/20 rounded-full blur-[140px]" /><div className="absolute bottom-[-5%] right-[-5%] w-[45%] h-[45%] bg-purple-600/20 rounded-full blur-[140px]" /></div>

      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl border flex items-center gap-3 animate-slide-down shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <span className="font-bold">{toast.type === 'success' ? '✅' : '❌'} {toast.message}</span>
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setSelectedUser(null)} />
            <div className="relative glass-card w-full max-w-2xl bg-[#0d0d0d] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
                <div className="p-10 border-b border-white/10 flex justify-between items-start">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 flex items-center justify-center text-3xl font-black text-indigo-100 border border-indigo-500/30">{selectedUser.name ? selectedUser.name[0].toUpperCase() : "?"}</div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tight">{selectedUser.name || "Pupil Node"}</h3>
                            <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">{selectedUser.phone || selectedUser.jid.split('@')[0]}</p>
                        </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-gray-500 hover:text-white">✕</button>
                </div>
                
                <div className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
                    {loadingDetails ? (
                        <div className="h-64 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                        </div>
                    ) : userDetails && (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Texts", val: userDetails.counts.text, color: "text-blue-400" },
                                    { label: "Images", val: userDetails.counts.image, color: "text-purple-400" },
                                    { label: "Voices", val: userDetails.counts.audio, color: "text-green-400" },
                                    { label: "Docs", val: userDetails.counts.document, color: "text-orange-400" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white/5 rounded-3xl p-5 border border-white/5 text-center flex flex-col justify-center gap-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                                        <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Activity Trend</h4>
                                    <span className="text-[10px] font-bold text-gray-600">(Last 7 Days)</span>
                                </div>
                                <div className="h-32 flex items-end gap-1.5 md:gap-3 px-2">
                                    {userDetails.activity.map((item: any, i: number) => {
                                        const max = Math.max(...userDetails.activity.map((a: any) => a.val));
                                        const height = max > 0 ? (item.val / max) * 100 : 0;
                                        return (
                                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div className="relative w-full">
                                                    <div 
                                                        className="w-full bg-gradient-to-t from-indigo-600/40 to-indigo-400/80 rounded-t-lg transition-all duration-1000 origin-bottom shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                                                        style={{ height: `${Math.max(height, 5)}%` }}
                                                    />
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap z-10">{item.val} items</div>
                                                </div>
                                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-tighter w-full text-center truncate">{item.day.split('-').slice(1).reverse().join('/')}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-sm py-2">
                                    <span className="text-gray-500 font-bold">Registration Status</span>
                                    <span className={selectedUser.is_registered ? "text-indigo-400 font-black" : "text-gray-600 font-bold"}>{selectedUser.is_registered ? "PREMIUM" : "FREE TIER"}</span>
                                </div>
                                <div className="flex justify-between text-sm py-2">
                                    <span className="text-gray-500 font-bold">Email Identification</span>
                                    <span className="text-white font-bold">{selectedUser.email || "Not Provided"}</span>
                                </div>
                                <div className="flex justify-between text-sm py-2">
                                    <span className="text-gray-500 font-bold">First Deployment</span>
                                    <span className="text-white font-bold">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight glow-text leading-tight">Analytics</h1>
            <p className="text-gray-400 text-lg font-medium tracking-tight">Intelligence control center v2.5</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="hidden lg:flex items-center gap-2 mr-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.4em]">Live System Analysis</span>
            </div>
            <button onClick={fetchData} className="p-4 glass rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex-1 md:flex-none flex justify-center"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg></button>
            <button onClick={() => { sessionStorage.removeItem("studyit_admin_verified"); setIsAuthorized(false); }} className="px-8 py-4 bg-red-500/10 text-red-400 text-sm font-bold rounded-2xl border border-red-500/20 hover:bg-red-500/20 transition-all flex-1 md:flex-none">Logout</button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Active Users", val: stats.totalUsers, sub: `+${stats.newUsersToday} New Today`, color: "text-green-400" },
            { label: "Pro Subscriptions", val: stats.registeredUsers, sub: `${proPercentage.toFixed(1)}% Conversion`, color: "text-purple-400" },
            { label: "AI Inquiries", val: stats.totalMessages, sub: `~${(stats.totalMessages / (stats.totalUsers || 1)).toFixed(1)}/user`, color: "text-blue-400" },
          ].map((item, i) => (
            <div key={i} className="glass rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between h-44 hover:border-white/20 transition-all bg-white/[0.03] shadow-lg">
              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{item.label}</p>
              <h2 className="text-5xl font-extrabold tracking-tight">{loading ? "..." : item.val}</h2>
              <div className={`${item.color} text-sm font-bold`}>{item.sub}</div>
            </div>
          ))}
          <div className="glass rounded-[2rem] p-8 border border-white/10 flex items-center justify-center h-44 bg-white/[0.03] shadow-lg">
             <div className="relative flex items-center justify-center">
                <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                    <circle cx="56" cy="56" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={314} strokeDashoffset={314 - (314 * proPercentage) / 100} strokeLinecap="round" className="text-indigo-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-bold">{proPercentage.toFixed(0)}%</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Pro Split</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 space-y-8 bg-white/[0.02] shadow-xl">
              <div className="space-y-1">
                <h3 className="text-3xl font-extrabold tracking-tight">Broadcast Center</h3>
                <p className="text-gray-500 font-medium text-sm">Send a message to all students (Sends with official image)</p>
              </div>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-2 text-white">
                  {templates.map((t) => (
                    <button key={t.name} onClick={() => setBroadcastMessage(t.text)} className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-indigo-600/20 hover:border-indigo-500/30 transition-all">{t.name}</button>
                  ))}
                </div>
                <textarea 
                    value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type your official announcement..."
                    className="w-full h-40 bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-white resize-none font-medium text-lg leading-relaxed shadow-inner"
                />
                <div className="flex justify-end">
                  <button 
                    onClick={async () => {
                      if (!broadcastMessage.trim() || isBroadcasting) return;
                      setIsBroadcasting(true);
                      try {
                        const { error } = await supabase.from('broadcasts').insert([{ message: broadcastMessage }]);
                        if (error) throw error;
                        showToast("Broadcast queued successfully!", "success");
                        setBroadcastMessage(""); fetchData();
                      } catch (err: any) { showToast("Error: " + err.message, "error"); } finally { setIsBroadcasting(false); }
                    }}
                    disabled={!broadcastMessage.trim() || isBroadcasting}
                    className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95"
                  >
                    {isBroadcasting ? "Transmitting..." : "Send Global Broadcast"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 glass rounded-[2.5rem] p-8 border border-white/10 flex flex-col space-y-6 bg-white/[0.02] shadow-xl">
            <h3 className="text-xl font-extrabold tracking-tight">Recent Broadcasts</h3>
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {broadcasts.length === 0 ? (<div className="h-40 flex items-center justify-center text-gray-600 font-bold italic text-sm">No history found</div>) : broadcasts.map((b) => (
                    <div key={b.id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl space-y-2 hover:border-white/20 transition-all">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold text-indigo-400">{new Date(b.created_at).toLocaleDateString()}</span><span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${b.status === 'sent' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{b.status}</span></div>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-3">"{b.message}"</p>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-[3rem] overflow-hidden border border-white/10 shadow-xl bg-white/[0.01]">
          <div className="p-8 md:p-10 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1"><h3 className="text-4xl font-extrabold tracking-tight">User Explorer</h3><p className="text-gray-500 font-medium text-sm">Reviewing {filteredUsers.length} student nodes</p></div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-full md:w-auto"><button onClick={() => setFilter("all")} className={`flex-1 md:flex-none px-8 py-3 rounded-[1rem] text-xs font-bold transition-all ${filter === "all" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}>All</button><button onClick={() => setFilter("registered")} className={`flex-1 md:flex-none px-8 py-3 rounded-[1rem] text-xs font-bold transition-all ${filter === "registered" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}>Registered</button></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/10 bg-white/[0.02] text-gray-500 text-[10px] font-bold uppercase tracking-widest"><th className="px-10 py-6">ID Node</th><th className="px-10 py-6">Tier</th><th className="px-10 py-6">Usage</th><th className="px-10 py-6 hidden md:table-cell">Created</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const limit = user.is_registered ? 100 : 5;
                  const usagePercent = Math.min((user.daily_usage / limit) * 100, 100);
                  return (
                    <tr key={user.jid} onClick={() => fetchUserDetail(user)} className="hover:bg-white/[0.04] cursor-pointer transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4 text-white">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-xl font-bold border border-white/5 group-hover:scale-105 transition-transform">{user.name ? user.name[0].toUpperCase() : "?"}</div>
                          <div>
                            <div className="font-bold text-white text-lg tracking-tight">{user.name || "Pupil Node"}</div>
                            <div className="text-[10px] text-gray-500 font-bold tracking-tight">#{user.phone || user.jid.split('@')[0]}</div>
                            {user.email && <div className="text-[10px] text-indigo-400 font-medium mt-0.5">{user.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6"><span className={`px-4 py-1.5 text-[9px] font-bold uppercase rounded-full ${user.is_registered ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30" : "bg-gray-500/10 text-gray-500 border border-white/10"}`}>{user.is_registered ? "PRO" : "FREE"}</span></td>
                      <td className="px-10 py-6"><div className="space-y-1.5"><div className="flex justify-between text-[11px] font-bold"><span className="text-gray-500">Usage</span><span className="text-white">{user.daily_usage}/{limit}</span></div><div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${usagePercent}%` }} /></div></div></td>
                      <td className="px-10 py-6 hidden md:table-cell"><div className="text-white font-bold text-sm text-white font-bold">{new Date(user.created_at).toLocaleDateString()}</div><div className="text-gray-600 text-[10px] font-bold mt-0.5">{new Date(user.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .glass { backdrop-filter: blur(40px); }
        .glass-card { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(50px); }
        .glow-text { background: linear-gradient(135deg, #fff 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes slide-down { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50% , 0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
      `}</style>
    </main>
  );
}
