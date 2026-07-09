import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ExternalLink, TrendingUp } from 'lucide-react';

const MARKET_LINKS = [
  { name: "Home Page", url: "https://agmarknet.gov.in/home" },
  { name: "Daily Price and Arrival", isNew: true, url: "https://agmarknet.gov.in/daily-price-and-arrival-report" },
  { name: "All Type of Report (All Grades)", isNew: true, url: "https://agmarknet.gov.in/alltypeofreports" },
  { name: "Commodity-Wise Daily Report", url: "https://agmarknet.gov.in/commoditydailyreportweightedinput" },
  { name: "Market-Wise Daily Report", url: "https://agmarknet.gov.in/marketwisedailyreportinput" },
  { name: "Specific Commodity Market-Wise", url: "https://agmarknet.gov.in/marketwisespecificcommodityinput" },
  { name: "Commodity Prices Last Week", url: "https://agmarknet.gov.in/commoditypricelastweekinput" },
  { name: "Market-Wise Prices Last Week", url: "https://agmarknet.gov.in/marketwisepricelastweekinput" },
  { name: "Transactions Below MSP", url: "https://agmarknet.gov.in/commoditybelowmspinput" },
  { name: "Transactions Above MSP", url: "https://agmarknet.gov.in/commodityabovemspinput" },
];

export default function MarketRates() {
  const navigate = useNavigate();

  return (
    <div 
      className="h-[100dvh] bg-black text-slate-100 font-sans flex flex-col relative overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('/assets/images/weather_defaultFallback.webp')` }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

      {/* Header */}
      <div className="relative z-10 pt-12 px-4 pb-4 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-400" />
            Market Rates
          </h1>
          <p className="text-white/70 mt-1 font-medium text-xs">
            Official data via Agmarknet
          </p>
        </div>
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-4 pb-12 overflow-y-auto z-10 relative no-scrollbar">
        <div className="flex flex-col gap-3">
          {MARKET_LINKS.map((link, idx) => (
            <a 
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-[20px] border border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-[10px] z-0 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
              
              <div className="relative z-10 p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[15px] text-white pr-4">{link.name}</h3>
                  {link.isNew && (
                    <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      New
                    </span>
                  )}
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <ExternalLink size={16} className="text-white/50 group-hover:text-white transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
