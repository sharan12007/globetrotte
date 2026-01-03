
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { formatINR } from '../lib/format';
import { 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Trash2, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { ActivityType } from '../types';

export const CityNode = ({ data }: any) => {
  const { 
    city, 
    country, 
    description = '', // Section-level info
    startDate, 
    endDate, 
    activities = [], 
    dayLabel,
    index,
    onAI, 
    onDelete, 
    onDateChange,
    onDescriptionChange,
    onActivityUpdate,
    onActivityDelete,
    onActivityAdd,
    isViewOnly 
  } = data;
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualActivity, setManualActivity] = useState({
    name: '',
    cost: 0,
    type: ActivityType.SIGHTSEEING,
    description: '',
    duration: '2h'
  });

  const stopBudget = activities?.reduce((acc: number, act: any) => acc + (Number(act.cost) || 0), 0) || 0;

  const handleAddManual = () => {
    if (!manualActivity.name) return;
    onActivityAdd({
      ...manualActivity,
      id: Math.random().toString(36).substr(2, 9)
    });
    setManualActivity({
      name: '',
      cost: 0,
      type: ActivityType.SIGHTSEEING,
      description: '',
      duration: '2h'
    });
    setIsAddingManual(false);
  };

  return (
    <div className="flex flex-col gap-4 relative animate-in fade-in zoom-in-95 duration-500">
      {/* Node Handle Logic */}
      <Handle type="target" position={Position.Left} className="!w-4 !h-4 !bg-blue-500 !-left-2 !border-4 !border-slate-950 z-20" />
      <Handle type="source" position={Position.Right} className="!w-4 !h-4 !bg-blue-500 !-right-2 !border-4 !border-slate-950 z-20" />

      {/* Wireframe Style Section Card */}
      <div className="bg-[#0f172a] rounded-[32px] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden min-w-[380px] max-w-[420px] group transition-all hover:border-blue-500/50">
        
        {/* Section Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1">Section {index + 1}:</span>
              <h3 className="text-white font-black text-2xl leading-none tracking-tighter uppercase">{city}</h3>
           </div>
           {!isViewOnly && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(); }} 
              className="p-2 text-slate-600 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">
          {/* Main Section Info (Wireframe Description Field) */}
          <div className="space-y-2">
            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3 h-3" /> Section Logistics & Information
            </span>
            <textarea 
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter necessary information about this section (hotels, travel logistics, etc)..."
              disabled={isViewOnly}
              className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-[11px] font-medium text-slate-300 placeholder:text-slate-800 focus:border-blue-500/30 outline-none transition-all resize-none min-h-[90px] italic leading-relaxed"
            />
          </div>

          {/* Wireframe footer pills: Date Range & Budget */}
          <div className="grid grid-cols-12 gap-3">
             <div className="col-span-7 bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 flex items-center justify-between">
                <div className="flex flex-col">
                   <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Date Range</span>
                   <div className="flex items-center gap-2">
                      {isViewOnly ? (
                        <span className="text-[10px] font-black text-white">{startDate || '—'}</span>
                      ) : (
                        <input 
                          type="date" 
                          value={startDate || ''} 
                          onChange={(e) => onDateChange('startDate', e.target.value)}
                          className="bg-transparent border-none p-0 text-[10px] font-black text-blue-400 focus:ring-0 cursor-pointer w-20" 
                        />
                      )}
                      <span className="text-slate-800 text-[8px] font-black">to</span>
                      {isViewOnly ? (
                        <span className="text-[10px] font-black text-white">{endDate || '—'}</span>
                      ) : (
                        <input 
                          type="date" 
                          value={endDate || ''} 
                          onChange={(e) => onDateChange('endDate', e.target.value)}
                          className="bg-transparent border-none p-0 text-[10px] font-black text-blue-400 focus:ring-0 cursor-pointer w-20" 
                        />
                      )}
                   </div>
                </div>
             </div>
             
             <div className="col-span-5 bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-3 flex items-center justify-between">
                <div className="flex flex-col w-full">
                   <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">Section Budget</span>
                   <div className="flex items-center justify-between">
                    <span className="text-emerald-500 font-bold mr-1">₹</span>
                    <span className="text-sm font-black text-white">{formatINR(stopBudget)}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Activity Manifest (Expanded list) */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Itinerary manifest</span>
               <span className="text-[8px] font-black text-slate-800 uppercase tracking-widest">{activities.length} entries</span>
            </div>

            {activities.length > 0 && activities.map((act: any) => {
              const isExpanded = expandedId === act.id;
              return (
                <div key={act.id} className="relative">
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : act.id)}
                    className={`flex items-stretch gap-2 cursor-pointer transition-all ${isExpanded ? 'mb-2' : ''}`}
                  >
                    <div className={`flex-grow bg-white/[0.02] border rounded-xl p-3 flex items-center justify-between ${isExpanded ? 'border-blue-500/30' : 'border-white/5'}`}>
                      <p className="text-[10px] font-black text-slate-300 truncate tracking-tight">{act.name}</p>
                      {isExpanded ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-slate-700" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="bg-slate-950/80 border border-white/5 rounded-2xl p-4 mb-3 space-y-3 animate-in fade-in slide-in-from-top-1">
                      <p className="text-[9px] text-slate-500 font-medium italic leading-relaxed">{act.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-white/5">
                        <span className="text-[8px] font-black text-emerald-400">₹{act.cost}</span>
                        {!isViewOnly && (
                          <button onClick={() => onActivityDelete(act.id)} className="text-red-900 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isAddingManual && (
              <div className="bg-slate-950 border border-blue-500/20 rounded-2xl p-4 space-y-3">
                <input 
                  autoFocus
                  value={manualActivity.name}
                  onChange={e => setManualActivity({...manualActivity, name: e.target.value})}
                  placeholder="New Item Name..."
                  className="w-full bg-slate-900 border-none rounded-lg px-3 py-2 text-[10px] font-bold text-white focus:ring-1 focus:ring-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <input 
                    type="number"
                    value={manualActivity.cost}
                    onChange={e => setManualActivity({...manualActivity, cost: Number(e.target.value)})}
                    placeholder="Cost"
                    className="w-20 bg-slate-900 border-none rounded-lg px-3 py-2 text-[10px] font-bold text-emerald-400 outline-none"
                  />
                  <button onClick={handleAddManual} className="flex-grow bg-blue-600 text-white py-2 rounded-lg text-[9px] font-black uppercase">Commit</button>
                  <button onClick={() => setIsAddingManual(false)} className="px-3 bg-slate-800 text-slate-500 rounded-lg"><X className="w-3 h-3"/></button>
                </div>
              </div>
            )}

            {!isViewOnly && !isAddingManual && (
              <div className="flex gap-2 mt-4 pt-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onAI(); }}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 bg-blue-600/10 hover:bg-blue-600 border border-blue-500/20 rounded-xl transition-all group"
                >
                  <Sparkles className="w-3 h-3 text-blue-500 group-hover:text-white" />
                  <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 group-hover:text-white">AI Intel</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsAddingManual(true); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
