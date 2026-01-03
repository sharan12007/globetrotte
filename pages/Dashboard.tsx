
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatINR } from '../lib/format';
import { getPlaceImage } from '../lib/format';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  MapPin, 
  Calendar, 
  LayoutGrid, 
  ArrowUpRight,
  Map as MapIcon,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Trip, User } from '../types';

interface DashboardProps {
  trips: Trip[];
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ trips, user }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const upcomingTrips = trips.filter(t => t.status === 'upcoming' || t.status === 'planning');

// Inside Dashboard.tsx
const regions = [
  { 
    name: 'Kyoto', 
    country: 'Japan', 
    img: getPlaceImage('Kyoto', 'Japan'), 
    tag: 'Cultural' 
  },
  { 
    name: 'Santorini', 
    country: 'Greece', 
    img: getPlaceImage('Santorini', 'Greece'), 
    tag: 'Romance' 
  },
  { 
    name: 'Swiss Alps', 
    country: 'Switzerland', 
    img: getPlaceImage('Swiss Alps', 'mountains'), 
    tag: 'Adventure' 
  },
  { 
    name: 'Bali', 
    country: 'Indonesia', 
    img: getPlaceImage('Bali', 'temple'), 
    tag: 'Relaxation' 
  },
  { 
    name: 'Lisbon', 
    country: 'Portugal', 
    img: getPlaceImage('Lisbon', 'Portugal'), 
    tag: 'Architecture' 
  },
];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="space-y-16 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. Cinematic Hero Banner */}
      <section className="relative h-[520px] rounded-[48px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] group border border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop" 
          alt="Adventure" 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80"
        />
        <div className="absolute inset-0 hero-gradient"></div>
        <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
        
        <div className="absolute inset-0 p-16 flex flex-col justify-end items-start max-w-4xl space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-0.5 w-12 bg-blue-500"></div>
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em]">Global Expeditions</span>
            </div>
            <h1 className="text-7xl font-black text-white leading-[1] tracking-tighter">
              The world is <br/> your studio.
            </h1>
          </div>
          
          <form onSubmit={handleQuickSearch} className="flex items-center gap-4 w-full max-w-xl">
            <div className="flex-grow glass-dark rounded-[24px] flex items-center px-6 py-5 focus-within:ring-2 ring-blue-500/50 transition-all border border-white/10">
              <Search className="w-5 h-5 text-slate-500 mr-4" />
              <input 
                type="text" 
                placeholder="Search expeditions or destinations..." 
                className="bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 font-semibold w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="hidden">Search</button>
            </div>
          </form>
        </div>

        <div className="absolute top-12 right-12">
          <div className="glass-dark px-6 py-3 rounded-full flex items-center gap-3 border border-white/10">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
            <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">AI Engine Active</span>
          </div>
        </div>
      </section>

      {/* 2. Filter Strip */}
      <section className="flex flex-wrap items-center justify-between gap-6 px-4">
        <div className="flex items-center gap-3">
           <button onClick={() => navigate('/explore')} className="flex items-center gap-2 px-6 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
             <LayoutGrid className="w-3.5 h-3.5" /> Discovery Hub
           </button>
           <button className="flex items-center gap-2 px-6 py-3.5 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white">
             <Filter className="w-3.5 h-3.5" /> Quick Filter
           </button>
        </div>
        
        <div className="flex items-center gap-6 glass-bright px-8 py-3.5 rounded-2xl border border-white/5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sequence</span>
          <select className="bg-transparent border-none text-[11px] font-black text-slate-200 uppercase tracking-widest focus:ring-0 cursor-pointer">
            <option className="bg-[#020617]">Recent activity</option>
            <option className="bg-[#020617]">Upcoming launch</option>
            <option className="bg-[#020617]">Budget index</option>
          </select>
        </div>
      </section>

      {/* 3. Top Regional Selections */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tighter">Regional Archive</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Trending globally</p>
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-1 bg-blue-600 rounded-full"></div>
            <div className="w-4 h-1 bg-slate-800 rounded-full"></div>
            <div className="w-4 h-1 bg-slate-800 rounded-full"></div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-8 pb-8 px-4 custom-scrollbar">
          {regions.map((region) => (
            <div key={region.name} className="min-w-[320px] h-[400px] relative rounded-[40px] overflow-hidden shadow-2xl group cursor-pointer shrink-0 border border-white/5">
              <img src={region.img} alt={region.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-10 flex flex-col justify-end">
                <div className="bg-blue-600/20 backdrop-blur-md border border-blue-500/30 w-fit px-3 py-1 rounded-full mb-4">
                  <span className="text-blue-400 text-[8px] font-black uppercase tracking-widest">{region.tag}</span>
                </div>
                <h3 className="text-3xl font-black text-white mb-1 tracking-tight">{region.name}</h3>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{region.country}</p>
                
                <div onClick={() => navigate(`/explore?q=${region.name}`)} className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Build Plan</span>
                  <div className="bg-white text-slate-950 p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Previous Trips / My Expeditions */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-4 border-t border-slate-800/50 pt-16">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-white tracking-tighter">Personal Expeditions</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">Your active project history</p>
          </div>
          <Link to="/my-trips" className="flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] hover:text-white transition-colors group">
            Archive Explorer <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {upcomingTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4">
            {upcomingTrips.slice(0, 3).map(trip => (
              <Link 
                key={trip.id} 
                to={`/view/${trip.id}`} 
                className="group glass p-6 rounded-[48px] border border-white/5 hover:border-blue-500/30 transition-all duration-500 card-glow"
              >
                <div className="relative h-60 rounded-[32px] overflow-hidden mb-8">
                  <img
                  src={trip.coverImage || getPlaceImage(trip.stops[0]?.city || "travel", trip.stops[0]?.country)}
                    alt={trip.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80" 
                  />
                  <div className="absolute top-5 left-5">
                    <div className="glass-dark px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${trip.status === 'planning' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'}`}></div>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{trip.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="px-2 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">{trip.name}</h3>
                    <div className="flex items-center gap-5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-blue-600" /> {new Date(trip.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-2"><MapIcon className="w-3.5 h-3.5 text-indigo-600" /> {trip.stops.length} Locations</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <div className="flex -space-x-3">
                      {trip.stops.slice(0, 4).map((stop, i) => (
                        <div key={i} className="w-9 h-9 rounded-full border-[3px] border-slate-900 bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400">
                          {stop.city[0]}
                        </div>
                      ))}
                      {trip.stops.length > 4 && (
                        <div className="w-9 h-9 rounded-full border-[3px] border-slate-900 bg-blue-600 flex items-center justify-center text-[9px] font-black text-white">
                          +{trip.stops.length - 4}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Budget index</p>
                      <p className="text-base font-black text-white">₹{formatINR(trip.totalBudget)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mx-4 glass border-2 border-dashed border-slate-800 rounded-[56px] py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-900/50 rounded-[28px] flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <MapIcon className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">Project space ready</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] max-w-xs mx-auto">No expeditions found in your personal archive.</p>
          </div>
        )}
      </section>

      {/* 5. Professional Floating Action Button */}
      <div className="fixed bottom-12 right-12 z-50 group">
        <Link to="/create" className="flex items-center gap-4 bg-white text-slate-950 pl-8 pr-10 py-6 rounded-[32px] shadow-[0_30px_60px_rgba(255,255,255,0.1)] transition-all duration-500 transform group-hover:-translate-y-3 active:scale-95 border-none">
          <div className="bg-slate-950 p-2.5 rounded-2xl transition-all group-hover:rotate-90">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Draft Expedition</span>
        </Link>
      </div>

      {/* Intelligence Insight (Dark Professional) */}
      <section className="px-4">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[56px] p-16 text-white relative overflow-hidden shadow-[0_50px_100px_rgba(59,130,246,0.2)]">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] -ml-32 -mb-32"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-20">
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                   <Zap className="w-6 h-6 text-blue-200" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-200">System Analytics</span>
              </div>
              <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">Designing the <br/> future of travel.</h2>
              <p className="text-blue-100/70 text-lg font-medium leading-relaxed max-w-md">
                GlobeTrotter Studio processes millions of route permutations to find the optimal path for your unique travel style.
              </p>
              <Link to="/analytics" className="inline-flex items-center gap-4 bg-white text-slate-900 px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-transform shadow-2xl">
                Global Explorer Stats <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="hidden lg:grid grid-cols-2 gap-8">
              {[
                { label: 'Studio Projects', val: upcomingTrips.length, color: 'text-white' },
                { label: 'Data Points', val: trips.reduce((acc, t) => acc + t.stops.length, 0) * 124, color: 'text-blue-300' },
                { label: 'Daily Average', val: '8.4h', color: 'text-blue-200' },
                { label: 'Rank Index', val: 'Architect', color: 'text-white' },
              ].map((stat, i) => (
                <div key={i} className="p-10 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10 space-y-2 hover:bg-white/10 transition-colors cursor-default">
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
