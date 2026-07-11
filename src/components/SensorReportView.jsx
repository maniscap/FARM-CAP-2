import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, set } from 'firebase/database';
import { Activity, ChevronLeft, Droplets, ThermometerSun, Wind, Zap, Clock, Sparkles, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HomeWeatherWidget from './HomeWeatherWidget';

const WaterFlowAnimation = () => {
  return (
    <div className="relative w-full h-36 rounded-3xl overflow-hidden bg-[#020813] border border-blue-500/20 shadow-[0_15px_40px_rgba(0,100,255,0.15),inset_0_0_30px_rgba(0,0,0,0.8)] flex items-center justify-center my-6">
      <style>{`
        @keyframes liquid1 {
          0% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-25%) scaleY(0.9); }
          100% { transform: translateX(-50%) scaleY(1); }
        }
        @keyframes liquid2 {
          0% { transform: translateX(0) scaleY(0.9); }
          50% { transform: translateX(-25%) scaleY(1.1); }
          100% { transform: translateX(-50%) scaleY(0.9); }
        }
        @keyframes cinematicPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>

      {/* Deep cinematic background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent z-0"></div>
      
      {/* Ambient glowing orb in the center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl z-0" style={{ animation: 'cinematicPulse 4s ease-in-out infinite' }}></div>

      {/* Cinematic slow-moving fluid layers */}
      <div className="absolute bottom-0 left-0 w-[200%] h-[75%] opacity-30 mix-blend-screen z-10" style={{ animation: 'liquid1 10s linear infinite' }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]">
          <path d="M0,40 C150,80 350,0 600,40 C850,80 1050,0 1200,40 L1200,120 L0,120 Z" fill="#0ea5e9" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-[200%] h-[60%] opacity-50 mix-blend-screen z-10" style={{ animation: 'liquid2 7s linear infinite' }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
          <path d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z" fill="#38bdf8" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-[200%] h-[45%] opacity-80 mix-blend-screen z-10" style={{ animation: 'liquid1 5s linear infinite' }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full drop-shadow-[0_0_15px_rgba(186,230,253,0.8)]">
          <path d="M0,80 C250,120 450,40 600,80 C750,120 950,40 1200,80 L1200,120 L0,120 Z" fill="#bae6fd" />
        </svg>
      </div>

      {/* Glassy Overlay for cinematic feel */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-[1px] z-20 pointer-events-none"></div>
      
      {/* Central Content */}
      <div className="relative z-30 flex flex-col items-center justify-center text-center mt-2">
        <Droplets size={32} className="text-white mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]" style={{ animation: 'cinematicPulse 2s ease-in-out infinite' }} />
        <h3 className="text-white text-xl font-black tracking-widest uppercase drop-shadow-md">Pump Active</h3>
        <p className="text-blue-100/80 text-[10px] font-bold tracking-[0.2em] uppercase mt-1 drop-shadow-md">Irrigation Running</p>
      </div>
    </div>
  )
}

export default function SensorReportView() {
  const navigate = useNavigate();
  
  const [insight, setInsight] = useState(null);
  const [sensorData, setSensorData] = useState({
    soilMoisture: '--',
    temperature: '--',
    humidity: '--'
  });
  
  // Motor Control State
  const [motorState, setMotorState] = useState({ state: false, expiresAt: null });
  const [selectedDuration, setSelectedDuration] = useState(15); // Default 15 mins
  const [customInput, setCustomInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  // Hardware Status State
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Listen to AI Insights
    const insightRef = ref(db, 'ai_insights/latest');
    const unsubscribeInsight = onValue(insightRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.analysis) {
          setInsight(data.analysis);
          setSensorData({
            soilMoisture: data.analysis.soilMoisture || '32',
            temperature: data.analysis.fieldTemp || '28',
            humidity: data.analysis.fieldHumidity || '65'
          });
        }
        if (data.timestamp) {
            setLastUpdated(data.timestamp);
        }
      }
    });

    // 2. Listen to Motor State
    const motorRef = ref(db, 'controls/motor');
    const unsubscribeMotor = onValue(motorRef, (snapshot) => {
      if (snapshot.exists()) {
        setMotorState(snapshot.val());
      } else {
        setMotorState({ state: false, expiresAt: null });
      }
    });

    return () => {
      unsubscribeInsight();
      unsubscribeMotor();
    };
  }, []);

  // Offline Check (10 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastUpdated > 10 * 60 * 1000) {
        setIsOffline(true);
      } else {
        setIsOffline(false);
      }
    }, 10000); // Check every 10 seconds
    
    // Initial check
    setIsOffline(Date.now() - lastUpdated > 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Timer Tick
  useEffect(() => {
    let interval;
    if (motorState.state && motorState.expiresAt) {
      interval = setInterval(() => {
        const remaining = motorState.expiresAt - Date.now();
        if (remaining <= 0) {
          setTimeLeft(0);
          // Turn off motor when time is up
          set(ref(db, 'controls/motor'), { state: false, expiresAt: null });
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    } else {
      setTimeLeft(0);
    }
    return () => clearInterval(interval);
  }, [motorState]);

  const handleTurnOn = () => {
    const expiresAt = Date.now() + selectedDuration * 60 * 1000;
    set(ref(db, 'controls/motor'), { state: true, expiresAt });
  };

  const handleTurnOff = () => {
    set(ref(db, 'controls/motor'), { state: false, expiresAt: null });
  };

  const formatTimeLeft = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="h-full overflow-y-auto text-white pb-6 bg-black relative">
      
      {/* Header */}
      <div className="sticky top-0 z-50 pt-6 px-4 pb-2" style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/20 rounded-[32px] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/20 active:scale-95 transition-transform shrink-0 shadow-inner"
          >
            <ChevronLeft size={24} className="text-white -ml-1" />
          </button>
          <div className="flex-1 text-center flex flex-col items-center">
            <h1 className="text-xl font-black tracking-tight text-white drop-shadow-md leading-tight flex items-center justify-center gap-2">
              <Activity size={20} className="text-[#4CAF50]" />
              Sensor Report
            </h1>
            <p className="text-white/70 font-medium text-[10px] uppercase tracking-wider">
              Live Updates • Active
            </p>
          </div>
          <div className="w-12 h-12 shrink-0"></div> {/* Spacer for perfect centering */}
        </div>
      </div>
      
      {/* Offline Warning Badge */}
      {isOffline && (
        <div className="mx-6 mb-4 mt-2 bg-red-900/40 border border-red-500/50 rounded-2xl p-4 flex items-center gap-4 shadow-[0_4px_20px_rgba(220,38,38,0.2)] backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <WifiOff className="text-red-400" size={20} />
          </div>
          <div>
            <p className="text-red-100 font-bold text-sm tracking-wide">Hardware Offline</p>
            <p className="text-red-200/70 text-xs mt-0.5 leading-snug">Sensor data is over 10 minutes old. Please check the ESP32 power and WiFi connection.</p>
          </div>
        </div>
      )}

      <div className="p-5 space-y-6 relative z-10">
        
        {/* Latest Readings */}
        <section>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Live Metrics</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center bg-white/5 p-4 rounded-[24px] border border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-3 text-blue-400">
                <Droplets size={24} />
              </div>
              <div className="text-2xl font-bold">{sensorData.soilMoisture}%</div>
              <div className="text-[10px] uppercase font-bold text-white/50 mt-1">Moisture</div>
            </div>
            <div className="flex flex-col items-center bg-white/5 p-4 rounded-[24px] border border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-3 text-amber-400">
                <ThermometerSun size={24} />
              </div>
              <div className="text-2xl font-bold">{sensorData.temperature}°C</div>
              <div className="text-[10px] uppercase font-bold text-white/50 mt-1">Temp</div>
            </div>
            <div className="flex flex-col items-center bg-white/5 p-4 rounded-[24px] border border-white/10 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-3 text-purple-400">
                <Wind size={24} />
              </div>
              <div className="text-2xl font-bold">{sensorData.humidity}%</div>
              <div className="text-[10px] uppercase font-bold text-white/50 mt-1">Humidity</div>
            </div>
          </div>
        </section>

        {/* AI Analysis */}
        <section>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400" /> AI Diagnosis
          </h2>
          <div className={`p-5 rounded-[24px] border shadow-sm ${insight?.isCritical ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
            <h3 className={`font-bold mb-2 flex items-center gap-2 ${insight?.isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
              {insight?.isCritical ? 'Critical Condition Detected' : 'Optimal Conditions'}
            </h3>
            <p className="text-white/80 text-sm leading-relaxed mb-4">
              {insight?.reason || "System analyzing... waiting for next sensor reading."}
            </p>
            {insight?.actionRecommendation && (
              <div className="p-4 bg-white/5 rounded-[16px] border border-white/5 text-sm">
                <span className="font-bold text-white">Recommendation:</span> {insight.actionRecommendation}
              </div>
            )}
          </div>
        </section>

        {/* Motor Control */}
        <section>
          <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Irrigation Control</h2>
          <div className="p-5 rounded-[24px] border border-white/10 bg-white/5 shadow-sm relative overflow-hidden">
            {/* Background glowing effect if motor is running */}
            {motorState.state && (
              <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
            )}
            
            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center ${motorState.state ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'bg-white/5 border border-white/5 text-white/50'}`}>
                    <Zap size={28} className={motorState.state ? "animate-pulse" : ""} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Water Pump</h3>
                    <p className={`text-sm font-bold ${motorState.state ? 'text-blue-400' : 'text-white/50'}`}>
                      {motorState.state ? 'RUNNING' : 'OFF'}
                    </p>
                  </div>
                </div>
                
                {motorState.state && (
                  <div className="text-right">
                    <p className="text-xs text-white/50 mb-1">Time Remaining</p>
                    <div className="text-2xl font-mono font-bold text-blue-400">
                      {formatTimeLeft(timeLeft)}
                    </div>
                  </div>
                )}
              </div>

              {!motorState.state ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-2">Set Timer</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[15, 30, 60].map(mins => (
                        <button
                          key={mins}
                          onClick={() => { setSelectedDuration(mins); setCustomInput(''); }}
                          className={`py-2 rounded-xl text-sm font-bold transition-all border ${selectedDuration === mins && !customInput ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10'}`}
                        >
                          {mins}m
                        </button>
                      ))}
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Min"
                        value={customInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setCustomInput(val);
                          if(val) setSelectedDuration(Number(val));
                        }}
                        className={`w-full py-2 px-1 text-center bg-transparent border rounded-xl text-sm font-bold transition-all outline-none ${customInput ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/5 text-white/70 focus:border-white/20'}`}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleTurnOn}
                    className="w-full py-4 rounded-[20px] bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold text-lg shadow-[0_10px_30px_rgba(59,130,246,0.4)] hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Clock size={20} />
                    Start Motor
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <WaterFlowAnimation />
                  <button 
                    onClick={handleTurnOff}
                    className="w-full py-4 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    Stop Motor
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Hourly Weather Forecast */}
        <section className="mt-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 overflow-hidden">
            <HomeWeatherWidget />
          </div>
        </section>
        
      </div>
    </div>
  );
}
