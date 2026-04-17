import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#030303] flex flex-col font-sans">
      <Navbar />
      
      {/* Global Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Subtle Grid Overlay */}
         <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <Footer />
    </main>
  );
}
