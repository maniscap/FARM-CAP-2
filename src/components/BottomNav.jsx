import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHome = location.pathname === '/';
  const isFeatures = location.pathname === '/features';
  // Profile route not built yet
  const isProfile = location.pathname === '/profile';

  return (
    <nav className="w-full bg-transparent backdrop-blur-[30px] backdrop-saturate-[200%] border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] fixed bottom-0 left-0 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        
        {/* Home Nav Item */}
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all ${isHome ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
        >
          <svg className="w-6 h-6 mb-[2px]" fill={isHome ? "currentColor" : "none"} stroke={isHome ? "none" : "currentColor"} strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">Home</span>
        </button>

        {/* Features Nav Item */}
        <button 
          onClick={() => navigate('/features')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all ${isFeatures ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
        >
          <svg className="w-6 h-6 mb-[2px]" fill={isFeatures ? "currentColor" : "none"} stroke={isFeatures ? "none" : "currentColor"} strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="6" height="6" rx="1.5" />
            <rect x="14" y="4" width="6" height="6" rx="1.5" />
            <rect x="4" y="14" width="6" height="6" rx="1.5" />
            <rect x="14" y="14" width="6" height="6" rx="1.5" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">Features</span>
        </button>

        {/* Profile Nav Item */}
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center w-full h-full transition-all ${isProfile ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
        >
          <svg className="w-6 h-6 mb-[2px]" fill={isProfile ? "currentColor" : "none"} stroke={isProfile ? "none" : "currentColor"} strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span className="text-[10px] font-semibold tracking-wide">Profile</span>
        </button>

      </div>
    </nav>
  );
}
