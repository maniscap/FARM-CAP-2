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
          <h1 className="text-white text-4xl md:text-5xl font-black tracking-widest text-center mb-2 drop-shadow-lg">
            FARM CAP
          </h1>
          
          {/* Quote */}
          <p className="text-white/70 text-sm md:text-base font-semibold tracking-widest text-center mb-6">
            "GROWING SMARTER TOGETHER"
          </p>
          
          <div className="w-16 h-1 bg-white/30 rounded-full mb-8"></div>
          
          {/* By */}
          <p className="text-white/70 text-sm md:text-base font-semibold tracking-[0.3em] text-center mb-2 uppercase">
            by
          </p>
          
          {/* Team Name */}
          <p className="text-white/80 text-sm md:text-base tracking-[0.2em] text-center uppercase" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            Sathyabama Democratic Alliance
          </p>
        </div>
      </div>
      
      {/* Bottom Footer */}
      <div className={`transition-all duration-1000 delay-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-2">
          <span>POWERED BY</span>
          <span className="flex items-center gap-1.5 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 font-extrabold">
            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
            </svg>
            GEMINI
          </span>
        </p>
      </div>
      
    </div>
  );
}
