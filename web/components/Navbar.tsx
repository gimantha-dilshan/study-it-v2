"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 bg-[#030303]/70">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a href="/#home" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-white glow-text">
                Study-It <span className="text-indigo-500">AI</span>
              </span>
            </a>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <a href="/#home" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold tracking-wide">Home</a>
              <a href="/#features" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold tracking-wide">Features</a>
              <a href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold tracking-wide">How it Works</a>
              <a href="/#pricing" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold tracking-wide">Pricing</a>
              <a href="/#contact" className="text-gray-300 hover:text-white transition-colors text-sm font-semibold tracking-wide">Contact</a>
              <Link href="/register" className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95">
                Register Now
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none transition-all"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden glass border-b border-white/10"
          >
            <div className="px-5 pt-2 pb-5 space-y-2 sm:px-3 text-center flex flex-col gap-3">
              <a href="/#home" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</a>
              <a href="/#features" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Features</a>
              <a href="/#how-it-works" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">How it Works</a>
              <a href="/#pricing" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Pricing</a>
              <a href="/#contact" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Contact</a>
              <Link href="/register" onClick={() => setIsOpen(false)} className="block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white text-base font-bold transition-all">
                Register Pro
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
