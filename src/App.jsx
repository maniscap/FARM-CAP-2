import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './Login'
import SplashScreen from './SplashScreen'
import WeatherHeader from './components/WeatherHeader'
import SensorDashboard from './components/SensorDashboard'
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
          style={{ backgroundImage: `url('/assets/images/weather_sunrise.webp')` }}
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
              <SensorDashboard />
            </div>

          </main>

          {/* Bottom Navigation Bar */}
          <nav className="w-[calc(100%-2rem)] mx-4 mb-6 bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] backdrop-saturate-[150%] rounded-[25px] border border-[rgba(255,255,255,0.15)] border-t-[rgba(255,255,255,0.4)] shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.3)] fixed bottom-0 left-0 z-20">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
              
              {/* Home Nav Item */}
              <button className="flex flex-col items-center justify-center w-full h-full text-[#4CAF50] drop-shadow-[0_0_8px_rgba(76,175,80,0.6)] transition-all">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span className="text-[10px] font-bold tracking-wide">Home</span>
              </button>

              {/* Features Nav Item */}
              <button className="flex flex-col items-center justify-center w-full h-full text-white/60 hover:text-white/90 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
                <span className="text-[10px] font-medium tracking-wide">Features</span>
              </button>

              {/* Profile Nav Item */}
              <button className="flex flex-col items-center justify-center w-full h-full text-white/60 hover:text-white/90 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all">
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
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
