import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CloudRain, CloudSun, Sun, Moon, Cloud, CloudLightning, ChevronRight } from 'lucide-react';

export default function HomeWeatherWidget() {
  const navigate = useNavigate();
  const [hourlyData, setHourlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('Chennai');
  const [currentHourIndex, setCurrentHourIndex] = useState(new Date().getHours());
  const scrollRef = useRef(null);

  useEffect(() => {
    fetchForecast();
  }, []);

  const fetchForecast = async () => {
    try {
      // 1. Get location from localStorage
      const savedLoc = localStorage.getItem('farmBuddy_lastCity');
      let loc = { name: 'Chennai', region: 'TN', lat: null, lon: null };
      if (savedLoc) {
        loc = JSON.parse(savedLoc);
      }
      setLocationName(loc.name || 'Unknown Location');

      // 2. Fetch forecast
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const query = loc.lat && loc.lon ? `${loc.lat},${loc.lon}` : loc.name;
      const res = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=1`);
      
      const hours = res.data.forecast.forecastday[0].hour;
      setHourlyData(hours);
      
      const localTimeStr = res.data.location?.localtime;
      if (localTimeStr) {
          const hour = parseInt(localTimeStr.split(' ')[1].split(':')[0], 10);
          setCurrentHourIndex(hour);
      }
      
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

  const getSmallWeatherIcon = (conditionText, isDay) => {
    const text = conditionText.toLowerCase();
    if (text.includes('rain') || text.includes('drizzle')) return <CloudRain size={20} className="text-blue-300 drop-shadow" />;
    if (text.includes('thunder') || text.includes('storm')) return <CloudLightning size={20} className="text-purple-300 drop-shadow" />;
    if (text.includes('sun') || text.includes('clear')) {
      return isDay ? <Sun size={20} className="text-yellow-400 drop-shadow" /> : <Moon size={20} className="text-indigo-200 drop-shadow" />;
    }
    if (text.includes('partly')) {
      return isDay ? <CloudSun size={20} className="text-gray-200 drop-shadow" /> : <Cloud size={20} className="text-gray-300 drop-shadow" />;
    }
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
      className="relative z-10 p-5 pb-6 text-white w-full cursor-pointer hover:bg-white/5 transition-colors"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg tracking-wide drop-shadow-md">Hourly Forecast</h3>
            <p className="text-xs text-white/80 font-medium drop-shadow-md flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              {locationName}
            </p>
          </div>
          <ChevronRight size={20} className="text-white/70" />
        </div>

        {/* Horizontal Scroll Area */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar"
          style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}
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
                  className={`flex-shrink-0 flex flex-col items-center justify-between p-3 rounded-2xl w-20 min-h-[112px] transition-all border transform-gpu ${
                    isCurrentHour 
                      ? 'bg-white/20 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                      : 'bg-white/5 border-white/10'
                  }`}
                  style={{ scrollSnapAlign: 'center', transform: 'translateZ(0)' }}
                >
                  <span className={`text-xs font-semibold ${isCurrentHour ? 'text-white' : 'text-white/70'}`}>
                    {isCurrentHour ? 'Now' : formatTime(hour.time)}
                  </span>
                  
                  <div className="my-2">
                    {getSmallWeatherIcon(hour.condition.text, hour.is_day)}
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
  );
}
