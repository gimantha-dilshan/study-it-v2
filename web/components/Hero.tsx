"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden z-10">

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left space-y-8 z-20"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-indigo-500/30 text-indigo-300 text-xs font-black tracking-widest uppercase mb-4"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              V2.5 Stable Now Live
            </motion.div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[1.1]">
              Next-Gen <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-600 glow-text">
                Intelligence.
              </span>
            </h1>
            <p className="max-w-xl mx-auto lg:mx-0 text-xl text-gray-400 font-medium leading-relaxed">
              Experience the ultimate AI study partner on WhatsApp. Multimodal problem solving, Image scanning, Voice interactions, and sub-second delivery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/register" className="group relative px-8 py-4 bg-white text-black font-black rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105 active:scale-95">
              <span className="relative z-10 flex items-center gap-2">
                Get Started Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
              <div className="absolute inset-0 bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
            </Link>

            <a href="#how-it-works" className="px-8 py-4 glass border border-white/10 rounded-2xl text-white font-bold hover:bg-white/5 transition-all text-center">
              See How It Works
            </a>
          </div>

          <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-sm font-bold text-gray-500">
            <div className="flex -space-x-4">
              <img className="w-10 h-10 rounded-full border-2 border-black" src="https://i.pravatar.cc/100?img=1" alt="" />
              <img className="w-10 h-10 rounded-full border-2 border-black" src="https://i.pravatar.cc/100?img=2" alt="" />
              <img className="w-10 h-10 rounded-full border-2 border-black" src="https://i.pravatar.cc/100?img=3" alt="" />
              <div className="w-10 h-10 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-white text-xs font-black">+2k</div>
            </div>
            <p>Trusted by <span className="text-white">thousands</span><br />of students worldwide.</p>
          </div>
        </motion.div>

        {/* Graphical Representation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center z-20 perspective-1000"
        >
          {/* Abstract glowing backdrop for the image */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 rounded-full blur-[100px] animate-pulse-slow" />

          <div className="relative w-full max-w-lg aspect-square lg:aspect-auto lg:h-[90%] rounded-[3rem] glass-card overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.2)] border border-white/20 transform hover:scale-[1.02] transition-transform duration-500">
            {/* We use next/image. Ensure it handles the path correctly. */}
              <Image
                src="/bot-image.webp"
                alt="StudyIt AI Bot Preview"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={95}
                className="object-cover opacity-90 scale-105"
                priority
              />


          </div>
        </motion.div>

      </div>
    </section>
  );
}
