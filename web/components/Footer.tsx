export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 glass bg-black/80 py-12 px-4 z-10 w-full mt-24">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        <div className="text-center md:text-left space-y-2">
           <h3 className="text-2xl font-black tracking-tighter text-white glow-text">
              Study-It
           </h3>
           <p className="text-gray-500 text-sm font-medium">
              Empowering the next generation of students with high-tech AI companionship.
           </p>
        </div>

        <div className="flex flex-col items-center md:items-end space-y-2">
           <p className="text-gray-400 text-sm">
              Developed by <span className="text-white font-bold">Gimantha Dilshan</span>
           </p>
           <a 
              href="https://instagram.com/gimantha_d" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-bold tracking-widest uppercase"
           >
              @GIMANTHA_D
           </a>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-600 font-bold tracking-widest uppercase flex flex-col md:flex-row justify-center items-center gap-4">
         <span>Smart</span>
         <span className="hidden md:block">•</span>
         <span>Powerful</span>
         <span className="hidden md:block">•</span>
         <span>Intelligence</span>
      </div>
    </footer>
  );
}
