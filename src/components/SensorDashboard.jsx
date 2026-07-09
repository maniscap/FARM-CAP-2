import React, { useState, useEffect } from 'react';
import { Droplets, ThermometerSun, Wind, Activity } from 'lucide-react';

export default function SensorDashboard() {
  // Live graph data state
  const [dataPoints, setDataPoints] = useState(Array.from({ length: 20 }, () => 20));

  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints(prev => {
        const newData = [...prev.slice(1)];
        // Generate a new random data point between 10 and 40
        const lastVal = newData[newData.length - 1];
        const variance = Math.floor(Math.random() * 15) - 7;
        let nextVal = lastVal + variance;
        if (nextVal < 5) nextVal = 5;
        if (nextVal > 45) nextVal = 45;
        newData.push(nextVal);
        return newData;
      });
    }, 1000); // Ticks every second

    return () => clearInterval(interval);
  }, []);

  // Generate SVG path for the live data
  // Map 20 points across 100 SVG units width (5 units per point)
  // Y goes from 0 to 50 SVG units
  const generatePath = () => {
    if (dataPoints.length === 0) return "";
    let d = `M 0,${50 - dataPoints[0]}`;
    for (let i = 1; i < dataPoints.length; i++) {
      const x = i * (100 / (dataPoints.length - 1));
      const y = 50 - dataPoints[i];
      // Use smooth bezier curves if possible, but straight lines are fine for live tickers
      d += ` L ${x},${y}`;
    }
    return d;
  };

  const pathData = generatePath();
  const areaData = `${pathData} L 100,50 L 0,50 Z`;

  return (
    <div className="w-full bg-[rgba(255,255,255,0.05)] backdrop-blur-[25px] backdrop-saturate-[180%] border-t border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] rounded-[30px] p-6 relative overflow-hidden text-white transition-all">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Activity size={20} className="text-[#4CAF50] animate-pulse" />
          <h2 className="text-lg font-bold tracking-wide">Live Field Sensors</h2>
        </div>
        <div className="bg-[#4CAF50]/20 text-[#4CAF50] px-3 py-1 rounded-full text-xs font-bold border border-[#4CAF50]/30 shadow-[0_0_10px_rgba(76,175,80,0.3)] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-ping inline-block"></span>
          Optimal
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        <div className="flex flex-col items-center bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
            <Droplets size={18} color="#38bdf8" />
          </div>
          <div className="text-xl font-bold tracking-tight">42%</div>
          <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mt-1">Moisture</div>
        </div>

        <div className="flex flex-col items-center bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
            <ThermometerSun size={18} color="#fbbf24" />
          </div>
          <div className="text-xl font-bold tracking-tight">28°C</div>
          <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mt-1">Soil Temp</div>
        </div>

        <div className="flex flex-col items-center bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
            <Wind size={18} color="#a78bfa" />
          </div>
          <div className="text-xl font-bold tracking-tight">65%</div>
          <div className="text-[10px] uppercase tracking-wider text-white/50 font-semibold mt-1">Humidity</div>
        </div>
      </div>

      {/* Live Animated Chart */}
      <div className="w-full h-24 relative overflow-hidden rounded-xl border border-white/5 bg-black/20">
        <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="w-full h-full">
          <defs>
            <linearGradient id="gradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(76, 175, 80, 0.5)" />
              <stop offset="100%" stopColor="rgba(76, 175, 80, 0)" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          <line x1="0" y1="12.5" x2="100" y2="12.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="0" y1="37.5" x2="100" y2="37.5" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* Area Fill */}
          <path d={areaData} fill="url(#gradientGreen)" className="transition-all duration-1000 ease-linear" />
          
          {/* Line Chart */}
          <path d={pathData} fill="none" stroke="#4CAF50" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000 ease-linear drop-shadow-[0_0_5px_rgba(76,175,80,0.8)]" />
        </svg>

        {/* Scanning highlight overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[200%] animate-[scan_3s_linear_infinite]" 
             style={{ animation: 'scan 3s linear infinite' }} 
        />
        <style>{`
          @keyframes scan {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>

    </div>
  );
}
