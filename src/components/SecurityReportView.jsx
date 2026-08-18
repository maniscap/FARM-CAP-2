import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { ref, onValue, query, orderByChild, remove, update } from 'firebase/database';
import { idb } from '../utils/idb';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ShieldCheck, AlertTriangle, Camera, Sparkles, 
  Maximize2, ArrowLeft, WifiOff, Clock, Eye, Trash2, X, RefreshCw, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CACHE_KEY = 'security_alerts_cache';

export default function SecurityReportView() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // alert id or 'all'
  const [deleting, setDeleting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);

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
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        setAlerts(alertsArray);
        // Cache to IndexedDB
        idb.set(CACHE_KEY, alertsArray);
      } else {
        setAlerts([]);
        idb.set(CACHE_KEY, []);
      }
    }, (err) => {
      console.error("Firebase Security Error:", err);
      setIsOffline(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Run AI Vision Analysis on any alert
  const handleRunAIAnalysis = async (alert) => {
    if (!alert || !alert.imageUrl || analyzingId) return;
    setAnalyzingId(alert.id);
    try {
      const res = await fetch('/api/analyze-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: alert.imageUrl,
          alertId: alert.id
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        // Update local state immediately
        const updated = {
          ...alert,
          threatDetected: data.result.threatDetected,
          threatLevel: data.result.threatLevel,
          description: data.result.description
        };
        setAlerts(prev => prev.map(a => a.id === alert.id ? updated : a));
        if (selectedAlert && selectedAlert.id === alert.id) {
          setSelectedAlert(updated);
        }
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
    }
    setAnalyzingId(null);
  };

  // Select alert and scroll to top
  const handleSelectAlert = (alert) => {
    setSelectedAlert(alert);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Delete single alert
  const handleDeleteAlert = async (alertId) => {
    setDeleting(true);
    try {
      await remove(ref(db, `security_alerts/${alertId}`));
      setDeleteConfirm(null);
      setSelectedAlert(null);
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setDeleting(false);
  };

  // Delete all alerts
  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await remove(ref(db, 'security_alerts'));
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Delete all failed:", err);
    }
    setDeleting(false);
  };

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

  const activeAlert = selectedAlert || alerts[0] || null;

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-y-auto bg-black text-white">
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

          <div className="flex items-center gap-2">
            {/* Clear All Button */}
            {alerts.length > 0 && (
              <button
                onClick={() => setDeleteConfirm('all')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors"
              >
                <Trash2 size={12} className="text-red-400" />
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Clear All</span>
              </button>
            )}

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
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 pb-32 pt-4">
        
        {/* Active Alert - Hero Card */}
        {activeAlert && (
          <motion.div 
            key={activeAlert.id}
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="relative overflow-hidden rounded-3xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] bg-[#111]">
              {/* Image */}
              <div className="relative w-full h-64 bg-black group">
                {activeAlert.imageUrl ? (
                  <img 
                    src={activeAlert.imageUrl} 
                    alt="Security Capture" 
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setFullscreenImage(activeAlert.imageUrl)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={48} className="text-white/20" />
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20 pointer-events-none"></div>
                
                {/* Top Action Buttons */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button 
                    onClick={() => setFullscreenImage(activeAlert.imageUrl)}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-md transition-colors"
                    title="Fullscreen View"
                  >
                    <Maximize2 size={16} />
                  </button>

                  <button 
                    onClick={() => setDeleteConfirm(activeAlert.id)}
                    className="p-2 rounded-full bg-red-500/50 hover:bg-red-500/70 border border-red-400/40 backdrop-blur-md transition-colors"
                    title="Delete this capture"
                  >
                    <Trash2 size={16} className="text-white" />
                  </button>
                </div>

                {/* Badge (Latest vs Selected Snapshot) */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {selectedAlert && selectedAlert.id !== alerts[0]?.id ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md border border-blue-400/40 shadow-lg">
                      <Eye size={12} className="text-white" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-white">Selected Snapshot</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedAlert(null); }}
                        className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        title="Back to latest"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="px-3 py-1 rounded-full bg-red-500/90 backdrop-blur-md border border-red-400/40 shadow-lg">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white">Latest Capture</span>
                    </div>
                  )}
                </div>

                {/* Bottom info overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-white/70" />
                      <span className="text-xs font-mono text-white font-semibold">
                        {formatTime(activeAlert.timestamp)} · {formatDate(activeAlert.timestamp)}
                      </span>
                    </div>
                    {activeAlert.threatLevel !== undefined && (
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-md ${getThreatColor(activeAlert.threatLevel).bg} ${getThreatColor(activeAlert.threatLevel).text} ${getThreatColor(activeAlert.threatLevel).border}`}>
                        Level {activeAlert.threatLevel} · {getThreatColor(activeAlert.threatLevel).label}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* AI Analysis Section */}
              <div className={`p-4 border-t ${activeAlert.threatLevel > 5 ? 'bg-red-500/10 border-red-500/25' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <Sparkles size={18} className={`mt-0.5 flex-shrink-0 ${activeAlert.threatLevel > 5 ? 'text-red-400' : 'text-emerald-400'}`} />
                    <div className="flex-1 min-w-0">
                      <span className={`font-bold text-xs uppercase tracking-wider ${activeAlert.threatLevel > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                        AI Threat Analysis
                      </span>
                      <p className="text-sm text-white/90 mt-1 leading-relaxed">
                        {activeAlert.description || 'Motion detected. Click below to analyze with AI vision.'}
                      </p>
                    </div>
                  </div>

                  {/* Re-analyze with AI button */}
                  <button
                    onClick={() => handleRunAIAnalysis(activeAlert)}
                    disabled={analyzingId === activeAlert.id}
                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-bold tracking-wider text-white active:scale-95 transition-all disabled:opacity-50"
                  >
                    {analyzingId === activeAlert.id ? (
                      <>
                        <Loader2 size={12} className="animate-spin text-emerald-400" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} className="text-emerald-400" />
                        <span>Run AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                <Eye size={14} /> Gallery & History ({alerts.length})
              </h2>
              {selectedAlert && (
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider"
                >
                  Reset to Latest
                </button>
              )}
            </div>

            {Object.entries(groupedAlerts).map(([dateKey, dateAlerts]) => (
              <div key={dateKey} className="mb-6">
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">{dateKey}</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-[10px] text-white/30 font-mono">{dateAlerts.length} snapshot{dateAlerts.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Alert Cards */}
                <div className="space-y-3">
                  {dateAlerts.map((alert, index) => {
                    const threat = getThreatColor(alert.threatLevel);
                    const isSelected = activeAlert?.id === alert.id;
                    
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        onClick={() => handleSelectAlert(alert)}
                        className={`flex gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] group/card ${
                          isSelected 
                            ? 'bg-white/15 border-emerald-500/60 ring-2 ring-emerald-500/20 shadow-lg' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-black/40 border border-white/10 relative">
                          {alert.imageUrl ? (
                            <img 
                              src={alert.imageUrl} 
                              alt="Alert" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera size={16} className="text-white/20" />
                            </div>
                          )}
                          {isSelected && (
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <Eye size={16} className="text-emerald-300 drop-shadow" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-white/70 font-semibold">{formatTime(alert.timestamp)}</span>
                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${threat.bg} ${threat.text} ${threat.border}`}>
                              {threat.label}
                            </div>
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed line-clamp-2">
                            {alert.description || 'Motion detected.'}
                          </p>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="flex flex-col items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(alert.id); }}
                            className="p-1.5 rounded-full text-white/30 hover:text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[998] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => !deleting && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1a] rounded-3xl border border-white/15 p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <Trash2 size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {deleteConfirm === 'all' ? 'Clear All Alerts?' : 'Delete Alert?'}
                  </h3>
                  <p className="text-xs text-white/50">
                    {deleteConfirm === 'all' 
                      ? `This will permanently delete all ${alerts.length} alerts.` 
                      : 'This alert will be permanently removed.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-white/10 border border-white/15 font-bold text-sm hover:bg-white/15 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirm === 'all' ? handleDeleteAll() : handleDeleteAlert(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500/80 border border-red-400/30 font-bold text-sm hover:bg-red-500 transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
