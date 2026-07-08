import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CloudRain, CloudSun, Sun, Cloud, CloudLightning, Navigation } from 'lucide-react';
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
      <div className="relative z-20 w-full" style={{ padding: '25px 20px 20px 20px', paddingTop: 'max(25px, env(safe-area-inset-top))' }}>
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

          {/* Right Side Weather Logo (Replacing Profile Circle) */}
          <div 
            onClick={() => navigate('/weather')}
            className="cursor-pointer hover:bg-black/20 transition"
            style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <div className="scale-75 flex items-center justify-center">
              {getWeatherIcon()}
            </div>
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
