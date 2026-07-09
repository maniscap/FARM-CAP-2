import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CloudRain, CloudSun, Sun, Cloud, CloudLightning, ChevronRight } from 'lucide-react';

export default function HomeWeatherWidget() {
  const navigate = useNavigate();
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  
  // To identify current hour
  const currentHourIndex = new Date().getHours();

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      // 1. Get location from localStorage
      const savedLoc = localStorage.getItem('farmCap_userLocation');
      let loc = { name: 'Chennai', region: 'TN', lat: null, lon: null };
      if (savedLoc) {
        loc = JSON.parse(savedLoc);
      }

      // 2. Fetch forecast
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const query = loc.lat && loc.lon ? `${loc.lat},${loc.lon}` : loc.name;
      const res = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=1`);
      
      const hours = res.data.forecast.forecastday[0].hour;
      setHourlyData(hours);
      
    } catch (err) {
      console.error("Failed to fetch forecast for widget:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to the current hour after data loads
  useEffect(() => {
    if (!loading && hourlyData.length > 0 && scrollRef.current) {
      // We wait a tiny bit to ensure the DOM is fully painted
      setTimeout(() => {
        const activeCard = scrollRef.current.querySelector('[data-active="true"]');
        if (activeCard) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 300);
    }
  }, [loading, hourlyData]);

  const getSmallWeatherIcon = (conditionText) => {
    const text = conditionText.toLowerCase();
    if (text.includes('rain') || text.includes('drizzle')) return <CloudRain size={20} className="text-blue-300 drop-shadow" />;
    if (text.includes('thunder') || text.includes('storm')) return <CloudLightning size={20} className="text-purple-300 drop-shadow" />;
    if (text.includes('sun') || text.includes('clear')) return <Sun size={20} className="text-yellow-400 drop-shadow" />;
    if (text.includes('partly')) return <CloudSun size={20} className="text-gray-200 drop-shadow" />;
    return <Cloud size={20} className="text-gray-300 drop-shadow" />;
  };

  const formatTime = (timeStr) => {
    const date = new Date(timeStr);
    let h = date.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h} ${ampm}`;
  };

  return (
    <div 
      onClick={() => navigate('/weather')}
      className="w-full relative overflow-hidden rounded-[30px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] cursor-pointer transition-transform hover:scale-[1.02]"
    >
      {/* Background Image Wrapper */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url('/assets/images/weather_defaultFallback.webp')` }}
      ></div>
      
      {/* Liquid Glass Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[15px] transform-gpu will-change-transform z-0 pointer-events-none"></div>
      
      {/* Content */}
      <div className="relative z-10 p-5 text-white">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg tracking-wide drop-shadow-md">Hourly Forecast</h3>
          <ChevronRight size={20} className="text-white/70" />
        </div>

        {/* Horizontal Scroll Area */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {loading ? (
            // Skeleton loader
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20 h-28 bg-white/10 rounded-2xl animate-pulse"></div>
            ))
          ) : (
            hourlyData.map((hour, index) => {
              const isCurrentHour = index === currentHourIndex;
              
              return (
                <div 
                  key={index}
                  data-active={isCurrentHour}
                  className={`flex-shrink-0 flex flex-col items-center justify-between p-3 rounded-2xl w-20 min-h-[112px] transition-all border ${
                    isCurrentHour 
                      ? 'bg-white/20 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                      : 'bg-white/5 border-white/10'
                  }`}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  <span className={`text-xs font-semibold ${isCurrentHour ? 'text-white' : 'text-white/70'}`}>
                    {isCurrentHour ? 'Now' : formatTime(hour.time)}
                  </span>
                  
                  <div className="my-2">
                    {getSmallWeatherIcon(hour.condition.text)}
                  </div>
                  
                  <span className="text-sm font-bold mb-1">
                    {Math.round(hour.temp_c)}°
                  </span>

                  <span className={`text-[9px] uppercase tracking-wider text-center leading-tight line-clamp-2 ${isCurrentHour ? 'text-white font-semibold' : 'text-white/60'}`}>
                    {hour.condition.text}
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
