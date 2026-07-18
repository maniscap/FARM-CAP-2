import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import { AnimatePresence, motion } from 'framer-motion'
import Login from './Login'
import SplashScreen from './SplashScreen'
import WeatherHeader from './components/WeatherHeader'
import SensorDashboard from './components/SensorDashboard'
import HomeWeatherWidget from './components/HomeWeatherWidget'
import FarmSecurityCard from './components/FarmSecurityCard'
import Weather from './components/Weather'
import BottomNav from './components/BottomNav'
import Features from './components/Features'
import MarketRates from './components/MarketRates'
import Radio from './components/Radio'
import GPSMeasurement from './components/GPSMeasurement'
import Expenditure from './components/Expenditure'
import CropExpenses from './components/CropExpenses'
import ChatBot from './components/ChatBot'
import Notifications from './components/Notifications'
import SensorReportView from './components/SensorReportView'
import SecurityReportView from './components/SecurityReportView'
import { initializePushNotifications, setupForegroundMessageListener } from './utils/PushNotifications'
import './App.css'

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 w-full h-full"
    >
      {children}
    </motion.div>
  );
};

function App() {
  const [user, setUser] = useState(null)
  const [showSplash, setShowSplash] = useState(true)
  const location = useLocation()

  // Splash Screen Timer & Push Notifications
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000);

    // Setup push notifications when the app loads
    initializePushNotifications();
    setupForegroundMessageListener();

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
    <div className="relative w-full h-[100dvh] overflow-hidden bg-black">
      <AnimatePresence>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageWrapper>
              <div 
                className="h-[100dvh] bg-black text-slate-100 font-sans flex flex-col relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url('/assets/images/weather_defaultFallback.webp')` }}
              >
                {/* Subtle dark overlay for readability and pixelation masking */}
                <div className="absolute inset-0 bg-black/40 pointer-events-none z-0"></div>
                
                {/* Dynamic Weather Header */}
                <div className="relative z-50">
                  <WeatherHeader handleLogout={handleLogout} />
                </div>

                {/* Main Dashboard Content */}
                <main className="flex-1 w-full max-w-md mx-auto pt-4 px-4 pb-24 overflow-y-auto z-10 relative no-scrollbar">
                  
                  {/* Dashboard Grid - Unified Card */}
                  <div className="w-full relative overflow-hidden rounded-[30px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all">
                    {/* Unified Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center z-0"
                      style={{ backgroundImage: `url('/assets/images/cinematic_farm_bg.png')` }}
                    ></div>
                    
                    {/* Background Overlay - Optimized for mobile performance (removed blur) */}
                    <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none"></div>

                    {/* Unified Content */}
                    <div className="flex flex-col relative z-10">
                      <SensorDashboard />
                      <HomeWeatherWidget />
                    </div>
                  </div>

                  {/* Security Dashboard Card */}
                  <div className="mt-6">
                    <FarmSecurityCard />
                  </div>

                </main>

                {/* Bottom Navigation Bar */}
                <BottomNav />
              </div>
            </PageWrapper>
          } />
          
          <Route path="/features" element={
            <PageWrapper>
              <Features />
              <BottomNav />
            </PageWrapper>
          } />

          <Route path="/market-rates" element={<PageWrapper><MarketRates /></PageWrapper>} />
          <Route path="/radio" element={<PageWrapper><Radio /></PageWrapper>} />
          <Route path="/gps" element={<PageWrapper><GPSMeasurement /></PageWrapper>} />
          <Route path="/expenses" element={<PageWrapper><Expenditure /></PageWrapper>} />
          <Route path="/expenditure/:folderId" element={<PageWrapper><CropExpenses /></PageWrapper>} />
          <Route path="/weather" element={<PageWrapper><Weather /></PageWrapper>} />
          <Route path="/notifications" element={<PageWrapper><Notifications /><BottomNav /></PageWrapper>} />
          <Route path="/sensor-report" element={<PageWrapper><SensorReportView /></PageWrapper>} />
          <Route path="/security-report" element={<PageWrapper><SecurityReportView /></PageWrapper>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <ChatBot />
    </div>
  )
}

export default App
