import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-black flex flex-col justify-between items-center py-12 z-[100] font-sans overflow-hidden">
      
      {/* Top Spacer */}
      <div className="flex-1 flex flex-col justify-center items-center w-full px-6">
        
        {/* Logo and Name */}
        <div className={`flex flex-col items-center transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
          <div className="text-6xl md:text-7xl mb-4 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">🧢</div>
          <h1 className="text-white text-4xl md:text-5xl font-black tracking-widest text-center mb-6 drop-shadow-lg">
            FARM CAP
          </h1>
          
          <div className="w-16 h-1 bg-white/30 rounded-full mb-6"></div>
          
          {/* Quote */}
          <p className="text-white/90 text-xl md:text-2xl font-bold tracking-wide text-center mb-2">
            "GROWING SMARTER TOGETHER"
          </p>
          
          {/* Team Name */}
          <p className="text-white/60 text-sm md:text-base font-semibold tracking-widest text-center mt-4 uppercase">
            by Sathyabama Democratic Alliance
          </p>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className={`transition-all duration-1000 delay-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-2">
          <span>POWERED BY</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400">GEMINI</span>
        </p>
      </div>
      
    </div>
  );
}
