import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Newspaper, ExternalLink, RefreshCw } from 'lucide-react';

const FARMING_CATEGORIES = [
  { id: 'agriculture', name: 'Agriculture', query: 'agriculture OR farming OR crops OR farmers' },
  { id: 'market', name: 'Market Rates', query: 'agriculture prices OR market rates OR mandi' },
  { id: 'weather', name: 'Weather', query: 'weather forecast India OR monsoon farming' },
  { id: 'schemes', name: 'Schemes', query: 'PM-KISAN OR subsidy OR government scheme farmers' },
  { id: 'equipment', name: 'Agri-Tech', query: 'agricultural equipment OR agri-tech OR drones' },
];

export default function NewsUpdates() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(FARMING_CATEGORIES[0]);

  useEffect(() => {
    fetchNews(activeCategory.query);
  }, [activeCategory]);

  const fetchNews = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
      if (!apiKey) throw new Error("API Key missing");

      const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(searchQuery)}&country=in&lang=en&max=10&apikey=${apiKey}`;
      const response = await axios.get(url);
      
      setArticles(response.data.articles || []);
    } catch (err) {
      console.error("News API Error:", err);
      setError("Failed to load news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
  };

  return (
    <div 
      className="min-h-screen bg-black text-slate-100 font-sans flex flex-col relative overflow-hidden bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `url('/assets/images/weather_defaultFallback.webp')` }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0"></div>

      {/* Header */}
      <div className="relative z-10 pt-12 px-4 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 active:scale-95 transition-transform"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md flex items-center gap-2">
              <Newspaper size={24} className="text-green-400" />
              Agri News
            </h1>
          </div>
        </div>
        <button onClick={() => fetchNews(activeCategory.query)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
          <RefreshCw size={20} className="text-white/70" />
        </button>
      </div>

      {/* Category Scroller */}
      <div className="relative z-10 px-4 pb-4">
        <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">
          {FARMING_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeCategory.id === cat.id 
                  ? 'bg-green-500/20 text-green-300 border-green-500/40'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 w-full max-w-md mx-auto px-4 pb-12 overflow-y-auto z-10 relative no-scrollbar">
        
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-[20px] bg-white/10 animate-pulse border border-white/5"></div>
            ))}
          </div>
        ) : error ? (
          <div className="p-6 text-center text-white/60 bg-white/5 rounded-2xl border border-white/10">
            <p>{error}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-6 text-center text-white/60 bg-white/5 rounded-2xl border border-white/10">
            <p>No news found for this category.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {articles.map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative overflow-hidden rounded-[24px] border border-white/10 shadow-lg cursor-pointer transition-transform hover:scale-[1.01] flex flex-col"
              >
                <div className="absolute inset-0 bg-white/5 backdrop-blur-[15px] z-0 pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                
                {/* Image */}
                {article.image && (
                  <div className="relative w-full h-40 z-10">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-4 z-20 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-white/20 text-white backdrop-blur-md">
                        {article.source.name}
                      </span>
                      <span className="text-[10px] text-white/80 font-medium">
                        {timeAgo(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="relative z-10 p-4 pt-3 flex flex-col gap-2">
                  <h3 className="font-bold text-[15px] leading-snug text-white line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-2 font-medium leading-relaxed">
                    {article.description}
                  </p>
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] font-bold text-green-400 flex items-center gap-1 group-hover:text-green-300 transition-colors">
                      READ FULL <ExternalLink size={12} />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
