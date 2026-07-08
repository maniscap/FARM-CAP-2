import { useEffect, useState } from 'react';
import axios from 'axios';
import { CloudRain, CloudSun, Sun, Cloud, CloudLightning, Navigation } from 'lucide-react';

export default function WeatherHeader({ handleLogout }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const res = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Chennai`);
        setWeatherData(res.data);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  // Weather Icon Logic
  const getWeatherIcon = () => {
    if (!weatherData) return <Sun className="w-10 h-10 text-white drop-shadow-md" />;
    const condition = weatherData.current.condition.text.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) return <CloudRain className="w-10 h-10 text-white drop-shadow-md" />;
    if (condition.includes('thunder') || condition.includes('storm')) return <CloudLightning className="w-10 h-10 text-white drop-shadow-md" />;
    if (condition.includes('cloud') || condition.includes('overcast')) return <Cloud className="w-10 h-10 text-white drop-shadow-md" />;
    if (condition.includes('partly')) return <CloudSun className="w-10 h-10 text-white drop-shadow-md" />;
    return <Sun className="w-10 h-10 text-white drop-shadow-md" />;
  };

  return (
    <div className="relative w-full h-56 overflow-hidden rounded-b-[2rem] shadow-sm shrink-0">
      <style>{`
        .sky-header {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(150deg, #1ea2ff 0%, #7ed3ff 45%, #d0f0ff 100%);
          overflow: hidden;
          isolation: isolate;
        }
        @keyframes bokeh-drift {
          0% { transform: translate(0, 0) scale(1); opacity: 0.6; }
          100% { transform: translate(-10px, 10px) scale(1.05); opacity: 0.9; }
        }
        @keyframes sun-breathe {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }
        .sun-core {
          position: absolute;
          top: 30px;
          right: 25%;
          width: 35px;
          height: 35px;
          background: #ffffff;
          border-radius: 50%;
          filter: none;
          box-shadow: 0 0 20px 8px rgba(255, 255, 255, 1), 0 0 40px 15px rgba(255, 255, 255, 0.5);
          mix-blend-mode: screen;
          animation: sun-breathe 4s ease-in-out infinite alternate;
          z-index: 10;
        }
        .sun-halo {
          position: absolute;
          top: 25px;
          right: calc(25% - 5px);
          width: 45px;
          height: 45px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          filter: blur(8px);
          mix-blend-mode: screen;
          animation: sun-breathe 5s ease-in-out infinite alternate;
        }
        .sun-ambient {
          position: absolute;
          top: 15px;
          right: calc(25% - 15px);
          width: 65px;
          height: 65px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          filter: blur(15px);
          mix-blend-mode: overlay;
        }
        .bokeh {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          mix-blend-mode: screen;
          animation: bokeh-drift 8s ease-in-out infinite alternate;
        }
        .bokeh-1 { top: 40px; right: 35%; width: 45px; height: 45px; background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(255, 255, 255, 0.25); filter: blur(0.5px); }
        .bokeh-2 { top: 60px; right: 40%; width: 30px; height: 30px; background: rgba(255, 255, 255, 0.15); border: 1.5px solid rgba(255, 255, 255, 0.25); filter: blur(0.5px); animation-delay: -2s; }
        .bokeh-3 { top: 80px; right: 45%; width: 20px; height: 20px; background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.35); animation-delay: -4s; }
      `}</style>

      {/* Background Art */}
      <div className="sky-header">
        <div className="sun-ambient"></div>
        <div className="sun-halo"></div>
        <div className="sun-core"></div>
        <div className="bokeh bokeh-1"></div>
        <div className="bokeh bokeh-2"></div>
        <div className="bokeh bokeh-3"></div>

        {/* SVG Birds */}
        <div style={{ position: 'absolute', top: '25%', left: '15%', opacity: 0.85, transform: 'scale(0.5) rotate(-5deg)' }}>
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
          </svg>
        </div>
        <div style={{ position: 'absolute', top: '35%', left: '30%', opacity: 0.7, transform: 'scale(0.35) rotate(-10deg)' }}>
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
          </svg>
        </div>
      </div>

      {/* Foreground UI */}
      <div className="relative z-20 w-full h-full p-6 pb-8 flex flex-col justify-between pt-10">
        
        {/* Top Navbar Row */}
        <div className="flex justify-between items-start w-full">
          {/* Location Area */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-white drop-shadow-md cursor-pointer">
              <Navigation className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-sm" />
              <h2 className="text-2xl font-bold tracking-tight">
                {loading ? "Locating..." : (weatherData?.location?.name || "Chennai")}
              </h2>
            </div>
            <p className="text-white/90 text-sm font-medium pl-6 drop-shadow-sm">
              {loading ? "--" : `${weatherData?.location?.region || "TN"}, ${weatherData?.location?.country || "India"}`}
            </p>
          </div>

          <button 
            onClick={handleLogout}
            className="text-white/90 font-medium text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full border border-white/20 transition drop-shadow-sm"
          >
            Logout
          </button>
        </div>

        {/* Bottom Row - Weather Info */}
        <div className="flex justify-between items-end w-full">
          <div className="flex flex-col text-white drop-shadow-md">
            <h1 className="text-6xl font-black tabular-nums tracking-tighter">
              {loading ? "--" : Math.round(weatherData?.current?.temp_c)}°
            </h1>
            <p className="text-base font-semibold opacity-95 mt-1 capitalize tracking-wide">
              {loading ? "Fetching weather..." : weatherData?.current?.condition?.text}
            </p>
          </div>

          <div className="flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
            {getWeatherIcon()}
          </div>
        </div>

      </div>
    </div>
  );
}
