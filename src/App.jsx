import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './Login'
import SplashScreen from './SplashScreen'
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
    <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col items-center justify-center relative p-6">
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 px-4 py-2 bg-red-500/10 text-red-600 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-all font-semibold"
      >
        Sign Out
      </button>
      
      <p className="text-slate-500 text-xl font-medium tracking-wide">
        Blank Canvas. Ready to build.
      </p>
    </div>
  )
}

export default App
