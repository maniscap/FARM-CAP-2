import { useState, useEffect } from 'react'
import { ref, onValue, set } from 'firebase/database'
import { signOut } from 'firebase/auth'
import { db, auth } from './firebase'
import Login from './Login'
import SplashScreen from './SplashScreen'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('irrigation')
  const [sensorData, setSensorData] = useState({ temp: 0, humidity: 0, soilMoisture: 0 })
  const [motorStatus, setMotorStatus] = useState(false)
  const [showSplash, setShowSplash] = useState(true)

  // Splash Screen Timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4000); // Show splash for 4.0 seconds
    return () => clearTimeout(timer);
  }, []);

  // Firebase Realtime Database Listener for Sensor Data
  useEffect(() => {
    if (!user) return; // Only listen if authenticated
    const sensorRef = ref(db, 'farm/sensors');
    const unsubscribe = onValue(sensorRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSensorData(data);
      }
    });

    const motorRef = ref(db, 'farm/motor_status');
    const motorUnsubscribe = onValue(motorRef, (snapshot) => {
      setMotorStatus(!!snapshot.val());
    });

    return () => {
      unsubscribe();
      motorUnsubscribe();
    }
  }, [user]);

  const toggleMotor = () => {
    set(ref(db, 'farm/motor_status'), !motorStatus);
  };

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
    <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-800 border-b md:border-r border-slate-700 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-400">FarmCAP</h1>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('irrigation')}
            className={`text-left px-4 py-3 rounded-lg transition-all font-medium ${activeTab === 'irrigation' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
          >
            🌱 Irrigation & Health
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`text-left px-4 py-3 rounded-lg transition-all font-medium ${activeTab === 'security' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'}`}
          >
            🛡️ Security Camera
          </button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
               {user.photoURL ? (
                 <img src={user.photoURL} alt="User avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-sm font-bold text-slate-300">{user.email ? user.email[0].toUpperCase() : 'U'}</span>
               )}
            </div>
            <div className="overflow-hidden">
               <p className="text-sm font-medium text-white truncate">{user.displayName || user.phoneNumber || user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 rounded-lg transition-all font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {activeTab === 'irrigation' ? 'Irrigation Dashboard' : 'Security Feed'}
            </h2>
            <p className="text-slate-400">Monitor and manage your farm architecture in real-time.</p>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
             <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-emerald-400">Live Connection</span>
          </div>
        </header>

        {activeTab === 'irrigation' && (
          <div className="space-y-6">
            
            {/* Sensor Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Soil Moisture */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                <h3 className="text-slate-400 font-medium mb-1">Soil Moisture</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-blue-400">{sensorData.soilMoisture}</span>
                  <span className="text-slate-500 font-medium">%</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg relative overflow-hidden group">
                 <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
                <h3 className="text-slate-400 font-medium mb-1">Temperature</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-orange-400">{sensorData.temp}</span>
                  <span className="text-slate-500 font-medium">°C</span>
                </div>
              </div>

              {/* Humidity */}
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg relative overflow-hidden group">
                 <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                <h3 className="text-slate-400 font-medium mb-1">Humidity</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-cyan-400">{sensorData.humidity}</span>
                  <span className="text-slate-500 font-medium">%</span>
                </div>
              </div>
            </div>

            {/* AI Advice & Motor Control Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* AI Gemini Advice Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/50 to-slate-800 rounded-2xl p-8 border border-indigo-500/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <h3 className="text-xl font-bold text-indigo-300 mb-4 flex items-center gap-2">
                  ✨ Gemini Farm AI
                </h3>
                <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                  <p className="text-slate-300 leading-relaxed">
                    Analyzing weather patterns and recent soil data... <br/><br/>
                    <span className="text-emerald-400 font-medium">Suggestion:</span> No irrigation needed today. There is a 80% chance of rain in the next 3 hours. Watering now could over-saturate the crops.
                  </p>
                </div>
              </div>

              {/* Motor Control Card */}
              <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 shadow-lg flex flex-col justify-center items-center text-center">
                <h3 className="text-slate-300 font-medium mb-6">Water Pump Motor</h3>
                
                <button 
                  onClick={toggleMotor}
                  className={`relative inline-flex h-32 w-32 items-center justify-center rounded-full transition-all duration-300 shadow-2xl ${motorStatus ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-slate-700 shadow-slate-900/50'}`}
                >
                  <div className={`absolute inset-1 rounded-full ${motorStatus ? 'bg-emerald-400' : 'bg-slate-600'}`}></div>
                  <div className={`absolute inset-2 rounded-full ${motorStatus ? 'bg-emerald-500' : 'bg-slate-700'} flex items-center justify-center flex-col`}>
                    <span className="text-2xl font-bold text-white z-10">{motorStatus ? 'ON' : 'OFF'}</span>
                  </div>
                </button>
                <p className={`mt-6 font-medium ${motorStatus ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {motorStatus ? 'Irrigation is active' : 'Motor is currently off'}
                </p>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl p-1 border border-slate-700 shadow-lg relative overflow-hidden">
               <div className="bg-slate-900 rounded-xl aspect-video w-full flex items-center justify-center relative overflow-hidden">
                  {/* Placeholder for ESP32-CAM Image */}
                  <img src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=2000&auto=format&fit=crop" alt="Security Feed" className="w-full h-full object-cover opacity-60" />
                  
                  <div className="absolute top-4 left-4 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                     <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
                     MOTION DETECTED
                  </div>
                  <div className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-md backdrop-blur-md">
                    ESP32-CAM (Zone 1) - {new Date().toLocaleTimeString()}
                  </div>
               </div>
            </div>

            {/* Gemini Vision Analysis */}
            <div className="bg-gradient-to-br from-indigo-900/50 to-slate-800 rounded-2xl p-6 border border-indigo-500/30 shadow-lg">
                <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                  👁️ Gemini Vision Analysis
                </h3>
                <p className="text-slate-300 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <strong className="text-red-400">Alert:</strong> I have analyzed the image from the security camera. It appears to be a stray dog near the western fence line. No immediate threat to crops, but the buzzer has been triggered to deter the animal.
                </p>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

export default App
