import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './Login'
import SplashScreen from './SplashScreen'
import WeatherHeader from './components/WeatherHeader'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col relative overflow-hidden">
      
      {/* Dynamic Weather Header */}
      <WeatherHeader handleLogout={handleLogout} />

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 w-full overflow-y-auto p-5 pb-24 -mt-4 z-10 relative">
        
        {/* Placeholder for the Grid */}
        <div className="flex flex-col gap-6">
          
          <div className="w-full bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[200px]">
             <p className="text-slate-400 font-medium">Dashboard Grid goes here...</p>
          </div>
          
        </div>

      </main>

      {/* Bottom Navigation Bar */}
      <nav className="w-full bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] fixed bottom-0 left-0 z-20 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          
          {/* Home Nav Item */}
          <button className="flex flex-col items-center justify-center w-full h-full text-emerald-500 transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span className="text-[10px] font-bold tracking-wide">Home</span>
          </button>

          {/* Features Nav Item */}
          <button className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
            </svg>
            <span className="text-[10px] font-medium tracking-wide">Features</span>
          </button>

          {/* Profile Nav Item */}
          <button className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span className="text-[10px] font-medium tracking-wide">Profile</span>
          </button>

        </div>
      </nav>

    </div>
  )
}

export default App
