"use client";

import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Say Hello on WhatsApp",
    desc: "Just send a message to the bot number. No app installations, no clunky portals."
  },
  {
    num: "02",
    title: "Ask or Attach",
    desc: "Type a prompt, send a voice note, snap your homework, or upload a PDF document."
  },
  {
    num: "03",
    title: "Get Instant Clarity",
    desc: "Within sub-seconds, receive context-aware, step-by-step explanations powered by Study-it AI."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute left-[20%] top-[40%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              It feels like magic. <br />
              <span className="text-gray-500">But it's just great engineering.</span>
            </h2>
            <p className="text-lg text-gray-400 font-medium">
              We eliminated all friction. Study-It lives right where you already spend your time on WhatsApp.
              Enjoy a seamless learning experience without ever leaving your chat.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="glass p-6 rounded-[2rem] flex items-center gap-6 relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500 scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-500" />
                <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-black text-indigo-400">{step.num}</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white tracking-tight">{step.title}</h4>
                  <p className="text-sm text-gray-400 mt-1 font-medium">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
