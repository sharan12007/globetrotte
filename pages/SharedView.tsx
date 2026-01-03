
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, MapPin, Calendar, Clock, ChevronLeft } from 'lucide-react';
import { Trip } from '../types';
import { getPlaceImage } from '../lib/format';
interface SharedViewProps {
  trips: Trip[];
}

const SharedView: React.FC<SharedViewProps> = ({ trips }) => {
  const { id } = useParams();
  // Fix: Initialize useNavigate to handle programmatic navigation
  const navigate = useNavigate();
  
  // Define mock data here as well to ensure it's findable for inspection
  const mockCommunityTrips: Trip[] = [
    {
      id: 'mock-1',
      userId: 'system-intel',
      name: 'Neo-Tokyo Circuit',
      description: 'A futuristic dive into the neon-lit districts and tech hubs of Japan.',
      startDate: '2024-10-12',
      endDate: '2024-10-22',
      totalBudget: 4200,
      status: 'completed',
      isPublic: true,
      stops: [
        // Added missing 'description' property to TripStop
        { id: 'ms1', city: 'Tokyo', country: 'Japan', description: 'Metropolitan hub and tech center.', activities: [], budget: 1500, startDate: '2024-10-12', endDate: '2024-10-15' },
        // Added missing 'description' property to TripStop
        { id: 'ms2', city: 'Osaka', country: 'Japan', description: 'The culinary capital of the country.', activities: [], budget: 1200, startDate: '2024-10-16', endDate: '2024-10-20' }
      ]
    },
    {
      id: 'mock-2',
      userId: 'system-intel',
      name: 'European Art Corridor',
      description: 'Connecting the most influential galleries and architecture of the EU.',
      startDate: '2025-05-15',
      endDate: '2025-06-05',
      totalBudget: 8500,
      status: 'planning',
      isPublic: true,
      stops: [
        // Added missing 'description' property to TripStop
        { id: 'ms3', city: 'Paris', country: 'France', description: 'Artistic immersion in the city center.', activities: [], budget: 2500, startDate: '2025-05-15', endDate: '2025-05-20' },
        // Added missing 'description' property to TripStop
        { id: 'ms4', city: 'Berlin', country: 'Germany', description: 'Modern and historical architecture tour.', activities: [], budget: 1800, startDate: '2025-05-21', endDate: '2025-05-25' }
      ]
    }
  ];

  const trip = [...trips, ...mockCommunityTrips].find(t => t.id === id);

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center border border-white/5">
          <Globe className="w-10 h-10 text-slate-700" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Link Expired</h2>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">The requested geospatial blueprint is no longer available.</p>
        <Link to="/community" className="text-blue-500 font-black uppercase tracking-[0.3em] text-[10px] hover:underline">Return to Hub</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 space-y-20 animate-in fade-in duration-1000">
      
      <div className="space-y-10">
        <Link to="/community" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Exit Inspection
        </Link>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600/10 text-blue-400 px-4 py-1 rounded-full border border-blue-500/20 text-[10px] font-black uppercase tracking-[0.3em]">
              Public Blueprint
            </div>
            {trip.userId === 'system-intel' && (
              <div className="bg-indigo-600/10 text-indigo-400 px-4 py-1 rounded-full border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.3em]">
                System Intel
              </div>
            )}
          </div>
          <h1 className="text-8xl font-black text-white tracking-tighter leading-[0.9]">{trip.name}</h1>
          <p className="text-slate-500 text-xl font-medium max-w-3xl italic leading-relaxed">
            {trip.description || 'A meticulously designed journey through global nodes.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-12 py-10 border-y border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Scale</p>
            <p className="text-2xl font-black text-white uppercase tracking-tighter">{trip.stops.length} Project Nodes</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Fiscal Index</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tighter">${trip.totalBudget.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Architect</p>
            <p className="text-2xl font-black text-blue-500 tracking-tighter">{trip.userId === 'system-intel' ? 'Studio AI' : 'Community Member'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-10">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] mb-4">Itinerary Manifest</h3>
          <div className="space-y-6">
            {trip.stops.map((stop, i) => (
              <div key={stop.id} className="glass p-8 rounded-[40px] border border-white/5 flex gap-10 items-center">
                <div className="w-40 h-28 rounded-3xl overflow-hidden shrink-0 border border-white/5 bg-slate-900">
                  <img src={getPlaceImage(stop.city, stop.country)}
 alt={stop.city} className="w-full h-full object-cover opacity-60" />
                </div>
                <div className="flex-grow space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-blue-500 text-[10px] font-black tracking-widest uppercase">Node {i+1}</span>
                    <div className="h-px flex-grow bg-white/5"></div>
                  </div>
                  <h4 className="text-3xl font-black text-white uppercase tracking-tighter">{stop.city}</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{stop.country}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-black text-lg">${stop.budget}</p>
                  <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Local Budget</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 sticky top-32">
          <div className="bg-blue-600 p-12 rounded-[56px] text-white space-y-8 shadow-[0_40px_100px_rgba(59,130,246,0.3)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
             <div className="space-y-4 relative z-10">
               <h3 className="text-3xl font-black tracking-tight uppercase leading-none">Execute this blueprint?</h3>
               <p className="text-blue-100 text-sm font-medium leading-relaxed">
                 You can clone this entire geospatial structure into your personal studio archive with one click.
               </p>
             </div>
             <button 
               onClick={() => {
                 // Trigger clone from here or redirect back to hub with selection
                 navigate('/community');
               }}
               className="w-full bg-white text-blue-600 py-6 rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               Go to Hub to Clone <ArrowRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedView;
