import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, query, orderByChild } from 'firebase/database';
import { idb } from '../utils/idb';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ShieldCheck, AlertTriangle, Camera, Sparkles, 
  Maximize2, ArrowLeft, WifiOff, Clock, Eye 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CACHE_KEY = 'security_alerts_cache';

export default function SecurityReportView() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    // Load cached data first for instant display
    const loadCache = async () => {
      const cached = await idb.get(CACHE_KEY);
      if (cached && cached.length > 0) {
        setAlerts(cached);
        setLoading(false);
      }
    };
    loadCache();

    // Listen to Firebase for live updates
    const alertsRef = query(ref(db, 'security_alerts'), orderByChild('timestamp'));

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      setLoading(false);
      setIsOffline(false);
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert object to array and sort newest first
        const alertsArray = Object.entries(data)
          .map(([id, val]) => ({ id, ...val }))
          .sort((a, b) => b.timestamp - a.timestamp);
        
        setAlerts(alertsArray);
        // Cache to IndexedDB
        idb.set(CACHE_KEY, alertsArray);
      }
    }, (err) => {
      console.error("Firebase Security Error:", err);
      setIsOffline(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getThreatColor = (level) => {
    if (!level || level === 0) return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Clear' };
    if (level <= 3) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', label: 'Low' };
    if (level <= 5) return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Medium' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Critical' };
  };

  // Group alerts by date
  const groupedAlerts = alerts.reduce((groups, alert) => {
    const dateKey = formatDate(alert.timestamp);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(alert);
    return groups;
  }, {});

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between p-4 max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <ShieldCheck size={18} className="text-red-400" />
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-wide">Farm Security</h1>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">
                  {alerts.length} Alert{alerts.length !== 1 ? 's' : ''} Recorded
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {isOffline ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/30">
              <WifiOff size={12} className="text-yellow-400" />
              <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pb-32 pt-4">
        
        {/* Latest Alert - Hero Card */}
        {alerts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              {/* Image */}
              <div className="relative w-full h-56 bg-black/80 group">
                {alerts[0].imageUrl ? (
                  <img 
                    src={alerts[0].imageUrl} 
                    alt="Latest Security Capture" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={48} className="text-white/20" />
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                
                {/* Enlarge button */}
                <button 
                  onClick={() => setFullscreenImage(alerts[0].imageUrl)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Maximize2 size={16} />
                </button>

                {/* Latest badge */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-red-500/80 backdrop-blur-md border border-red-400/30">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Latest Capture</span>
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-white/60" />
                      <span className="text-xs font-mono text-white/80">
                        {formatTime(alerts[0].timestamp)} · {formatDate(alerts[0].timestamp)}
                      </span>
                    </div>
                    {alerts[0].threatLevel !== undefined && (
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getThreatColor(alerts[0].threatLevel).bg} ${getThreatColor(alerts[0].threatLevel).text} ${getThreatColor(alerts[0].threatLevel).border}`}>
                        Level {alerts[0].threatLevel} · {getThreatColor(alerts[0].threatLevel).label}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Analysis */}
              {alerts[0].description && (
                <div className={`p-4 border-t ${alerts[0].threatLevel > 5 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/15'}`}>
                  <div className="flex items-start gap-2.5">
                    <Sparkles size={16} className={`mt-0.5 flex-shrink-0 ${alerts[0].threatLevel > 5 ? 'text-red-400' : 'text-emerald-400'}`} />
                    <div>
                      <span className={`font-bold text-xs uppercase tracking-wider ${alerts[0].threatLevel > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                        AI Analysis
                      </span>
                      <p className="text-sm text-white/80 mt-1 leading-relaxed">{alerts[0].description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <Camera size={48} className="animate-pulse mb-4" />
            <p className="text-sm font-medium">Loading Security Alerts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <ShieldCheck size={48} className="mb-4" />
            <p className="text-sm font-medium">No Security Alerts Yet</p>
            <p className="text-xs mt-1">The PIR sensor hasn't detected any motion.</p>
          </div>
        )}

        {/* Alert History Timeline */}
        {Object.keys(groupedAlerts).length > 0 && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <Eye size={14} /> Alert History
            </h2>

            {Object.entries(groupedAlerts).map(([dateKey, dateAlerts], groupIndex) => (
              <div key={dateKey} className="mb-6">
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{dateKey}</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-[10px] text-white/30 font-mono">{dateAlerts.length} alert{dateAlerts.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Alert Cards */}
                <div className="space-y-3">
                  {dateAlerts.map((alert, index) => {
                    const threat = getThreatColor(alert.threatLevel);
                    // Skip the first alert if it's the first group (already shown as hero)
                    if (groupIndex === 0 && index === 0) return null;
                    
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                        className="flex gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors cursor-pointer active:scale-[0.98]"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/40 border border-white/10">
                          {alert.imageUrl ? (
                            <img 
                              src={alert.imageUrl} 
                              alt="Alert" 
                              className="w-full h-full object-cover"
                              onClick={(e) => { e.stopPropagation(); setFullscreenImage(alert.imageUrl); }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera size={16} className="text-white/20" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-white/50">{formatTime(alert.timestamp)}</span>
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${threat.bg} ${threat.text} ${threat.border}`}>
                              {threat.label}
                            </div>
                          </div>
                          <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
                            {alert.description || 'Motion detected — no AI analysis available.'}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {selectedAlert && dateAlerts.find(a => a.id === selectedAlert.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="rounded-2xl border border-white/15 overflow-hidden bg-white/5">
                        {selectedAlert.imageUrl && (
                          <img 
                            src={selectedAlert.imageUrl} 
                            alt="Full Alert" 
                            className="w-full h-48 object-cover cursor-pointer"
                            onClick={() => setFullscreenImage(selectedAlert.imageUrl)}
                          />
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className={getThreatColor(selectedAlert.threatLevel).text} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${getThreatColor(selectedAlert.threatLevel).text}`}>
                              Threat Level: {selectedAlert.threatLevel || 0} / 10
                            </span>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed">
                            {selectedAlert.description || 'No analysis available for this alert.'}
                          </p>
                          <div className="mt-3 flex items-center gap-2 text-white/40">
                            <Clock size={12} />
                            <span className="text-[10px] font-mono">
                              {new Date(selectedAlert.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 flex flex-col backdrop-blur-xl"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <div className="flex items-center gap-3 text-white">
                <button 
                  onClick={() => setFullscreenImage(null)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <ShieldCheck size={24} className="text-red-500" />
                <span className="font-bold text-lg tracking-wide">Security Capture</span>
              </div>
              <button 
                onClick={() => setFullscreenImage(null)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex-1 w-full h-full flex items-center justify-center p-4">
              <img 
                src={fullscreenImage} 
                alt="Fullscreen Security" 
                className="w-full h-auto max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
