import { Suspense, lazy } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const Features = lazy(() => import("../components/Features"));
const HowItWorks = lazy(() => import("../components/HowItWorks"));
const Pricing = lazy(() => import("../components/Pricing"));
const Footer = lazy(() => import("../components/Footer"));

const SectionFallback = () => (
  <div className="w-full py-32 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#030303] flex flex-col font-sans">
      <Navbar />

      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <Hero />

      <Suspense fallback={<SectionFallback />}>
        <Features />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Pricing />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <Footer />
      </Suspense>
    </main>
  );
}
