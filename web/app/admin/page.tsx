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
      const { data: usersData, count: totalCount } = await supabase.from("users").select("*", { count: "exact" }).order('created_at', { ascending: false });
      const registeredCount = usersData?.filter(u => u.is_registered).length || 0;
      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = usersData?.filter(u => u.created_at?.startsWith(today)).length || 0;
      const { count: messagesCount } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq('role', 'user');
      const { data: broadcastData } = await supabase.from("broadcasts").select("*").order('created_at', { ascending: false }).limit(5);

      setStats({ totalUsers: totalCount || 0, registeredUsers: registeredCount, totalMessages: messagesCount || 0, newUsersToday });
      setUsers(usersData || []);
      setBroadcasts(broadcastData || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!mounted) return null;

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#050505] overflow-hidden relative text-white font-sans">
        <div className="absolute inset-0 z-0"><div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-mesh" /><div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-mesh animate-pulse-slow" /></div>
        <div className="relative z-10 w-full max-w-md glass p-10 rounded-[2.5rem] space-y-8 border border-white/10 shadow-2xl">
          <div className="text-center space-y-1"><h1 className="text-4xl font-black tracking-tighter glow-text uppercase">Study-It Admin</h1><p className="text-gray-500 font-bold text-xs tracking-widest uppercase">Encryption Mode Active</p></div>
          <form onSubmit={handleLogin} className="space-y-6"><input type="password" required placeholder="••••" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white text-center text-3xl tracking-[0.5em]" value={passcode} onChange={(e) => setPasscode(e.target.value)} />{error && <p className="text-red-400 text-sm text-center font-bold">{error}</p>}<button type="submit" className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95">Verify Identification</button></form>
        </div>
      </main>
    );
  }

  const proPercentage = stats.totalUsers > 0 ? (stats.registeredUsers / stats.totalUsers) * 100 : 0;

  return (
    <main className="min-h-screen w-full bg-[#030303] text-white p-6 md:p-12 relative overflow-x-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-40"><div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[140px]" /><div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[140px]" /></div>

      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl border flex items-center gap-3 animate-slide-down shadow-2xl backdrop-blur-xl ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
            <span className="font-black text-xs uppercase tracking-[0.2em]">{toast.type === 'success' ? '✔' : '✘'} {toast.message}</span>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-1">
            <div className="inline-flex items-center px-4 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 mb-2">Authenticated Session</div>
            <h1 className="text-7xl font-black tracking-tighter glow-text leading-tight uppercase">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchData} className="p-4 glass rounded-[1.2rem] border border-white/10 hover:bg-white/5 transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg></button>
            <button onClick={() => { sessionStorage.removeItem("studyit_admin_verified"); setIsAuthorized(false); }} className="px-10 py-5 bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest rounded-[1.2rem] border border-red-500/20 hover:bg-red-500/20 transition-all">Terminate session</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Students", val: stats.totalUsers, sub: `+${stats.newUsersToday} Today`, color: "text-green-500" },
            { label: "Pro Conversion", val: stats.registeredUsers, sub: `${proPercentage.toFixed(1)}% Active`, color: "text-purple-500" },
            { label: "AI Resource Load", val: stats.totalMessages, sub: `Avg Inquiry Rate`, color: "text-blue-500" },
          ].map((item, i) => (
            <div key={i} className="glass-card p-10 rounded-[2.5rem] border border-white/10 flex flex-col justify-between h-52 group hover:border-white/20 transition-all">
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">{item.label}</p>
                <h2 className="text-7xl font-black tracking-tighter group-hover:scale-105 transition-transform origin-left">{loading ? "..." : item.val}</h2>
                <div className={`${item.color} text-[10px] font-black uppercase tracking-widest`}>{item.sub}</div>
            </div>
          ))}
          <div className="glass-card p-10 rounded-[2.5rem] border border-white/10 flex items-center justify-center h-52">
             <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * proPercentage) / 100} strokeLinecap="round" className="text-indigo-500 transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black">{proPercentage.toFixed(0)}%</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">Pro Split</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
                <div className="glass-card p-10 rounded-[3rem] border border-white/10 space-y-8 relative overflow-hidden group">
                    <div className="space-y-1 relative z-10">
                        <h3 className="text-4xl font-black tracking-tighter uppercase">Official Broadcast</h3>
                        <p className="text-gray-500 font-bold text-sm tracking-tight uppercase opacity-50">Transmitter Sequence 0x01</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <p className="w-full text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Templates:</p>
                            {templates.map((t) => (
                                <button key={t.name} onClick={() => setBroadcastMessage(t.text)} className="px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all">{t.name}</button>
                            ))}
                        </div>
                        <textarea 
                            value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)}
                            placeholder="TRANSMISSION CONTENT..."
                            className="w-full h-44 bg-black/40 border border-white/10 rounded-[2rem] p-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-white resize-none font-bold text-lg leading-relaxed placeholder:text-gray-800"
                        />
                        <div className="flex justify-end pt-2">
                            <button 
                                onClick={async () => {
                                    if (!broadcastMessage.trim() || isBroadcasting) return;
                                    setIsBroadcasting(true);
                                    try {
                                        const { error } = await supabase.from('broadcasts').insert([{ message: broadcastMessage }]);
                                        if (error) throw error;
                                        showToast("BROADCAST COMMITTED", "success");
                                        setBroadcastMessage(""); fetchData();
                                    } catch (err: any) { showToast("ERROR: " + err.message, "error"); } finally { setIsBroadcasting(false); }
                                }}
                                disabled={!broadcastMessage.trim() || isBroadcasting}
                                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-black uppercase tracking-[0.2em] rounded-[1.5rem] transition-all shadow-2xl shadow-indigo-600/20 active:scale-95"
                            >
                                {isBroadcasting ? "TRANSMITTING..." : "Initiate Broadcast"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 glass-card p-10 rounded-[3rem] border border-white/10 flex flex-col space-y-8">
                <div className="space-y-1"><h3 className="text-2xl font-black tracking-tight uppercase">History</h3><p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Previous Transmissions</p></div>
                <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {broadcasts.length === 0 ? (<div className="h-40 flex items-center justify-center text-gray-700 font-bold uppercase tracking-widest text-xs italic">No data logs found</div>) : broadcasts.map((b) => (
                        <div key={b.id} className="space-y-2 group">
                            <div className="flex justify-between items-center"><span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">{new Date(b.created_at).toLocaleDateString()}</span><span className="text-[8px] font-black uppercase tracking-widest text-gray-600">{b.status}</span></div>
                            <p className="text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-3 uppercase tracking-tighter opacity-80 group-hover:opacity-100 transition-opacity">"{b.message}"</p>
                            <div className="h-[1px] w-full bg-white/5 mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="p-10 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01]">
            <div className="space-y-1"><h3 className="text-4xl font-black tracking-tighter uppercase">Student Nodes</h3><p className="text-gray-500 font-bold text-xs tracking-widest uppercase">System Audit Sequence</p></div>
            <div className="flex bg-white/5 p-1 rounded-[1.2rem] border border-white/10"><button onClick={() => setFilter("all")} className={`px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === "all" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}>All Nodes</button><button onClick={() => setFilter("registered")} className={`px-8 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all ${filter === "registered" ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-white"}`}>Pro Tier</button></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="border-b border-white/10 bg-white/[0.02] text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]"><th className="px-10 py-8 text-center w-24">Avat</th><th className="px-10 py-8">Identification</th><th className="px-10 py-8">Status</th><th className="px-10 py-8">Quota Load</th><th className="px-10 py-8">Creation</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const limit = user.is_registered ? 100 : 5;
                  const usagePercent = Math.min((user.daily_usage / limit) * 100, 100);
                  return (
                    <tr key={user.jid} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-10 py-8 text-center"><div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-2xl font-black mx-auto border border-white/5 group-hover:scale-110 transition-transform">{user.name ? user.name[0].toUpperCase() : "?"}</div></td>
                      <td className="px-10 py-8"><div className="font-black text-white text-xl tracking-tighter">{user.name || "PUPIL_NODE"}</div><div className="text-[10px] text-gray-500 font-black tracking-widest uppercase mt-1">#{user.phone || user.jid.split('@')[0]}</div></td>
                      <td className="px-10 py-8"><span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-md ${user.is_registered ? "bg-indigo-600 text-white" : "border border-white/10 text-gray-500"}`}>{user.is_registered ? "PLATINUM" : "STANDARD"}</span></td>
                      <td className="px-10 py-8"><div className="space-y-2"><div className="flex justify-between text-[11px] font-black uppercase tracking-tighter"><span className="text-gray-500">Resource</span><span className="text-white">{user.daily_usage}/{limit}</span></div><div className="w-44 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${usagePercent}%` }} /></div></div></td>
                      <td className="px-10 py-8"><div className="text-white font-black text-sm">{new Date(user.created_at).toLocaleDateString()}</div><div className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-1">T_{new Date(user.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-12 text-center text-gray-700 text-[9px] font-black uppercase tracking-[0.5em] opacity-30">Sequence End // Audit Complete</div>
        </div>
      </div>

      <style jsx global>{`
        .glass { background: rgba(5, 5, 5, 0.9); backdrop-filter: blur(40px); }
        .glass-card { background: rgba(255, 255, 255, 0.01); backdrop-filter: blur(60px); }
        .glow-text { background: linear-gradient(135deg, #fff 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        @keyframes mesh { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(2%, 2%) scale(1.02); } }
        .animate-mesh { animation: mesh 30s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse 12s infinite ease-in-out; }
        @keyframes slide-down { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50% , 0); opacity: 1; } }
        .animate-slide-down { animation: slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </main>
  );
}
