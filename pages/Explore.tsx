import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Sparkles, Loader2, ArrowRight, DollarSign, HelpCircle, AlertCircle } from 'lucide-react';
import { searchCities, suggestActivities } from '../services/geminiService';
import { getPlaceImage } from '../lib/format';
const Explore: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorType, setErrorType] = useState<string | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    setErrorType(null);
    setResults([]); 

    try {
      const [cities, activities] = await Promise.all([
        searchCities(searchQuery),
        suggestActivities(searchQuery, 'moderate')
      ]);

      const formattedResults = [
        ...cities.map((c: any) => ({ ...c, kind: 'city' })),
        ...activities.map((a: any) => ({ ...a, kind: 'activity' }))
      ];

      setResults(formattedResults);
    } catch (e: any) {
      console.error("Discovery Error:", e);
      if (e.message === "STUDIO_QUOTA_EXCEEDED") {
        setErrorType("QUOTA");
      } else if (e.message === "API_KEY_INVALID") {
        setErrorType("INVALID_KEY");
      } else {
        setErrorType("GENERAL");
      }
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query)}`);
      handleSearch(query);
    }
  };

  return (
    <div className="min-h-screen pb-32 space-y-12 animate-in fade-in duration-700 relative overflow-hidden selection:bg-blue-500/30">
      <header className="px-4 relative z-10 space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
             <div className="h-0.5 w-8 bg-blue-600"></div>
             <span className="text-blue-500 text-[11px] font-black uppercase tracking-[0.5em]">Discovery Studio</span>
          </div>
          <h1 className="text-8xl font-black text-white tracking-tighter leading-none">Global Archive</h1>
          <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.25em] text-[10px]">
            <span>Scan the world's</span>
            <span className="bg-[#4a1d1d]/40 text-[#f87171] px-2 py-0.5 rounded-md">Geospatial Intelligence</span>
            <span>Nodes</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <form onSubmit={onSearchSubmit} className="relative flex-grow group">
            <div className={`flex items-center bg-[#0f172a]/40 backdrop-blur-3xl border rounded-[32px] px-8 py-5 transition-all ${isSearching ? 'border-blue-600 ring-4 ring-blue-600/10' : 'border-white/5 hover:border-white/10 shadow-2xl'}`}>
              <Search className={`w-5 h-5 mr-6 transition-colors ${isSearching ? 'text-blue-500 animate-pulse' : 'text-slate-600'}`} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for cities, sights, or activities..." 
                className="bg-transparent border-none focus:ring-0 text-lg font-bold text-white placeholder:text-slate-800 w-full"
              />
              {isSearching && <Loader2 className="w-5 h-5 text-blue-500 animate-spin ml-4" />}
            </div>
          </form>

          <div className="flex items-stretch gap-3">
             <button className="flex items-center gap-3 px-8 py-5 bg-[#0f172a]/60 border border-white/5 rounded-[20px] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
               <Filter className="w-4 h-4" /> Filter
             </button>
          </div>
        </div>
      </header>

      <section className="px-4 space-y-8 relative z-10">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Results</h2>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-1">{results.length} Nodes Found</span>
        </div>

        <div className="space-y-4">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Syncing with Intelligence Archive...</p>
            </div>
          ) : errorType === "QUOTA" || errorType === "INVALID_KEY" ? (
            <div className="glass border-2 border-red-500/20 bg-red-500/5 rounded-[56px] py-40 text-center space-y-6">
              <div className="w-24 h-24 bg-red-950/20 rounded-[32px] flex items-center justify-center mx-auto border border-red-500/30">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight">
                  {errorType === "QUOTA" ? "Quota Exhausted" : "Invalid Configuration"}
                </h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                  {errorType === "QUOTA" 
                    ? "The current API key has exceeded its limits." 
                    : "The provided API key is invalid or not found."}
                </p>
                <div className="flex flex-col items-center gap-6 mt-10">
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest max-w-xs leading-relaxed">
                    Update your <code className="text-blue-400">GEMINI_API_KEY</code> in the <code className="text-blue-400">.env.local</code> file and restart the development server.
                  </p>
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            results.map((res, i) => (
              <div 
                key={i} 
                className="group glass hover:bg-white/[0.03] p-8 rounded-[40px] border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col md:flex-row md:items-center justify-between gap-10 card-glow animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-10">
                  <div className="relative w-48 h-32 rounded-3xl overflow-hidden shrink-0 shadow-2xl border border-white/5">
                    <img 
                    src={getPlaceImage(res.name, res.country || "")}
                      alt={res.name} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent flex items-end p-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-blue-500" />
                        <span className="text-[8px] font-black uppercase text-slate-300 tracking-widest">{res.kind === 'city' ? res.country : 'Activity'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-4">
                      <h3 className="text-3xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
                        {res.name}
                      </h3>
                      {res.kind === 'activity' && (
                        <span className="bg-blue-600/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-[8px] font-black uppercase tracking-[0.2em]">{res.type}</span>
                      )}
                    </div>
                    <p className="text-slate-500 font-medium text-sm line-clamp-2 leading-relaxed italic">
                      {res.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12 shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-8 md:pt-0 md:pl-12">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest mb-1">Cost Index</span>
                      <div className="flex items-center gap-1 text-white">
                                 <span className="text-xl font-bold text-emerald-500 mr-1">₹</span>
                         <span className="text-2xl font-black tracking-tight">{res.costIndex || res.cost || '??'}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(res.kind === 'city' ? `/create?q=${res.name}` : '/my-trips')}
                    className="bg-white text-slate-950 p-6 rounded-[28px] shadow-2xl hover:scale-110 active:scale-95 transition-all group/btn border-none"
                  >
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] hidden xl:block">
                         {res.kind === 'city' ? 'Launch Expedition' : 'Add to Draft'}
                       </span>
                       <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            ))
          ) : hasSearched && query ? (
            <div className="glass border-2 border-dashed border-slate-800 rounded-[56px] py-40 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-900/50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-800">
                <HelpCircle className="w-12 h-12 text-slate-700" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white tracking-tight">No Archive Found</h3>
                <p className="text-sm text-slate-600 font-bold uppercase tracking-[0.3em] max-w-sm mx-auto leading-relaxed">
                  The current scan yielded no results for "{query}".
                </p>
                <button onClick={() => handleSearch(query)} className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-4 hover:underline">Retry Scan</button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="p-20 glass rounded-[64px] border border-white/5 space-y-10 text-center bg-gradient-to-br from-blue-900/10 to-transparent flex flex-col items-center justify-center">
                  <div className="bg-blue-600 p-8 rounded-[40px] w-fit shadow-[0_20px_60px_rgba(59,130,246,0.4)]">
                     <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-5xl font-black text-white tracking-tighter leading-none">Intelligence<br/>Ready</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] leading-relaxed max-w-[240px]">
                      Access the global geospatial database using Gemini power.
                    </p>
                  </div>
               </div>
               <div className="p-20 glass rounded-[64px] border border-white/5 space-y-8 text-center flex flex-col justify-center">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] mb-4">Discovery Queries</p>
                  <div className="flex flex-col gap-4 max-w-xs mx-auto w-full">
                     {['Kyoto', 'Paris', 'Tokyo Sights'].map((hint, i) => (
                       <button 
                        key={i} 
                        onClick={() => { setQuery(hint); handleSearch(hint); }}
                        className="w-full py-5 px-8 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:text-white text-left flex justify-between items-center group"
                       >
                         {hint} <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                       </button>
                     ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Explore;