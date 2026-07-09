import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './Login'
import SplashScreen from './SplashScreen'
import WeatherHeader from './components/WeatherHeader'
import SensorDashboard from './components/SensorDashboard'
import HomeWeatherWidget from './components/HomeWeatherWidget'
import Weather from './components/Weather'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [showSplash, setShowSplash] = useState(true)

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (showSplash) {
    return <SplashScreen />
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <Routes>
      <Route path="/" element={
        <div 
          className="min-h-screen bg-black text-slate-100 font-sans flex flex-col relative overflow-hidden bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url('/assets/images/weather_defaultFallback.webp')` }}
        >
          {/* Subtle dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>
          
          {/* Dynamic Weather Header */}
          <div className="relative z-10">
            <WeatherHeader handleLogout={handleLogout} />
          </div>

          {/* Main Dashboard Content */}
          <main className="flex-1 w-full max-w-md mx-auto pt-4 px-4 pb-24 overflow-y-auto z-10 relative no-scrollbar">
            
            {/* Dashboard Grid */}
            <div className="flex flex-col gap-6">
              <HomeWeatherWidget />
              <SensorDashboard />
            </div>

          </main>

          {/* Bottom Navigation Bar */}
          <nav className="w-full bg-transparent backdrop-blur-[30px] backdrop-saturate-[200%] border-t border-white/20 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] fixed bottom-0 left-0 z-20 pb-safe">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
              
              {/* Home Nav Item */}
              <button className="flex flex-col items-center justify-center w-full h-full text-white transition-all">
                <svg className="w-6 h-6 mb-[2px]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.99 9a.75.75 0 11-1.06 1.06l-1.21-1.21v7.56a2.25 2.25 0 01-2.25 2.25h-3v-6a.75.75 0 00-.75-.75h-2.5a.75.75 0 00-.75.75v6h-3a2.25 2.25 0 01-2.25-2.25v-7.56L3.54 13.9a.75.75 0 11-1.06-1.06l8.99-9z" />
                </svg>
                <span className="text-[10px] font-semibold tracking-wide">Home</span>
              </button>

              {/* Features Nav Item */}
              <button className="flex flex-col items-center justify-center w-full h-full text-white/50 hover:text-white/80 transition-all">
                <svg className="w-6 h-6 mb-[2px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="4" width="6" height="6" rx="1.5" />
                  <rect x="14" y="4" width="6" height="6" rx="1.5" />
                  <rect x="4" y="14" width="6" height="6" rx="1.5" />
                  <rect x="14" y="14" width="6" height="6" rx="1.5" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Features</span>
              </button>

              {/* Profile Nav Item */}
              <button className="flex flex-col items-center justify-center w-full h-full text-white/50 hover:text-white/80 transition-all">
                <svg className="w-6 h-6 mb-[2px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Profile</span>
              </button>

            </div>
          </nav>

        </div>
      } />
      
      <Route path="/weather" element={<Weather />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
