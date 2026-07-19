import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Listen to security_alerts for badge count
    const alertsRef = query(ref(db, 'security_alerts'), limitToLast(50));
    const unsubscribe = onValue(alertsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const alerts = Object.values(data);
        // Count alerts from the last 24 hours as "unread"
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recentCount = alerts.filter(a => new Date(a.timestamp).getTime() > oneDayAgo).length;
        setUnreadCount(recentCount);
      } else {
        setUnreadCount(0);
      }
    });
    return () => unsubscribe();
  }, []);

  // Reset badge when visiting notifications
  useEffect(() => {
    if (location.pathname === '/notifications') {
      setUnreadCount(0);
    }
  }, [location.pathname]);
  
  const navItems = [
    {
      id: '/',
      label: 'Home',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: '/features',
      label: 'Features',
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="6" height="6" rx="1.5" />
          <rect x="14" y="4" width="6" height="6" rx="1.5" />
          <rect x="4" y="14" width="6" height="6" rx="1.5" />
          <rect x="14" y="14" width="6" height="6" rx="1.5" />
        </svg>
      )
    },
    {
      id: '/notifications',
      label: 'Alerts',
      badge: unreadCount,
      icon: (
        <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-1 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none pb-safe">
      {/* 3D Liquid Glass Navigation Bar */}
      <nav className="pointer-events-auto flex items-center justify-between w-full max-w-[320px] bg-gradient-to-b from-white/30 via-white/10 to-white/5 backdrop-blur-2xl backdrop-saturate-200 border border-white/40 shadow-[inset_0_2px_4px_rgba(255,255,255,0.6),0_10px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.1)] rounded-full px-2 py-2 relative overflow-hidden">
        
        {/* Inner glow/reflection for the 3D liquid look */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_1px_10px_rgba(255,255,255,0.9)]"></div>
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="relative flex items-center justify-center h-12 rounded-full transition-all duration-300 ease-out flex-shrink-0"
              style={{ width: isActive ? '120px' : '60px' }}
            >
              {/* Active Background Pill */}
              <div 
                className={`absolute inset-0 rounded-full transition-all duration-300 ${isActive ? 'bg-gradient-to-tr from-white/20 to-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_10px_rgba(0,0,0,0.2)] opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              ></div>

              <div className="relative z-10 flex items-center justify-center gap-2 overflow-hidden w-full px-2">
                {/* Icon Wrapper with Badge */}
                <div className={`flex-shrink-0 min-w-[22px] flex items-center justify-center transition-colors duration-300 relative ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                  {item.icon}
                  {/* Notification Badge */}
                  {item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black px-1 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label Wrapper */}
                <div 
                  className={`flex flex-col justify-center overflow-hidden transition-all duration-300 ${isActive ? 'w-auto opacity-100 max-w-[80px]' : 'w-0 opacity-0 max-w-0'}`}
                >
                  <span className="text-xs font-bold text-white tracking-wide block truncate">
                    {item.label}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  );
}

