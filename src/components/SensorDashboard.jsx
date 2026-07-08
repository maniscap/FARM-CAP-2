import React from 'react';
import { Droplets, ThermometerSun, Wind } from 'lucide-react';

export default function SensorDashboard() {
  const styles = {
    card: {
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderRadius: '24px',
      padding: '25px',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 15px 35px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      color: '#fff',
      width: '100%',
      boxSizing: 'border-box'
    },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    title: { fontSize: '18px', fontWeight: 'bold', letterSpacing: '0.5px' },
    statusBadge: { 
      background: 'rgba(76, 175, 80, 0.15)', 
      color: '#4CAF50', 
      padding: '6px 14px', 
      borderRadius: '20px', 
      fontSize: '12px', 
      fontWeight: 'bold',
      border: '1px solid rgba(76, 175, 80, 0.3)',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' },
    metricBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '15px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' },
    iconWrap: { 
      width: '42px', height: '42px', 
      borderRadius: '50%', 
      background: 'rgba(255,255,255,0.08)', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      marginBottom: '10px',
      border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1)'
    },
    metricValue: { fontSize: '22px', fontWeight: 'bold', marginBottom: '2px' },
    metricLabel: { fontSize: '12px', opacity: 0.6, fontWeight: '500' },
    graphContainer: { height: '70px', width: '100%', position: 'relative' },
    graphLine: {
      fill: 'none',
      stroke: '#4CAF50',
      strokeWidth: '3',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      filter: 'drop-shadow(0px 4px 8px rgba(76, 175, 80, 0.6))',
      animation: 'dash 3s linear infinite'
    },
    graphLineBase: {
      fill: 'none',
      stroke: 'rgba(76, 175, 80, 0.25)',
      strokeWidth: '3',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    }
  };

  return (
    <div style={styles.card}>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
      `}</style>

      <div style={styles.headerRow}>
        <div style={styles.title}>Field Sensors</div>
        <div style={styles.statusBadge}>Optimal Health</div>
      </div>

      <div style={styles.metricsGrid}>
        <div style={styles.metricBox}>
          <div style={styles.iconWrap}><Droplets size={20} color="#38bdf8" /></div>
          <div style={styles.metricValue}>42%</div>
          <div style={styles.metricLabel}>Moisture</div>
        </div>
        <div style={styles.metricBox}>
          <div style={styles.iconWrap}><ThermometerSun size={20} color="#fbbf24" /></div>
          <div style={styles.metricValue}>28°C</div>
          <div style={styles.metricLabel}>Soil Temp</div>
        </div>
        <div style={styles.metricBox}>
          <div style={styles.iconWrap}><Wind size={20} color="#a78bfa" /></div>
          <div style={styles.metricValue}>65%</div>
          <div style={styles.metricLabel}>Humidity</div>
        </div>
      </div>

      {/* Animated Graph Line (Green Glowing) */}
      <div style={styles.graphContainer}>
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          {/* Background Grid Lines */}
          <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" strokeDasharray="2 2" />

          {/* Solid base path for constant visibility */}
          <path 
            d="M0,25 C15,25 20,5 35,10 C45,13 55,30 70,15 C80,5 90,8 100,20" 
            style={styles.graphLineBase}
          />
          {/* Glowing Animated Dash Path */}
          <path 
            d="M0,25 C15,25 20,5 35,10 C45,13 55,30 70,15 C80,5 90,8 100,20" 
            style={styles.graphLine}
            strokeDasharray="15 15"
          />
        </svg>
      </div>

    </div>
  );
}
