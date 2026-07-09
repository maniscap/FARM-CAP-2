import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Newspaper, TrendingUp, Wrench, Sprout, ChevronLeft, Radio as RadioIcon } from 'lucide-react';

export default function Features() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen bg-black text-slate-100 font-sans flex flex-col relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/assets/images/weather_defaultFallback.webp')` }}
    >
      {/* Subtle dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 pt-12 px-4 pb-4">
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 active:scale-95 transition-transform shrink-0 shadow-inner"
          >
            <ChevronLeft size={24} className="text-white -ml-1" />
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-xl font-black tracking-tight text-white drop-shadow-md leading-tight">
              Features
            </h1>
            <p className="text-white/70 font-medium text-[10px] uppercase tracking-wider">
              Smarter Farming Tools
            </p>
          </div>
          <div className="w-12 h-12 shrink-0"></div> {/* Spacer for perfect centering */}
        </div>
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-4 pb-24 overflow-y-auto z-10 relative no-scrollbar">
        
        {/* INSIGHTS SECTION */}
        <div className="mt-4 mb-8">
          <h2 className="text-sm font-bold tracking-widest text-white/90 mb-4 px-2 uppercase">
            Insights & Data
          </h2>
          
          <div className="flex flex-col gap-4">
            
            {/* Agri News Card */}
            <div 
              onClick={() => navigate('/news')}
              className="group relative overflow-hidden rounded-[28px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[25px] z-0 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-green-400/30"></div>
              
              <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                    <Newspaper size={24} className="text-green-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Agri News</h3>
                    <p className="text-xs text-white/60 font-medium mt-1">Live updates & schemes</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <ChevronLeft size={16} className="text-white/50 rotate-180" />
                </div>
              </div>
            </div>

            {/* Market Rates Card */}
            <div 
              onClick={() => navigate('/market-rates')}
              className="group relative overflow-hidden rounded-[28px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[25px] z-0 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-blue-400/30"></div>
              
              <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                    <TrendingUp size={24} className="text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">Market Rates</h3>
                    <p className="text-xs text-white/60 font-medium mt-1">Daily prices & mandi info</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <ChevronLeft size={16} className="text-white/50 rotate-180" />
                </div>
              </div>
            </div>

            {/* Radio Card */}
            <div 
              onClick={() => navigate('/radio')}
              className="group relative overflow-hidden rounded-[28px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-[25px] z-0 pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-purple-400/30"></div>
              
              <div className="relative z-10 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                    <RadioIcon size={24} className="text-purple-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">FarmCap Radio</h3>
                    <p className="text-xs text-white/60 font-medium mt-1">Live agri & local stations</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <ChevronLeft size={16} className="text-white/50 rotate-180" />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* TOOLS SECTION */}
        <div>
          <h2 className="text-sm font-bold tracking-widest text-white/90 mb-4 px-2 uppercase">
            Tools
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            
            {/* Coming Soon Tool 1 */}
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] opacity-60">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] z-0 pointer-events-none"></div>
              
              <div className="relative z-10 p-5 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Sprout size={20} className="text-white/70" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Crop Doctor</h3>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-bold">Coming Soon</p>
                </div>
              </div>
            </div>

            {/* Coming Soon Tool 2 */}
            <div className="relative overflow-hidden rounded-[24px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.25)] opacity-60">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] z-0 pointer-events-none"></div>
              
              <div className="relative z-10 p-5 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Wrench size={20} className="text-white/70" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Irrigation</h3>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider font-bold">Coming Soon</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
