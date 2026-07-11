import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { Bell, ShieldCheck, Activity, ChevronLeft, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let securityData = {};
    let sensorData = {};
    
    const compileAlerts = () => {
      const securityArray = Object.entries(securityData || {}).map(([id, val]) => ({
        id,
        ...val,
        type: 'security'
      }));
      
      const sensorArray = Object.entries(sensorData || {}).map(([id, val]) => ({
        id,
        ...val,
        type: 'sensor'
      }));
      
      const merged = [...securityArray, ...sensorArray].sort((a, b) => b.timestamp - a.timestamp);
      setAlerts(merged);
      setLoading(false);
    };

    const securityRef = query(ref(db, 'security_alerts'), limitToLast(20));
    const sensorRef = query(ref(db, 'sensor_alerts'), limitToLast(20));

    const unsubSecurity = onValue(securityRef, (snapshot) => {
      securityData = snapshot.val() || {};
      compileAlerts();
    });

    const unsubSensor = onValue(sensorRef, (snapshot) => {
      sensorData = snapshot.val() || {};
      compileAlerts();
    });

    return () => {
      unsubSecurity();
      unsubSensor();
    };
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleString([], { 
      month: 'short', day: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  const handleAlertClick = (alert) => {
    if (alert.type === 'sensor') {
      navigate('/sensor-report');
    }
  };

  const getAlertStyle = (level = 0) => {
    if (level > 5) return { bg: 'bg-red-500/10 border-red-500/30', text: 'text-red-400', iconBg: 'bg-red-500/20' };
    if (level > 0) return { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', iconBg: 'bg-yellow-500/20' };
    return { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', iconBg: 'bg-emerald-500/20' };
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Bell size={20} className="text-emerald-400" />
            Notifications
          </h1>
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-10 text-white/50">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p>No notifications yet.</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const style = getAlertStyle(alert.threatLevel);
            return (
            <div 
              key={alert.id} 
              onClick={() => handleAlertClick(alert)}
              className={`p-4 rounded-2xl border transition-all ${alert.type === 'sensor' ? 'cursor-pointer hover:bg-white/10' : ''} ${style.bg}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-full ${style.iconBg} ${style.text}`}>
                    {alert.type === 'security' ? <ShieldCheck size={18} /> : <Droplets size={18} />}
                  </div>
                  <span className={`font-bold ${style.text}`}>
                    {alert.type === 'security' ? 'Security Alert' : 'Sensor Alert'}
                  </span>
                </div>
                <span className="text-xs text-white/50">{formatTime(alert.timestamp)}</span>
              </div>
              
              <p className="text-sm text-white/90 mb-3">{alert.description}</p>
              
              {alert.imageUrl && (
                <div className="relative h-32 w-full rounded-xl overflow-hidden border border-white/10 mt-2">
                  <img 
                    src={alert.imageUrl} 
                    alt="Alert Snapshot" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}
