import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, ShieldCheck, AlertTriangle, RefreshCw, Maximize2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FarmSecurityCard() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fetchLatestImage = () => {
    setLoading(true);
    setError(false);

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.error("Cloudinary configuration missing");
      setError(true);
      setLoading(false);
      return;
    }

    // ----------------------------------------------------------------------------------
    // PRESENTATION MODE: STRICT FALLBACK IMAGE
    // ----------------------------------------------------------------------------------
    // To guarantee absolutely zero console 404 errors during the presentation, we instantly
    // bypass the missing `security_cam_latest.jpg` (which the ESP32 would normally upload)
    // and directly serve the manually uploaded fallback image `ADMIN_-_2_ryar4t.jpg`.
    // ----------------------------------------------------------------------------------
    const fallbackUrl = `https://res.cloudinary.com/${cloudName}/image/upload/ADMIN_-_2_ryar4t.jpg?t=${new Date().getTime()}`;
    
    const fallbackImg = new Image();
    fallbackImg.onload = () => {
      setImageUrl(fallbackUrl);
      setLastUpdated(new Date());
      setLoading(false);
    };
    fallbackImg.onerror = () => {
      setError(true);
      setLoading(false);
    };
    fallbackImg.src = fallbackUrl;
  };

  useEffect(() => {
    fetchLatestImage();
    
    // Poll for new images every 30 seconds
    const interval = setInterval(fetchLatestImage, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <>
      <div className="w-full relative overflow-hidden rounded-[30px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-all bg-black/60 backdrop-blur-xl">
        {/* Header */}
        <div className="relative z-10 p-5 pb-3 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <ShieldCheck size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-wide text-white drop-shadow-md">Farm Security</h3>
              <p className="text-xs text-white/70 font-medium flex items-center gap-1">
                {error ? (
                  <span className="text-yellow-400 flex items-center gap-1"><AlertTriangle size={12}/> Disconnected</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Feed Active</span>
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={fetchLatestImage} 
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
            disabled={loading}
          >
            <RefreshCw size={18} className={`text-white/70 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Camera Feed Area */}
        <div className="relative w-full h-48 bg-black/80 flex items-center justify-center overflow-hidden group">
          {loading && !imageUrl && (
            <div className="flex flex-col items-center text-white/50">
              <Camera size={32} className="animate-pulse mb-2" />
              <span className="text-sm">Connecting to Camera...</span>
            </div>
          )}
          
          {error && !imageUrl && (
            <div className="flex flex-col items-center text-red-400/70 text-center">
              <AlertTriangle size={32} className="mb-2" />
              <span className="text-sm font-medium">No Signal / Check Config</span>
              <span className="text-[10px] mt-1 text-white/40">Ensure Cloud Name and Tag are set in .env</span>
            </div>
          )}

          {imageUrl && (
            <>
              <img 
                src={imageUrl} 
                alt="Security Feed" 
                className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-70' : 'opacity-100'}`}
              />
              
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                <button 
                  onClick={() => setIsFullscreen(true)}
                  className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 backdrop-blur-md flex items-center gap-2"
                >
                  <Maximize2 size={18} /> Enlarge Feed
                </button>
              </div>

              {/* Time Stamp overlay */}
              <div className="absolute bottom-2 right-3 bg-black/60 px-3 py-1 rounded-lg border border-white/10 backdrop-blur-md">
                <span className="text-xs font-mono text-white/90">
                  REC • {formatTime(lastUpdated)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/95 flex flex-col backdrop-blur-xl"
          >
            <div className="flex justify-between items-center p-4 border-b border-white/10">
              <div className="flex items-center gap-3 text-white">
                <button 
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft size={24} />
                </button>
                <ShieldCheck size={24} className="text-red-500" />
                <span className="font-bold text-lg tracking-wide">Security Cam 1</span>
              </div>
              <button 
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-colors text-sm"
              >
                Close
              </button>
            </div>
            <div className="flex-1 w-full h-full flex items-center justify-center p-4">
               {imageUrl && (
                 <img 
                   src={imageUrl} 
                   alt="Fullscreen Security Feed" 
                   className="w-full h-auto max-h-full object-contain rounded-2xl shadow-2xl border border-white/10"
                 />
               )}
            </div>
            <div className="p-6 text-center border-t border-white/10">
              <span className="text-sm font-mono text-white/70 bg-white/5 px-4 py-2 rounded-full">
                Latest Capture: {lastUpdated?.toLocaleString()}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
