import { useState } from 'react';
import axios from 'axios';
import { MapPin, Crosshair, X, Search } from 'lucide-react';

export default function LocationModal({ isOpen, onClose, onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [manualCity, setManualCity] = useState("");

  if (!isOpen) return null;

  const handleGPSScan = () => {
    setLoading(true);
    setErrorMsg("");

    if (!navigator.geolocation) {
      setErrorMsg("GPS is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
          const res = await axios.get(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${lat},${lon}`);
          
          if (res.data && res.data.length > 0) {
            const loc = res.data[0];
            onLocationSelect({ name: loc.name, region: loc.region, lat, lon });
            onClose();
          } else {
            setErrorMsg("Could not find city from GPS coordinates.");
          }
        } catch (err) {
          console.error(err);
          setErrorMsg("Failed to connect to location service.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error(error);
        if (error.code === 1) setErrorMsg("Please allow Location permissions.");
        else setErrorMsg("Failed to get GPS location.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const res = await axios.get(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${manualCity}`);
      
      if (res.data && res.data.length > 0) {
        const loc = res.data[0];
        onLocationSelect({ name: loc.name, region: loc.region, lat: loc.lat, lon: loc.lon });
        onClose();
      } else {
        setErrorMsg("City not found. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to search city.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-2xl p-6 pb-safe shadow-2xl animate-in slide-in-from-bottom-full duration-300 z-10">
        
        {/* Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden" />
        
        <button onClick={onClose} className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition">
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-slate-800 mb-1">Set Your Location</h3>
        <p className="text-sm text-slate-500 mb-6">Get accurate weather and local market rates.</p>

        {/* GPS Button */}
        <button 
          onClick={handleGPSScan}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-500/30 disabled:opacity-70"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Crosshair size={22} />
          )}
          {loading ? "Locating..." : "Use Current Location"}
        </button>

        <div className="flex items-center gap-4 my-6 opacity-60">
          <div className="flex-1 h-px bg-slate-300"></div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">or manually</span>
          <div className="flex-1 h-px bg-slate-300"></div>
        </div>

        {/* Manual Input */}
        <form onSubmit={handleManualSearch} className="relative flex items-center mb-4">
          <MapPin size={20} className="absolute left-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Enter city name..."
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          />
          <button 
            type="submit"
            disabled={loading || !manualCity.trim()}
            className="absolute right-2 p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg disabled:opacity-50 transition"
          >
            <Search size={20} />
          </button>
        </form>

        {errorMsg && (
          <p className="text-red-500 text-sm font-medium mt-2 text-center bg-red-50 py-2 rounded-lg border border-red-100 mb-2">
            {errorMsg}
          </p>
        )}
        
      </div>
    </div>
  );
}
