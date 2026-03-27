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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const isAdmin = sessionStorage.getItem("studyit_admin_verified");
    if (isAdmin === "true") {
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
      fetchStats();
    }
  }, [isAuthorized]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch Users
      const { data: usersData, count: totalCount } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .order('created_at', { ascending: false });
      
      const registeredCount = usersData?.filter(u => u.is_registered).length || 0;

      // Count new users today
      const today = new Date().toISOString().split('T')[0];
      const newUsersToday = usersData?.filter(u => u.created_at?.startsWith(today)).length || 0;

      // Fetch Message Count (User inquiries)
      const { count: messagesCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq('role', 'user');

      setStats({
        totalUsers: totalCount || 0,
        registeredUsers: registeredCount,
        totalMessages: messagesCount || 0,
        newUsersToday,
      });
      setUsers(usersData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (!isAuthorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#030303] overflow-hidden relative text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-mesh" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-mesh animate-pulse-slow" />
        </div>

        <div className="relative z-10 w-full max-w-md glass p-10 rounded-[2.5rem] space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter">Admin Portal</h1>
            <p className="text-gray-400">Login to Dashboard V2</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500 ml-1">Enter Passcode</label>
              <input
                type="password"
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white text-center text-2xl tracking-[1.0em]"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20"
            >
              Verify Identity
            </button>
          </form>
        </div>
      </main>
    );
  }

  const proPercentage = stats.totalUsers > 0 ? (stats.registeredUsers / stats.totalUsers) * 100 : 0;

  return (
    <main className="min-h-screen w-full bg-[#030303] text-white p-6 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
            <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[140px]" />
            <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[140px]" />
        </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20 mb-2">
              CORE SYSTEM ONLINE
            </div>
            <h1 className="text-6xl font-bold tracking-tighter leading-none glow-text">Analytics v2</h1>
            <p className="text-gray-400 text-xl font-medium">Real-time intelligence dashboard.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block mr-2">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Server Status</p>
              <p className="text-green-400 font-bold shrink-0">OPERATIONAL</p>
            </div>
            <button 
                onClick={fetchStats}
                className="p-4 glass hover:bg-white/5 rounded-2xl border border-white/10 transition-all"
                title="Refresh Analytics"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            </button>
            <button 
                onClick={() => {
                    sessionStorage.removeItem("studyit_admin_verified");
                    setIsAuthorized(false);
                }}
                className="px-8 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl border border-red-500/20 transition-all font-bold"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-8 rounded-[2rem] space-y-3 border border-white/10 group hover:border-indigo-500/30 transition-all">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-sm font-bold tracking-wider uppercase">Active Users</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 className="text-5xl font-bold tracking-tight text-white">{loading ? "..." : stats.totalUsers}</h2>
            <div className="text-green-400 text-sm font-bold">+{stats.newUsersToday} New Today</div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] space-y-3 border border-white/10 group hover:border-purple-500/30 transition-all">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-sm font-bold tracking-wider uppercase">Pro Subscriptions</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <h2 className="text-5xl font-bold tracking-tight text-white">{loading ? "..." : stats.registeredUsers}</h2>
            <div className="text-purple-400 text-sm font-bold">{proPercentage.toFixed(1)}% Conversion Rate</div>
          </div>

          <div className="glass-card p-8 rounded-[2rem] space-y-3 border border-white/10 group hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-center text-gray-500">
              <span className="text-sm font-bold tracking-wider uppercase">AI Inquiries</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <h2 className="text-5xl font-bold tracking-tight text-white">{loading ? "..." : stats.totalMessages}</h2>
            <div className="text-blue-400 text-sm font-bold">~{(stats.totalMessages / (stats.totalUsers || 1)).toFixed(1)} per user</div>
          </div>

          {/* Visual Progress Ring Card */}
          <div className="glass-card p-8 rounded-[2rem] border border-white/10 flex items-center justify-center relative group">
             <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={364}
                        strokeDashoffset={364 - (364 * proPercentage) / 100}
                        strokeLinecap="round"
                        className="text-indigo-500 transition-all duration-1000 ease-out" 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{proPercentage.toFixed(0)}%</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Pro Split</span>
                </div>
             </div>
          </div>
        </div>

        {/* User Explorer */}
        <div className="glass rounded-[3rem] overflow-hidden border border-white/10 bg-white/[0.01]">
          <div className="p-10 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">User Explorer</h3>
              <p className="text-gray-500 font-medium">Detailed audit of all connected students.</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20">All Users</button>
                <button className="px-6 py-2 text-gray-400 hover:text-white rounded-xl text-sm font-bold transition-all">Registered</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-gray-500 text-[11px] font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">Identity & Contact</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Engagement</th>
                  <th className="px-10 py-6">Created On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.jid} className="group hover:bg-indigo-600/[0.03] transition-all cursor-default">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 flex items-center justify-center text-xl font-bold border border-white/5 text-white/50 group-hover:text-white transition-all">
                          {user.name ? user.name[0].toUpperCase() : "?"}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-white text-lg tracking-tight flex items-center gap-2">
                             {user.name || "Unknown Pupil"}
                             {user.is_registered && <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Zm-1.172-6.903-3.047-3.047-1.414 1.414 4.461 4.462 7.162-7.162-1.414-1.414-5.748 5.747Z"/></svg>}
                          </div>
                          <div className="flex flex-col text-sm">
                            <span className="text-gray-500 font-medium">#{user.phone || user.jid.split('@')[0]}</span>
                            {user.email && <span className="text-indigo-400/60 font-medium lowercase">{user.email}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {user.is_registered ? (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                          Premium
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-500/10 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-white/10">
                          Basic
                        </div>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-gray-500 uppercase tracking-tighter">Usage</span>
                            <span className="text-white">{user.daily_usage}/100</span>
                        </div>
                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                style={{ width: `${Math.min(user.daily_usage , 100)}%` }} 
                            />
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-gray-400 font-bold tracking-tight">
                        {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        at {new Date(user.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 border-t border-white/10 bg-white/[0.01] text-center">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-[0.3em]">End of Audit Trail</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .glass {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(40px);
        }
        .glow-text {
          background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @keyframes mesh {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(5%, 5%) scale(1.1); }
        }
        .animate-mesh {
          animation: mesh 20s infinite ease-in-out;
        }
        .animate-pulse-slow {
          animation: pulse 8s infinite ease-in-out;
        }
      `}</style>
    </main>
  );
}
