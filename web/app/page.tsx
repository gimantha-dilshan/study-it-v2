"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegistrationPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [whatsappId, setWhatsappId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const pureNumber = whatsappId.replace(/\D/g, "");

      if (!pureNumber || pureNumber.length < 8) {
        setStatus("error");
        setMessage("Please enter a valid WhatsApp number with country code.");
        return;
      }

      // Find the user - support both standard JID and the new LID format
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .or(`jid.ilike.%${pureNumber}%,phone.ilike.%${pureNumber}%`)
        .single();

      if (fetchError) {
        if (fetchError.code === "PGRST116") {
           setStatus("error");
           setMessage("Number not found. Please send any message to the bot on WhatsApp first so it can recognize you!");
        } else {
           throw fetchError;
        }
        return;
      }

      console.log("Found user profile:", user.jid);

      // 1. Update the user profile to 'is_registered'
      const { error: updateError } = await supabase
        .from("users")
        .update({
          is_registered: true,
          email: email
        })
        .eq("jid", user.jid);

      if (updateError) {
        console.error("Update Error:", updateError);
        throw new Error("Failed to update profile. Check your Supabase RLS policies.");
      }

      // 2. Trigger registration event for the WhatsApp bot to send the 'Welcome' message
      const { error: eventError } = await supabase
        .from("registration_events")
        .insert({ jid: user.jid });

      if (eventError) {
        console.error("Event Error:", eventError);
        throw new Error("Profile updated, but failed to signal the bot. Check RLS on 'registration_events'.");
      }

      setStatus("success");
      setMessage("Your account is now Pro! You have 100 daily messages. Check your WhatsApp for a confirmation! 🚀");
    } catch (err: any) {
      console.error("Registration Process Error:", err);
      setStatus("error");
      setMessage(err.message || "A database error occurred. Please try again.");
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-[#030303]">
      {/* Dynamic Background Animation Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-mesh" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-mesh animate-pulse-slow" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] animate-mesh" style={{ animationDelay: "-5s" }} />

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Left Side: Brand & Info */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter glow-text">
              Study-It <span className="text-indigo-500">Pro</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Unlock the full potential of your AI study partner and accelerate your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                <span className="text-indigo-400 font-bold">100</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Daily Messages</h3>
                <p className="text-sm text-gray-500">Increased from 5 to 100.</p>
              </div>
            </div>
            <div className="glass-card flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <span className="text-blue-400 font-bold">🤖</span>
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">Full AI Power</h3>
                <p className="text-sm text-gray-500">Unrestricted Gemini access.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative glass rounded-[2rem] p-8 md:p-10 space-y-8 animate-float">
            {status === "success" ? (
              <div className="text-center space-y-6 py-10">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/30 scale-110">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white">Welcome, Pro!</h2>
                  <p className="text-gray-400 text-lg">{message}</p>
                </div>
                <button
                  onClick={() => setStatus("idle")}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 font-semibold"
                >
                  Register Another Account
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2 text-center md:text-left mb-8">
                  <h2 className="text-3xl font-bold text-white">Start for Free</h2>
                  <p className="text-gray-400">Join thousands of students today.</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">WhatsApp Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 947xxxxxxxx"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white placeholder:text-gray-500"
                      value={whatsappId}
                      onChange={(e) => setWhatsappId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 ml-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all text-white placeholder:text-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {status === "error" && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <p className="text-red-400 text-sm text-center bg-red-400/10 py-4 rounded-2xl border border-red-400/20 px-4">
                      {message}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="group relative w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98] overflow-hidden"
                >
                  <span className="relative z-10">
                    {status === "loading" ? "Activating Pro..." : "Activate Pro Account"}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                </button>
              </form>
            )}

            <p className="text-center text-xs text-gray-600">
              By registering, you agree to our Study-It Terms of Service.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Decoration */}
      <footer className="mt-20 text-gray-600 text-sm flex gap-6 z-10">
        <span>Supabase DB</span>
        <span>•</span>
        <span>Gemini AI</span>
        <span>•</span>
        <span>Baileys WA</span>
      </footer>
    </main>
  );
}
