"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminPasscode } from "./actions";

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
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const filteredUsers = filter === "all" ? users : users.filter(u => u.is_registered);

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
      // Fetch Users
      const { data: usersData, count: totalCount } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .order('created_at', { ascending: false });
      
      const registeredCount = usersData?.filter(u => u.is_registered).length || 0;
      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = usersData?.filter(u => u.created_at?.startsWith(today)).length || 0;

      // Fetch Message Count
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq('role', 'user');

      // Fetch Recent Broadcasts
      const { data: broadcastData } = await supabase
        .from("broadcasts")
        .select("*")
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: totalCount || 0,
        registeredUsers: registeredCount,
        totalMessages: messagesCount || 0,
        newUsersToday,
      });
      setUsers(usersData || []);
      setBroadcasts(broadcastData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!mounted) return null;

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#050505] overflow-hidden relative text-white font-sans">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-mesh" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-mesh animate-pulse-slow" />
        </div>
        <div className="relative z-10 w-full max-w-md glass p-10 rounded-[2.5rem] space-y-8 border border-white/10 shadow-2xl">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter glow-text">Admin Login</h1>
            <p className="text-gray-400 font-medium">Study-It V2 Dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              required
              placeholder="••••"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white text-center text-3xl tracking-[0.5em]"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />
            {error && <p className="text-red-400 text-sm text-center font-bold animate-shake">{error}</p>}
            <button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
              Access Dashboard
            </button>
          </form>
        </div>
      </main>
    );
  }

  const proPercentage = stats.totalUsers > 0 ? (stats.registeredUsers / stats.totalUsers) * 100 : 0;

  return (
    <main className="min-h-screen w-full bg-[#030303] text-white p-6 md:p-12 relative overflow-x-hidden">
      <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl border flex items-center gap-3 animate-slide-down shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            {toast.type === 'success' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            )}
            <span className="font-bold tracking-tight">{toast.message}</span>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <h1 className="text-6xl font-black tracking-tighter glow-text leading-tight">Analytics</h1>
            <p className="text-gray-400 text-lg font-medium tracking-tight">Intelligence control center v2.1</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-4 glass hover:bg-white/5 rounded-2xl border border-white/10 transition-all group">
              <svg className="group-hover:rotate-180 transition-transform duration-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            </button>
            <button onClick={() => { sessionStorage.removeItem("studyit_admin_verified"); setIsAuthorized(false); }} className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all font-bold">Logout</button>
          </div>
        </header>

        {/* Top Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Active Users", val: stats.totalUsers, sub: `+${stats.newUsersToday} New`, color: "text-green-400" },
            { label: "Pro Subscriptions", val: stats.registeredUsers, sub: `${proPercentage.toFixed(1)}% Conv`, color: "text-purple-400" },
            { label: "AI Inquiries", val: stats.totalMessages, sub: `~${(stats.totalMessages / (stats.totalUsers || 1)).toFixed(1)}/user`, color: "text-blue-400" },
          ].map((item, i) => (
            <div key={i} className="glass-card p-8 rounded-[2rem] border border-white/10 flex flex-col justify-between h-44 hover:border-white/20 transition-all">
                <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{item.label}</p>
                <h2 className="text-6xl font-black tracking-tighter">{loading ? "..." : item.val}</h2>
                <div className={`${item.color} text-sm font-bold tracking-tight`}>{item.sub}</div>
            </div>
          ))}
          
          <div className="glass-card p-8 rounded-[2rem] border border-white/10 flex items-center justify-center h-44">
             <div className="relative flex items-center justify-center">
                <svg className="w-[100px] h-[100px] transform -rotate-90">
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                    <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={276} strokeDashoffset={276 - (276 * proPercentage) / 100} strokeLinecap="round" className="text-indigo-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xl font-black">{proPercentage.toFixed(0)}%</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">Pro Split</span>
                </div>
             </div>
          </div>
        </div>

        {/* Global Broadcast Center v2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 glass-card p-8 rounded-[2.5rem] border border-white/10 space-y-6 relative overflow-hidden group shadow-2xl">
                <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700">
                    <svg width="240" height="240" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                </div>
                
                <div className="space-y-1 relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter">Global Broadcast</h3>
                    <p className="text-gray-500 text-sm font-medium tracking-tight">Real-time transmitter to all registered students.</p>
                </div>

                <div className="space-y-4 relative z-10">
                    <textarea 
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="What's the announcement today?"
                        className="w-full h-36 bg-white/[0.03] border border-white/10 rounded-[1.5rem] p-6 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white resize-none font-medium leading-relaxed placeholder:text-gray-600 shadow-inner"
                    />
                    
                    <div className="flex items-center justify-end">
                        <button 
                            onClick={async () => {
                                if (!broadcastMessage.trim() || isBroadcasting) return;
                                setIsBroadcasting(true);
                                try {
                                    const { error } = await supabase.from('broadcasts').insert([{ message: broadcastMessage }]);
                                    if (error) throw error;
                                    showToast("Transmission successful! Bot initialized.", "success");
                                    setBroadcastMessage("");
                                    fetchData(); // Refresh history
                                } catch (err: any) {
                                    showToast("Transmission failure: " + err.message, "error");
                                } finally {
                                    setIsBroadcasting(false);
                                }
                            }}
                            disabled={!broadcastMessage.trim() || isBroadcasting}
                            className="group px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-black uppercase tracking-[0.1em] rounded-[1.2rem] transition-all shadow-xl shadow-indigo-600/20 active:scale-95 flex items-center gap-3 overflow-hidden relative"
                        >
                            {isBroadcasting ? (
                                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <svg className="group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
                            )}
                            Transmit Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Previous Broadcasts History */}
            <div className="lg:col-span-4 glass-card p-8 rounded-[2.5rem] border border-white/10 flex flex-col space-y-6">
                <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight">Recent Activity</h3>
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Broadcast History</p>
                </div>
                
                <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                    {broadcasts.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-gray-600 text-sm italic font-medium">No previous broadcasts.</div>
                    ) : broadcasts.map((b) => (
                        <div key={b.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 hover:bg-white/[0.04] transition-all group">
                            <div className="flex justify-between items-start">
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${b.status === 'sent' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                    {b.status}
                                </span>
                                <span className="text-[10px] text-gray-600 font-bold">{new Date(b.created_at).toLocaleDateString([], {month: 'short', day: 'numeric'})}</span>
                            </div>
                            <p className="text-xs text-gray-400 line-clamp-2 font-medium leading-relaxed group-hover:text-gray-200 transition-colors uppercase tracking-tight italic">"{b.message}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* User Explorer */}
        <div className="glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="p-10 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
            <div className="space-y-1">
              <h3 className="text-4xl font-black tracking-tighter">User Explorer</h3>
              <p className="text-gray-500 font-medium text-sm">Real-time audit of all connected student nodes.</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-[1.2rem] border border-white/10 shadow-inner">
                <button onClick={() => setFilter("all")} className={`px-8 py-2.5 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all ${filter === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-gray-400 hover:text-white"}`}>All</button>
                <button onClick={() => setFilter("registered")} className={`px-8 py-2.5 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all ${filter === "registered" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-gray-400 hover:text-white"}`}>Pro Only</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">ID Node & Pupil Identity</th>
                  <th className="px-10 py-6">Tier Status</th>
                  <th className="px-10 py-6">Resource Usage</th>
                  <th className="px-10 py-6">Deployment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const limit = user.is_registered ? 100 : 5;
                  const usagePercent = Math.min((user.daily_usage / limit) * 100, 100);
                  return (
                    <tr key={user.jid} className="hover:bg-indigo-600/[0.03] transition-all group">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center text-2xl font-black border border-white/5 text-indigo-100 group-hover:scale-105 transition-transform">{user.name ? user.name[0].toUpperCase() : "?"}</div>
                          <div className="space-y-1">
                            <div className="font-black text-white text-xl tracking-tighter flex items-center gap-2">
                               {user.name || "Pupil Node"}
                               {user.is_registered && <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm-1.172-6.903-3.047-3.047-1.414 1.414 4.461 4.462 7.162-7.162-1.414-1.414-5.748 5.747Z"/></svg>}
                            </div>
                            <div className="flex flex-col text-xs text-gray-500 font-bold uppercase tracking-tight">
                              <span>#{user.phone || user.jid.split('@')[0]}</span>
                              {user.email && <span className="text-indigo-400/60 lowercase mt-0.5">{user.email}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`px-5 py-2 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border shadow-sm ${user.is_registered ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-gray-500/10 text-gray-500 border-white/10"}`}>
                          {user.is_registered ? "Premium" : "Standard"}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="space-y-2.5">
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-tighter"><span className="text-gray-500">Inquiry Quota</span><span className="text-white">{user.daily_usage}/{limit}</span></div>
                          <div className="w-40 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 relative" style={{ width: `${usagePercent}%` }}>
                                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                              </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-gray-400 font-black tracking-tight">{new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-1">AT {new Date(user.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-10 border-t border-white/10 bg-white/[0.01] text-center text-gray-700 text-[9px] font-black uppercase tracking-[0.4em]">Audit Sequence Terminated</div>
        </div>
      </div>

      <style jsx global>{`
        .glass { background: rgba(5, 5, 5, 0.7); backdrop-filter: blur(25px); }
        .glass-card { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(50px); }
        .glow-text { background: linear-gradient(135deg, #fff 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes mesh { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(3%, 3%) scale(1.05); } }
        .animate-mesh { animation: mesh 25s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse 10s infinite ease-in-out; }
        @keyframes slide-down { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </main>
  );
}
