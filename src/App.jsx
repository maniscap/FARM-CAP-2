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
import BottomNav from './components/BottomNav'
import Features from './components/Features'
import NewsUpdates from './components/NewsUpdates'
import MarketRates from './components/MarketRates'
import Radio from './components/Radio'
import GPSMeasurement from './components/GPSMeasurement'
import Expenditure from './components/Expenditure'
import CropExpenses from './components/CropExpenses'
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
              <SensorDashboard />
              <HomeWeatherWidget />
            </div>

          </main>

          {/* Bottom Navigation Bar */}
          <BottomNav />
        </div>
      } />
      
      <Route path="/features" element={
        <>
          <Features />
          <BottomNav />
        </>
      } />

      <Route path="/news" element={<NewsUpdates />} />
      <Route path="/market-rates" element={<MarketRates />} />
      <Route path="/radio" element={<Radio />} />
      <Route path="/gps" element={<GPSMeasurement />} />
      <Route path="/expenses" element={<Expenditure />} />
      <Route path="/expenditure/:folderId" element={<CropExpenses />} />
      <Route path="/weather" element={<Weather />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
