import { useState, useEffect } from 'react';
import axios from 'axios';
import { Crosshair, X, Search, MapPin } from 'lucide-react';

export default function LocationModal({ isOpen, onClose, onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (manualCity.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
          const res = await axios.get(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${manualCity}`);
          setSuggestions(res.data || []);
        } catch (err) {
          console.error("Failed to fetch suggestions");
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
    }
  }, [manualCity]);

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
          setErrorMsg("Failed to connect to location service.");
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        if (error.code === 1) setErrorMsg("Please allow Location permissions.");
        else setErrorMsg("Failed to get GPS location.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleSelectSuggestion = (loc) => {
    onLocationSelect({ name: loc.name, region: loc.region, lat: loc.lat, lon: loc.lon });
    onClose();
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const styles = {
    overlay: { position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)' },
    modal: { width: '100%', maxWidth: '500px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(40px) saturate(200%)', WebkitBackdropFilter: 'blur(40px) saturate(200%)', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', border: '1px solid rgba(255, 255, 255, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.5)', padding: '24px', boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4)', display: 'flex', flexDirection: 'column', maxHeight: '85vh', boxSizing: 'border-box' },
    dragHandle: { width: '50px', height: '6px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '10px', margin: '0 auto 20px', backdropFilter: 'blur(10px)' },
    closeBtn: { position: 'absolute', top: '24px', right: '24px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', padding: '8px', borderRadius: '50%', color: '#fff', cursor: 'pointer' },
    title: { color: '#fff', fontSize: '22px', fontWeight: 'bold', marginBottom: '5px', textShadow: '0 2px 5px rgba(0,0,0,0.3)' },
    subtitle: { color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '25px' },
    gpsBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '16px', background: 'rgba(76, 175, 80, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(76, 175, 80, 0.4)', borderTop: '1px solid rgba(120, 255, 120, 0.6)', borderRadius: '20px', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' },
    dividerWrap: { display: 'flex', alignItems: 'center', gap: '15px', margin: '20px 0', opacity: 0.6 },
    dividerLine: { flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.3)' },
    dividerText: { color: '#fff', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' },
    searchContainer: { display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '15px' },
    inputBox: { width: '100%', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderTop: '1px solid rgba(255, 255, 255, 0.4)', padding: '16px 50px', borderRadius: '20px', color: '#fff', fontSize: '16px', outline: 'none', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', boxSizing: 'border-box' },
    searchIcon: { position: 'absolute', left: '16px', color: 'rgba(255, 255, 255, 0.6)' },
    submitBtn: { position: 'absolute', right: '12px', padding: '8px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', color: '#fff', border: 'none', cursor: 'pointer' },
    error: { background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)', color: '#ffb3b3', padding: '10px', borderRadius: '15px', textAlign: 'center', marginBottom: '15px', fontSize: '14px' },
    suggestionsList: { flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: '20px' },
    suggestionItem: { padding: '16px 20px', marginBottom: '10px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderTop: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' },
    suggestionIcon: { color: '#4CAF50', opacity: 0.8 },
    suggestionText: { color: '#fff', fontSize: '16px', fontWeight: '500' },
    suggestionSub: { color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', marginLeft: '5px' }
  };

  return (
    <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>
        <div style={styles.dragHandle}></div>
        <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
        
        <h3 style={styles.title}>Set Your Location</h3>
        <p style={styles.subtitle}>Get accurate weather and local market rates.</p>

        <button onClick={handleGPSScan} disabled={loading} style={styles.gpsBtn}>
          <Crosshair size={22} />
          {loading ? "Locating..." : "Use Current Location"}
        </button>

        <div style={styles.dividerWrap}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or manually</span>
          <div style={styles.dividerLine}></div>
        </div>

        <form onSubmit={handleManualSearch} style={styles.searchContainer}>
          <Search size={20} style={styles.searchIcon} />
          <input 
            type="text"
            placeholder="Enter city name..."
            value={manualCity}
            onChange={(e) => setManualCity(e.target.value)}
            disabled={loading}
            style={styles.inputBox}
            autoFocus
          />
        </form>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        <div style={styles.suggestionsList} className="no-scrollbar">
          {suggestions.map((loc, idx) => (
            <div key={idx} style={styles.suggestionItem} onClick={() => handleSelectSuggestion(loc)}>
              <MapPin size={18} style={styles.suggestionIcon} />
              <div>
                <span style={styles.suggestionText}>{loc.name}</span>
                <span style={styles.suggestionSub}>{loc.region}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
