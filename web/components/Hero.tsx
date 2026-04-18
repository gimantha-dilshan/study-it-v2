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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
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
              LIVE ON WHATSAPP
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

            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_BOT_NUMBER}?text=Hello%20Study-It!`} target="_blank" rel="noreferrer" className="px-8 py-4 glass border border-green-500/40 rounded-2xl text-white font-bold hover:bg-green-500/10 transition-all text-center flex items-center justify-center gap-3">
              <svg className="w-6 h-6 text-green-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>

          <div className="pt-8 flex items-center justify-center lg:justify-start gap-6 text-sm font-bold text-gray-500">
            <div className="flex -space-x-4">
              <img className="w-10 h-10 rounded-full border-2 border-black" src="https://i.pravatar.cc/100?img=16" alt="" />
              <img className="w-10 h-10 rounded-full border-2 border-black" src="https://i.pravatar.cc/100?img=8" alt="" />
              <img className="w-10 h-10 rounded-full border-2 border-black" src="https://i.pravatar.cc/100?img=4" alt="" />
              <div className="w-10 h-10 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-white text-xs font-black">+2k</div>
            </div>
            <p>Trusted by <span className="text-white">thousands</span><br />of students worldwide.</p>
          </div>
        </motion.div>

        {/* Graphical Representation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          className="relative lg:h-[600px] flex items-center justify-center z-20"
        >
          {/* Abstract glowing backdrop for the image - hidden on mobile to save GPU */}
          <div className="hidden md:block absolute inset-0 bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 rounded-full blur-[100px] animate-pulse-slow" />

          <div className="relative w-full max-w-lg aspect-square lg:aspect-auto lg:h-[90%] overflow-hidden animate-float">
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
