"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquareHeart, Send, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus("idle");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || "");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setFormStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setFormStatus("error");
      }
    } catch (err) {
      setFormStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-32 px-4 sm:px-6 lg:px-8 z-10 border-t border-white/5 bg-[#030303]/50">

      {/* Background Decor */}
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[10%] w-[30%] h-[30%] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-20">

        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs font-black tracking-widest uppercase"
          >
            <Sparkles className="w-4 h-4" />
            Contact & Support
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white glow-text">
            Master the Future. <br />
            <span className="text-indigo-400">Together.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            Have a feature request? Want to give feedback? Or simply need help? <br className="hidden md:block" />
            Drop us a line and let's make Study-It even better.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left: Contact Info - Now order-2 (bottom) on mobile, lg:order-1 (left) on desktop */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8 order-2 lg:order-1"
          >
            <div className="glass-card flex items-start gap-3 md:gap-6 p-4 md:p-10 group hover:border-indigo-500/30 transition-all duration-500">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 md:w-8 md:h-8 text-indigo-400" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-lg md:text-2xl font-bold text-white">Email Us</h3>
                <p className="text-xs md:text-base text-gray-400 font-medium leading-tight md:leading-normal">For support, enterprise inquiries, and partnerships.</p>
                <a href="https://studyit-bot.vercel.app/" className="text-base md:text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-block pt-1 md:pt-2">
                  Available Soon!
                </a>
              </div>
            </div>

            <div className="glass-card flex items-start gap-3 md:gap-6 p-4 md:p-10 group hover:border-indigo-500/30 transition-all duration-500">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MessageSquareHeart className="w-5 h-5 md:w-8 md:h-8 text-indigo-400" />
              </div>
              <div className="space-y-1 md:space-y-2">
                <h3 className="text-lg md:text-2xl font-bold text-white">Join The Community</h3>
                <p className="text-xs md:text-base text-gray-400 font-medium leading-tight md:leading-normal">Connect with other students and educators.</p>
                <p className="text-base md:text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors inline-block pt-1 md:pt-2">Available Soon!</p>
              </div>
            </div>


          </motion.div>

          {/* Right: Form - Now order-1 (top) on mobile, lg:order-2 (right) on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-4 sm:p-10 relative overflow-hidden order-1 lg:order-2"
          >
            {/* Glossy decorative line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50" />

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 tracking-wider uppercase ml-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="John Doe"
                    className="w-full h-14 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-medium outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 tracking-wider uppercase ml-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                    className="w-full h-14 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-medium outline-none transition-all placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 tracking-wider uppercase ml-1">Subject</label>
                <select
                  name="subject"
                  required
                  className="w-full h-14 px-6 rounded-2xl bg-[#111] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-medium outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="Suggestion">Product Suggestion</option>
                  <option value="Bug Report">Technical Issue / Bug</option>
                  <option value="Feature Request">New Feature Request</option>
                  <option value="Other">General Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 tracking-wider uppercase ml-1">Detailed Message</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  className="w-full p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 text-white font-medium outline-none transition-all placeholder:text-gray-600 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-16 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] ${isSubmitting
                  ? "bg-indigo-600/50 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25"
                  }`}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>

              <AnimatePresence>
                {formStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Sent successfully! We'll get back to you soon.
                  </motion.div>
                )}
                {formStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold"
                  >
                    <AlertCircle className="w-5 h-5" />
                    Failed to send. Please try again later.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
