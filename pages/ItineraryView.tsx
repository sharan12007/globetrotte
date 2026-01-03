import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactFlow, { Background, Controls, MarkerType, Node, Edge, ReactFlowProvider, BackgroundVariant } from 'reactflow';
import { 
  Calendar, MapPin, Clock, ChevronLeft, Layout, 
  List, PieChart as PieIcon, Sparkles, Map as MapIcon, 
  ArrowRight, GitBranch, Zap, CheckCircle2 
} from 'lucide-react';
import { Trip } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CityNode } from '../components/FlowNodes';
import { getPlaceImage, formatINR } from '../lib/format'; // Ensure both are imported

const nodeTypes = { cityNode: CityNode };

interface ItineraryViewProps {
  trips: Trip[];
}

const ItineraryViewContent: React.FC<ItineraryViewProps> = ({ trips }) => {
  const { id } = useParams();
  const trip = trips.find(t => t.id === id);
  const [viewMode, setViewMode] = useState<'manifest' | 'timeline' | 'map' | 'budget'>('timeline');

  if (!trip) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-4">Expedition Not Found</h2>
        <Link to="/my-trips" className="text-blue-500 font-black uppercase tracking-widest text-xs hover:underline">Back to Archive</Link>
      </div>
    );
  }

  const { nodes, edges } = useMemo(() => {
    const nds: Node[] = trip.stops.map((stop, i) => ({
      id: stop.id,
      type: 'cityNode',
      position: stop.position || { x: i * 450, y: 100 },
      data: { ...stop, isViewOnly: true, index: i },
      draggable: false
    }));

    const eds: Edge[] = [];
    for (let i = 0; i < trip.stops.length - 1; i++) {
      eds.push({
        id: `e${trip.stops[i].id}-${trip.stops[i+1].id}`,
        source: trip.stops[i].id,
        target: trip.stops[i+1].id,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
      });
    }

    return { nodes: nds, edges: eds };
  }, [trip]);

  const activityTypeSummary = trip.stops.flatMap(s => s.activities).reduce((acc: any, act) => {
    acc[act.type] = (acc[act.type] || 0) + act.cost;
    return acc;
  }, {});

  const budgetChartData = Object.entries(activityTypeSummary).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto h-full md:h-[calc(100vh-140px)] flex flex-col overflow-visible md:overflow-hidden">
      {/* High-Tech Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 shrink-0">
        <div className="space-y-3">
          <Link to="/my-trips" className="no-print flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-blue-400 transition-colors uppercase tracking-[0.3em]">
            <ChevronLeft className="w-4 h-4" /> Exit Inspection
          </Link>
          <div className="space-y-1">
            <h1 className="text-6xl font-black text-white leading-none tracking-tighter uppercase">{trip.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 font-bold uppercase tracking-widest text-[9px]">
               <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Calendar className="w-3.5 h-3.5 text-blue-500" /> {trip.startDate} — {trip.endDate}</span>
               <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><MapPin className="w-3.5 h-3.5 text-indigo-500" /> {trip.stops.length} Project Nodes</span>
               <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                 <span className="font-bold text-xs">₹</span> {trip.totalBudget.toLocaleString()}
               </span>
            </div>
          </div>
        </div>
        
        {/* View Mode Switcher */}
        <div className="no-print flex glass p-1.5 rounded-[20px] h-fit border border-white/5">
          <button onClick={() => setViewMode('timeline')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === 'timeline' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <GitBranch className="w-3.5 h-3.5" /> Timeline
          </button>
          <button onClick={() => setViewMode('manifest')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === 'manifest' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <List className="w-3.5 h-3.5" /> Manifest
          </button>
          <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <MapIcon className="w-3.5 h-3.5" /> Studio Map
          </button>
          <button onClick={() => setViewMode('budget')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${viewMode === 'budget' ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>
            <PieIcon className="w-3.5 h-3.5" /> Insights
          </button>
        </div>
      </div>

      <div className="flex-grow px-4 overflow-y-auto min-h-0 custom-scrollbar">
        
        {/* 1. TIMELINE FLOW */}
        {viewMode === 'timeline' && (
          <div className="max-w-4xl mx-auto py-24 relative animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* The Vertical Data Link (Line) */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 hidden md:block">
              <div className="h-full w-[2px] bg-blue-600/10"></div>
              <div className="absolute inset-0 w-[2px]" style={{ backgroundImage: `linear-gradient(to bottom, transparent, #3b82f6 50%, transparent)`, backgroundSize: '100% 200px' }}></div>
              <div className="absolute inset-0 w-[2px]" style={{ backgroundImage: `linear-gradient(to bottom, #020617 40%, transparent 40%)`, backgroundSize: '1px 10px' }}></div>
            </div>
            
            <div className="space-y-32">
              {trip.stops.map((stop, i) => (
                <div key={stop.id} className={`relative flex flex-col md:flex-row items-center gap-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-[#020617] border-[3px] border-blue-600 rounded-full z-10 shadow-[0_0_20px_rgba(59,130,246,1)] hidden md:block">
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
                  </div>
                  
                  <div className={`w-full md:w-1/2 space-y-6 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="space-y-2">
                      <div className={`flex items-center gap-3 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] ${i % 2 === 0 ? 'md:justify-end' : 'md:justify-start'}`}>
                        <Zap className="w-3.5 h-3.5" /> Node {i + 1}
                      </div>
                      <h3 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">{stop.city}</h3>
                      <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{stop.country}</p>
                    </div>

                    <div className="glass p-6 rounded-[32px] border border-white/5 space-y-4 text-left">
                       <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-widest pb-4 border-b border-white/5">
                          <Calendar className="w-4 h-4 text-blue-500" /> {stop.startDate || 'TBD'} <ArrowRight className="w-3 h-3" /> {stop.endDate || 'TBD'}
                       </div>
                       <div className="space-y-3">
                          {stop.activities.slice(0, 3).map(act => (
                            <div key={act.id} className="flex items-center justify-between text-[11px] font-medium text-slate-300">
                               <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-blue-600" /> {act.name}</span>
                               <span className="text-slate-500 font-black">₹{act.cost}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="hidden md:block w-1/2">
                    <div className="w-full h-48 rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative group">
                       {/* FIXED: Uses correct place image */}
                       <img crossOrigin="anonymous" src={getPlaceImage(stop.city, stop.country)} alt={stop.city} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-1000" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. MANIFEST LIST VIEW */}
        {viewMode === 'manifest' && (
          <div className="space-y-12 animate-in fade-in duration-700 pb-20">
             {trip.stops.map((stop, stopIdx) => (
              <div key={stop.id} className="bg-slate-900 rounded-[48px] shadow-2xl border border-white/5 overflow-hidden max-w-4xl mx-auto">
                <div className="relative h-64 overflow-hidden">
                  <img crossOrigin="anonymous" src={getPlaceImage(stop.city, stop.country)} alt={stop.city} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-12 flex flex-col justify-end">
                    <div className="flex items-center gap-4 mb-3">
                      <p className="text-white/40 text-[10px] font-black tracking-[0.4em] uppercase">Destination {stopIdx + 1}</p>
                      <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 text-[9px] font-black uppercase tracking-widest">
                        <Calendar className="w-3 h-3" /> {stop.startDate || '?'} <ArrowRight className="w-2 h-2" /> {stop.endDate || '?'}
                      </div>
                    </div>
                    <h2 className="text-5xl font-black text-white uppercase tracking-tighter leading-none">{stop.city}, {stop.country}</h2>
                  </div>
                </div>
                <div className="p-12 space-y-6">
                  {stop.activities.length > 0 ? stop.activities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/10">
                      <div className="flex items-center gap-6">
                        <div className="bg-slate-800 p-3 rounded-2xl border border-white/5"><Clock className="w-6 h-6 text-blue-500" /></div>
                        <div>
                          <p className="font-black text-slate-100 text-lg tracking-tight">{act.name}</p>
                          <p className="text-sm text-slate-500 font-medium">{act.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-white text-xl">₹{act.cost}</span>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{act.type}</p>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-slate-600 font-black italic border-2 border-dashed border-white/5 rounded-3xl uppercase tracking-widest text-xs">No specific activities listed</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. STUDIO MAP VIEW */}
        {viewMode === 'map' && (
          <div className="bg-slate-950 rounded-[40px] border border-white/5 shadow-2xl h-full overflow-hidden relative min-h-[500px] studio-canvas">
            <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
              <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={32} size={1} />
              <Controls className="!bg-[#0f172a] !border-slate-800" />
            </ReactFlow>
          </div>
        )}

        {/* 4. BUDGET INSIGHTS */}
        {viewMode === 'budget' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="bg-slate-900 p-10 rounded-[48px] shadow-2xl border border-white/5 h-fit">
              <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                <div className="bg-blue-600 p-2 rounded-xl"><PieIcon className="w-5 h-5 text-white" /></div> 
                Resource Distribution
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={budgetChartData} cx="50%" cy="50%" innerRadius={100} outerRadius={150} paddingAngle={8} dataKey="value" stroke="none">
                      {budgetChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white p-12 rounded-[48px] shadow-2xl h-fit relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full"></div>
              <h3 className="text-[10px] font-black text-white/40 mb-2 uppercase tracking-[0.5em]">Consolidated Budget</h3>
              <p className="text-7xl font-black text-white tracking-tighter leading-none mb-12">₹{trip.totalBudget.toLocaleString()}</p>
              <div className="p-8 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-md">
                <h4 className="font-black mb-4 flex items-center gap-3 text-blue-400 tracking-widest uppercase text-xs">
                  <Sparkles className="w-4 h-4" /> Studio Intelligence
                </h4>
                <p className="text-base font-medium leading-relaxed text-slate-300 italic">
                  "This itinerary exhibits an optimal geospatial distribution across {trip.stops.length} mission nodes."
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ItineraryView: React.FC<ItineraryViewProps> = (props) => (
  <ReactFlowProvider>
    <ItineraryViewContent {...props} />
  </ReactFlowProvider>
);

export default ItineraryView;