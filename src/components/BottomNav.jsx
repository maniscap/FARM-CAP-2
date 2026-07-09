import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    {
      id: '/',
      label: 'Home',
      icon: (isActive) => (
        <svg className="w-6 h-6 mb-[2px] relative z-10" fill={isActive ? "currentColor" : "none"} stroke={isActive ? "none" : "currentColor"} strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: '/features',
      label: 'Features',
      icon: (isActive) => (
        <svg className="w-6 h-6 mb-[2px] relative z-10" fill={isActive ? "currentColor" : "none"} stroke={isActive ? "none" : "currentColor"} strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
      )
    },
    {
      id: '/profile',
      label: 'Profile',
      icon: (isActive) => (
        <svg className="w-6 h-6 mb-[2px] relative z-10" fill={isActive ? "currentColor" : "none"} stroke={isActive ? "none" : "currentColor"} strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      )
    }
  ];

  return (
    <nav className="w-full bg-transparent backdrop-blur-[30px] backdrop-saturate-[200%] border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] fixed bottom-0 left-0 z-50 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.id)}
              whileTap={{ scale: 0.9 }}
              className={`relative flex flex-col items-center justify-center w-full h-full py-1 ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-1.5 bg-white/10 rounded-xl z-0 border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {item.icon(isActive)}
              <span className="text-[10px] font-semibold tracking-wide relative z-10">{item.label}</span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  );
}
