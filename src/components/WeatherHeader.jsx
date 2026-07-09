import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CloudRain, CloudSun, Sun, Cloud, CloudLightning, Navigation, ChevronDown } from 'lucide-react';
import LocationModal from './LocationModal';

export default function WeatherHeader({ handleLogout }) {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState({ name: 'Chennai', region: 'TN', lat: null, lon: null });

  useEffect(() => {
    // Read from localStorage on mount
    const savedLoc = localStorage.getItem('farmCap_userLocation');
    if (savedLoc) {
      setUserLocation(JSON.parse(savedLoc));
    }
  }, []);

  useEffect(() => {
    fetchWeather(userLocation);
  }, [userLocation]);

  const fetchWeather = async (loc) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const query = loc.lat && loc.lon ? `${loc.lat},${loc.lon}` : loc.name;
      const res = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`);
      setWeatherData(res.data);
    } catch (err) {
      console.error("Failed to fetch weather:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (loc) => {
    setUserLocation(loc);
    localStorage.setItem('farmCap_userLocation', JSON.stringify(loc));
  };

  // Weather Icon Logic
  const AppleWeatherIcon = () => (
    <svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 6px 8px rgba(0,0,0,0.15))' }}>
      <defs>
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFE872" />
          <stop offset="100%" stopColor="#FFA800" />
        </radialGradient>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>
      </defs>
      {/* Sun glow */}
      <circle cx="34" cy="18" r="18" fill="#FFA800" opacity="0.4" filter="blur(4px)" />
      {/* Sun */}
      <circle cx="34" cy="18" r="16" fill="url(#sunGrad)" />
      {/* Cloud shadow */}
      <path d="M12 35C9.6863 35 7 32.3137 7 29C7 25.6863 9.6863 23 12 23C12.7738 23 13.5133 23.1466 14.1965 23.4116C15.5113 19.1566 19.464 16 24 16C29.5228 16 34 20.4772 34 26C34 26.1388 33.9972 26.2769 33.9916 26.4144C36.2711 27.2573 38 29.4316 38 32C38 35.3137 35.3137 38 32 38H12Z" fill="rgba(0,0,0,0.1)" filter="blur(2px)" />
      {/* Cloud */}
      <path d="M12 34C9.6863 34 7 31.3137 7 28C7 24.6863 9.6863 22 12 22C12.7738 22 13.5133 22.1466 14.1965 22.4116C15.5113 18.1566 19.464 15 24 15C29.5228 15 34 19.4772 34 25C34 25.1388 33.9972 25.2769 33.9916 25.4144C36.2711 26.2573 38 28.4316 38 31C38 34.3137 35.3137 37 32 37H12Z" fill="url(#cloudGrad)" />
    </svg>
  );

  const getWeatherIcon = () => {
    if (!weatherData) return <AppleWeatherIcon />;
    const condition = weatherData.current.condition.text.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('drizzle')) return <CloudRain className="w-10 h-10 text-white drop-shadow-md" />;
    if (condition.includes('thunder') || condition.includes('storm')) return <CloudLightning className="w-10 h-10 text-white drop-shadow-md" />;
    if (condition.includes('cloud') || condition.includes('overcast') || condition.includes('partly')) return <AppleWeatherIcon />;
    return <AppleWeatherIcon />;
  };

  return (
    <>
    <div className="relative w-full overflow-hidden shrink-0 rounded-b-[2.5rem] shadow-md border-b border-sky-100/50" style={{ paddingBottom: 0 }}>
      <style>{`
        .sky-header {
          position: absolute;
          top: 0; left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(150deg, #0ea5e9 0%, #38bdf8 45%, #bae6fd 100%);
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
          top: 20px;
          right: 120px;
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
          top: 15px;
          right: 115px;
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
          top: 5px;
          right: 105px;
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
        .bokeh-1 { top: 30px; right: 140px; width: 45px; height: 45px; background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(255, 255, 255, 0.25); filter: blur(0.5px); }
        .bokeh-2 { top: 50px; right: 160px; width: 30px; height: 30px; background: rgba(255, 255, 255, 0.15); border: 1.5px solid rgba(255, 255, 255, 0.25); filter: blur(0.5px); animation-delay: -2s; }
        .bokeh-3 { top: 70px; right: 180px; width: 20px; height: 20px; background: rgba(255, 255, 255, 0.25); border: 1.5px solid rgba(255, 255, 255, 0.35); animation-delay: -4s; }
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
        <div style={{ position: 'absolute', top: '15%', left: '20%', opacity: 0.85, transform: 'scale(0.5) rotate(-5deg)' }}>
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
          </svg>
        </div>
        <div style={{ position: 'absolute', top: '22%', left: '35%', opacity: 0.7, transform: 'scale(0.35) rotate(-10deg)' }}>
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
          </svg>
        </div>
        <div style={{ position: 'absolute', top: '12%', left: '55%', opacity: 0.6, transform: 'scale(0.3) rotate(5deg)' }}>
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
          </svg>
        </div>
        <div style={{ position: 'absolute', top: '28%', left: '75%', opacity: 0.5, transform: 'scale(0.25) rotate(-2deg)' }}>
          <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q10 0 20 10 Q30 0 40 10 Q30 5 20 15 Q10 5 0 10 Z" fill="#2c3e50"/>
          </svg>
        </div>
      </div>

      {/* Foreground UI - EXACT MATCH TO MY FIRST APP */}
      <div className="relative z-20 w-full" style={{ padding: '15px 20px 15px 20px', paddingTop: 'max(15px, env(safe-area-inset-top))' }}>
        <div className="flex justify-between items-start w-full mb-2">
          
          {/* Location Area - EXACTLY like old app */}
          <div className="flex flex-col justify-center cursor-pointer" onClick={() => setShowLocationModal(true)}>
            <div className="flex items-center">
                <div style={{fontSize:'20px', fontWeight:'900', color: '#ffffff', textTransform:'capitalize'}}>
                    <span style={{color:'#ff5252', marginRight:'6px'}}>📍</span>{loading ? "Locating..." : (weatherData?.location?.name || userLocation.name)}
                </div>
            </div>
            <div style={{
                color: 'rgba(255,255,255,0.8)', fontSize:'13px', marginTop:'2px', maxWidth:'280px', 
                whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', fontWeight:'600', paddingLeft:'2px'
            }}>
              {loading ? "Fetching Location" : (weatherData?.location?.name + ", " + weatherData?.location?.region || `${userLocation.name}, ${userLocation.region}`)}
            </div>
          </div>

          {/* Right Side Weather Logo (Big Icon + Temp Below) */}
          <div 
            onClick={() => navigate('/weather')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px'
          }}>
            <div className="flex items-center justify-center">
              {getWeatherIcon()}
            </div>
            <span className="text-[14px] font-black leading-none drop-shadow-sm text-white">
              {loading ? "--" : Math.round(weatherData?.current?.temp_c)}°
            </span>
          </div>
          
        </div>
      </div>
    </div>

    {/* Modals */}
    <LocationModal 
      isOpen={showLocationModal} 
      onClose={() => setShowLocationModal(false)} 
      onLocationSelect={handleLocationSelect}
    />
    </>
  );
}
