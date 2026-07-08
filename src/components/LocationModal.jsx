import { useState, useEffect } from 'react';
import axios from 'axios';
import { Crosshair, X, Search, MapPin, Share2, Clock } from 'lucide-react';

export default function LocationModal({ isOpen, onClose, onLocationSelect }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [manualCity, setManualCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const history = localStorage.getItem('farmBuddy_mainSearchHistory');
    if (history) setSearchHistory(JSON.parse(history));
  }, []);

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

  const saveToHistory = (loc) => {
    const updated = [loc, ...searchHistory.filter(h => h.name !== loc.name)].slice(0, 5);
    setSearchHistory(updated);
    localStorage.setItem('farmBuddy_mainSearchHistory', JSON.stringify(updated));
  };

  const handleSelectSuggestion = (loc) => {
    saveToHistory(loc);
    onLocationSelect({ name: loc.name, region: loc.region, lat: loc.lat, lon: loc.lon });
    onClose();
  };

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
            const locData = { name: loc.name, region: loc.region, lat, lon };
            saveToHistory(locData);
            onLocationSelect(locData);
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

  const handleShare = async (e, loc) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Location: ${loc.name}`,
          text: `Check out this location: ${loc.name}, ${loc.region}\nCoordinates: ${loc.lat}, ${loc.lon}`,
          url: `https://www.google.com/maps?q=${loc.lat},${loc.lon}`
        });
      } else {
        alert("Sharing is not supported on this browser.");
      }
    } catch (err) {
      console.log("Error sharing", err);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    if (suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  const styles = {
    overlay: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(30px) saturate(180%)', WebkitBackdropFilter: 'blur(30px) saturate(180%)', display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' },
    content: { padding: '25px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' },
    header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(30px) saturate(200%)', padding: '14px 20px', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.2)', borderTop: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.4)' },
    closeBtn: { background: 'transparent', border: 'none', color: '#ccc', cursor: 'pointer', padding: '5px' },
    inputBox: { flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '18px', outline: 'none', fontWeight: '500' },
    gpsBtn: { display: 'flex', alignItems: 'center', gap: '10px', color: '#4CAF50', padding: '18px 22px', background: 'rgba(76, 175, 80, 0.1)', backdropFilter: 'blur(20px)', borderRadius: '20px', border: '1px solid rgba(76, 175, 80, 0.3)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)', fontWeight: 'bold', cursor: 'pointer', marginBottom: '20px' },
    suggestionsList: { flex: 1, overflowY: 'auto', scrollbarWidth: 'none', paddingBottom: '40px' },
    suggestionItem: { padding: '18px 22px', marginBottom: '12px', borderRadius: '20px', background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(20px) saturate(150%)', border: '1px solid rgba(255, 255, 255, 0.15)', borderTop: '1px solid rgba(255, 255, 255, 0.4)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.3)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '16px', fontWeight: '600' },
    suggestionIcon: { color: '#4CAF50', opacity: 0.8 },
    suggestionText: { color: '#fff', fontSize: '16px', fontWeight: '500' },
    suggestionSub: { color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', marginLeft: '5px' },
    sectionLabel: { fontSize: '12px', opacity: 0.6, marginBottom: '12px', fontWeight: 'bold', letterSpacing: '1px', color: '#fff' },
    shareBtn: { padding: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    error: { background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.3)', color: '#ffb3b3', padding: '10px', borderRadius: '15px', textAlign: 'center', marginBottom: '15px', fontSize: '14px' }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        
        <div style={styles.header}>
          <button onClick={onClose} style={styles.closeBtn}><X size={24} /></button>
          <form onSubmit={handleManualSearch} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <input 
              type="text"
              placeholder="Search for a city..."
              value={manualCity}
              onChange={(e) => setManualCity(e.target.value)}
              disabled={loading}
              style={styles.inputBox}
              autoFocus
            />
          </form>
          {manualCity && (
             <X size={22} color="#888" style={{ cursor: 'pointer' }} onClick={() => setManualCity("")} />
          )}
        </div>

        {errorMsg && <p style={styles.error}>{errorMsg}</p>}

        <div style={styles.suggestionsList} className="no-scrollbar">
          
          {manualCity.length === 0 && (
            <>
              <div style={styles.gpsBtn} onClick={handleGPSScan}>
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Crosshair size={22} />}
                {loading ? "Locating..." : "Use Precise GPS Location"}
              </div>

              {searchHistory.length > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', marginBottom: '10px' }}>
                    <p style={{ ...styles.sectionLabel, margin: 0 }}>RECENT SEARCHES</p>
                    <span style={{ fontSize: '12px', color: '#ff6b6b', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setSearchHistory([]); localStorage.removeItem('farmBuddy_mainSearchHistory') }}>Clear</span>
                  </div>
                  {searchHistory.map((historyItem, idx) => (
                    <div key={`hist-${idx}`} style={styles.suggestionItem} onClick={() => handleSelectSuggestion(historyItem)}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Clock size={20} color="#888" />
                        <div>
                          <div style={styles.suggestionText}>{historyItem.name}</div>
                          <div style={styles.suggestionSub}>{historyItem.region}</div>
                        </div>
                      </div>
                      <button style={styles.shareBtn} onClick={(e) => handleShare(e, historyItem)}>
                        <Share2 size={16} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {suggestions.map((loc, idx) => (
            <div key={idx} style={styles.suggestionItem} onClick={() => handleSelectSuggestion(loc)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <MapPin size={20} style={styles.suggestionIcon} />
                <div>
                  <div style={styles.suggestionText}>{loc.name}</div>
                  <div style={styles.suggestionSub}>{loc.region}</div>
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
