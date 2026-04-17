"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto space-y-16">

        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white glow-text">
            Simple, Transparent Limits.
          </h2>
          <p className="text-xl text-gray-400 font-medium">
            Start for free. Register whenever you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card flex flex-col items-center text-center space-y-8 relative overflow-hidden"
          >
            <div className="absolute top-0 w-full h-1 bg-gray-500/20" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-300">Guest Tier</h3>
              <div className="text-4xl font-black text-white">Free</div>
            </div>

            <ul className="space-y-4 text-sm font-medium text-gray-400 text-left w-full max-w-[200px] mx-auto">
              <li className="flex items-center gap-3"><Check className="text-gray-500 w-5 h-5" /> 5 AI Messages / Day</li>
              <li className="flex items-center gap-3"><Check className="text-gray-500 w-5 h-5" /> Text Interactions</li>
              <li className="flex items-center gap-3 opacity-50"><Check className="text-gray-600 w-5 h-5" /> No Multi-modal limits</li>
              <li className="flex items-center gap-3 opacity-50"><Check className="text-gray-600 w-5 h-5" /> Priority Processing</li>
            </ul>

            <div className="pt-4 w-full">
              <button disabled className="w-full py-4 rounded-xl glass border-white/10 text-gray-500 font-bold cursor-not-allowed">
                No Action Needed
              </button>
            </div>
          </motion.div>

          {/* Pro Tier */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card border border-indigo-500/30 flex flex-col items-center text-center space-y-8 relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_50px_rgba(99,102,241,0.15)]"
          >
            {/* Awesome glowing top bar */}
            <div className="absolute top-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]" />

            <div className="space-y-2 relative z-10 px-4 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 text-indigo-300 text-xs font-black uppercase tracking-widest mt-2">
              Most Popular
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">Pro Tier</h3>
              <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                100% Free
              </div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-2">Just Register Online</p>
            </div>

            <ul className="space-y-4 text-sm font-medium text-gray-300 text-left w-full max-w-[200px] mx-auto">
              <li className="flex items-center gap-3"><Check className="text-indigo-400 w-5 h-5" /> 100 AI Messages / Day</li>
              <li className="flex items-center gap-3"><Check className="text-indigo-400 w-5 h-5" /> Image & OCR Support</li>
              <li className="flex items-center gap-3"><Check className="text-indigo-400 w-5 h-5" /> Voice Note Analysis</li>
              <li className="flex items-center gap-3"><Check className="text-indigo-400 w-5 h-5" /> PDF Document Reading</li>
            </ul>

            <div className="pt-4 w-full">
              <Link href="/register" className="block w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg hover:shadow-indigo-500/30">
                Register Pro Now
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
