"use client";

import { motion } from "framer-motion";
import { Camera, Mic, FileText, ShieldAlert } from "lucide-react";

const features = [
  {
    icon: <Camera className="w-8 h-8 text-indigo-400" />,
    title: "Smart OCR Analysis",
    description: "Send a photo of any math problem, science equation, or essay prompt. Get step-by-step logic, not just answers.",
    color: "from-indigo-500/20 to-transparent",
    border: "group-hover:border-indigo-500/50"
  },
  {
    icon: <Mic className="w-8 h-8 text-purple-400" />,
    title: "AI Voice Partner",
    description: "Send a voice note asking a question. Study-It listens and responds with clear, structured explanations instantly.",
    color: "from-purple-500/20 to-transparent",
    border: "group-hover:border-purple-500/50"
  },
  {
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    title: "Document Mastery",
    description: "Upload PDF textbooks or study guides. The bot summarizes entire chapters or pinpoints specific answers from the text.",
    color: "from-blue-500/20 to-transparent",
    border: "group-hover:border-blue-500/50"
  },
  {
    icon: <ShieldAlert className="w-8 h-8 text-green-400" />,
    title: "4-Tier Protection",
    description: "If the primary AI model fails, we automatically cycle through secondary models and backup APIs. 100% Guaranteed uptime.",
    color: "from-green-500/20 to-transparent",
    border: "group-hover:border-green-500/50"
  }
];

export default function Features() {
  return (
    <section id="features" className="relative py-32 px-4 sm:px-6 lg:px-8 z-10 border-t border-white/5 bg-black/50">
      <div className="max-w-7xl mx-auto space-y-20">
        
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white glow-text">
            Intelligence. <span className="text-indigo-400">Multimodal.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
            No matter how you learn, Study-It adapts. Voice, Image, PDF, or Plain Text—we process it all natively.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`group glass-card relative overflow-hidden transition-all duration-500 ${feature.border}`}
            >
              {/* Radial background gradient matching the brand */}
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 space-y-6 pt-4">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
