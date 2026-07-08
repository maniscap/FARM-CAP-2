import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay before triggering the mount animation to ensure it plays smoothly
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col justify-center items-center z-[100] font-sans overflow-hidden">
      
      {/* Background ambient light */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] transition-all duration-2000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}></div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
        
        {/* Animated Plant */}
        <div className="relative w-32 h-32 mb-8 flex justify-center items-end">
          {/* Soil/Pot base */}
          <div className={`absolute bottom-0 w-24 h-4 bg-amber-900/60 rounded-full blur-[2px] transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}></div>
          
          {/* Stem */}
          <div className={`w-1.5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-full origin-bottom transition-all duration-1000 ease-out delay-300 ${mounted ? 'h-20' : 'h-0'}`}></div>
          
          {/* Left Leaf */}
          <div className={`absolute bottom-8 left-8 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-tl-full rounded-br-full shadow-lg origin-bottom-right transition-all duration-700 ease-out delay-700 ${mounted ? 'scale-100 opacity-100 rotate-[-15deg]' : 'scale-0 opacity-0 rotate-0'}`}></div>
          
          {/* Right Leaf */}
          <div className={`absolute bottom-12 right-8 w-8 h-8 bg-gradient-to-bl from-emerald-300 to-green-500 rounded-tr-full rounded-bl-full shadow-lg origin-bottom-left transition-all duration-700 ease-out delay-1000 ${mounted ? 'scale-100 opacity-100 rotate-[15deg]' : 'scale-0 opacity-0 rotate-0'}`}></div>
          
          {/* Top Leaf */}
          <div className={`absolute bottom-20 w-8 h-8 bg-gradient-to-t from-green-500 to-emerald-300 rounded-tl-full rounded-tr-full rounded-bl-full shadow-lg origin-bottom transition-all duration-700 ease-out delay-[1300ms] ${mounted ? 'scale-100 opacity-100 rotate-45' : 'scale-0 opacity-0 rotate-0'}`}></div>
        </div>
        
        {/* Team Name */}
        <h1 className={`text-white text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-center mb-4 transition-all duration-1000 ease-out delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]`}>
          SATHYABAMA DEMOCRATIC ALLIANCE
        </h1>
        
        {/* Quote */}
        <div className={`overflow-hidden transition-all duration-1000 delay-[1200ms] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-emerald-300/90 text-lg md:text-xl font-medium italic tracking-wide drop-shadow-md">
            "Growing Smarter Together"
          </p>
        </div>
      </div>
    </div>
  );
}
