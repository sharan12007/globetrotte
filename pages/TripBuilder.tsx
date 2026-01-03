import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ReactFlow, { 
  Background, 
  Controls, 
  addEdge, 
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  MarkerType,
  ReactFlowProvider,
  BackgroundVariant,
  XYPosition
} from 'reactflow';
import { Save, Plus, Search, ChevronLeft, Loader2, Link2, Link2Off, MapPin, Globe, Lock, AlignLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Trip, TripStop, Activity, ActivityType, User } from '../types';
import { searchCities, suggestActivities } from '../services/geminiService';
import { CityNode } from '../components/FlowNodes';

const nodeTypes = { cityNode: CityNode };

interface TripBuilderProps {
  user: User;
  trips?: Trip[];
  onSave: (trip: Trip) => void;
}

const TripBuilderContent: React.FC<TripBuilderProps> = ({ user, trips = [], onSave }) => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const initialLoadRef = useRef(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [autoConnect, setAutoConnect] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const getDayForIndex = useCallback((index: number) => {
    if (!startDate) return `Section ${index + 1}`;
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    return `Day ${index + 1}`;
  }, [startDate]);

  const handleDeleteNode = useCallback((stopId: string) => {
    setNodes(nds => nds.filter(n => n.id !== stopId));
    setEdges(eds => eds.filter(e => e.source !== stopId && e.target !== stopId));
  }, [setNodes, setEdges]);

  const handleStopUpdate = useCallback((stopId: string, field: string, value: any) => {
    setNodes(nds => nds.map(node => {
      if (node.id === stopId) {
        return {
          ...node,
          data: {
            ...node.data,
            [field]: value
          }
        };
      }
      return node;
    }));
  }, [setNodes]);

  const handleActivityUpdate = useCallback((stopId: string, updatedActivity: Activity) => {
    setNodes(nds => nds.map(n => {
      if (n.id === stopId) {
        return {
          ...n,
          data: {
            ...n.data,
            activities: (n.data.activities || []).map((a: Activity) => a.id === updatedActivity.id ? updatedActivity : a)
          }
        };
      }
      return n;
    }));
  }, [setNodes]);

  const handleActivityDelete = useCallback((stopId: string, activityId: string) => {
    setNodes(nds => nds.map(n => {
      if (n.id === stopId) {
        return {
          ...n,
          data: {
            ...n.data,
            activities: (n.data.activities || []).filter((a: Activity) => a.id !== activityId)
          }
        };
      }
      return n;
    }));
  }, [setNodes]);

  const handleActivityAdd = useCallback((stopId: string, newActivity: Activity) => {
    setNodes(nds => nds.map(n => {
      if (n.id === stopId) {
        return {
          ...n,
          data: {
            ...n.data,
            activities: [...(n.data.activities || []), newActivity]
          }
        };
      }
      return n;
    }));
  }, [setNodes]);

  const handleActivityAI = useCallback(async (stopId: string, city: string) => {
    try {
      const aiActivities = await suggestActivities(city, 'moderate');
      const newActivities: Activity[] = aiActivities.map((a: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: a.name,
        type: a.type as ActivityType,
        description: a.description,
        cost: Number(a.cost) || 0,
        duration: a.duration
      }));

      setNodes(nds => nds.map(n => {
        if (n.id === stopId) {
          return { 
            ...n, 
            data: { 
              ...n.data, 
              activities: [...(n.data.activities || []), ...newActivities] 
            } 
          };
        }
        return n;
      }));
    } catch (e: any) { 
      console.error("AI Suggestion Error:", e);
      if (e.message === "STUDIO_QUOTA_EXCEEDED") {
        alert("AI Engine is currently at capacity. Please try again in 60s or add activities manually.");
      } else {
        alert("Unable to sync with AI Archive. Please check your connection.");
      }
    }
  }, [setNodes]);

  const createNodeData = useCallback((stop: any, index: number) => ({
    ...stop,
    index,
    dayLabel: getDayForIndex(index),
    onAI: () => handleActivityAI(stop.id, stop.city),
    onDelete: () => handleDeleteNode(stop.id),
    onDateChange: (field: 'startDate' | 'endDate', value: string) => handleStopUpdate(stop.id, field, value),
    onDescriptionChange: (value: string) => handleStopUpdate(stop.id, 'description', value),
    onActivityUpdate: (activity: Activity) => handleActivityUpdate(stop.id, activity),
    onActivityDelete: (activityId: string) => handleActivityDelete(stop.id, activityId),
    onActivityAdd: (activity: Activity) => handleActivityAdd(stop.id, activity)
  }), [handleActivityAI, handleDeleteNode, handleStopUpdate, handleActivityUpdate, handleActivityDelete, handleActivityAdd, getDayForIndex]);

  const onNodeDragStop = useCallback(() => {
    setNodes((nds) => {
      const sortedNodes = [...nds].sort((a, b) => a.position.x - b.position.x);
      const updatedNodes = sortedNodes.map((node, idx) => ({
        ...node,
        data: {
          ...node.data,
          index: idx,
          dayLabel: getDayForIndex(idx)
        }
      }));

      if (autoConnect) {
        const newEdges: Edge[] = [];
        for (let i = 0; i < updatedNodes.length - 1; i++) {
          newEdges.push({
            id: `e${updatedNodes[i].id}-${updatedNodes[i + 1].id}`,
            source: updatedNodes[i].id,
            target: updatedNodes[i + 1].id,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
          });
        }
        setEdges(newEdges);
      }
      return updatedNodes;
    });
  }, [setNodes, setEdges, autoConnect, getDayForIndex]);

  const addCityToFlow = useCallback((cityInfo: any) => {
    const stopId = Math.random().toString(36).substr(2, 9);
    setNodes((nds) => {
      const sorted = [...nds].sort((a, b) => a.position.x - b.position.x);
      const lastNode = sorted.length > 0 ? sorted[sorted.length - 1] : null;
      const position = lastNode 
        ? { x: lastNode.position.x + 450, y: lastNode.position.y } 
        : { x: 100, y: 150 };

      const newNode: Node = {
        id: stopId,
        type: 'cityNode',
        position,
        data: createNodeData({
          id: stopId,
          city: cityInfo.name,
          country: cityInfo.country,
          description: '',
          activities: [],
          budget: 0,
          startDate: '',
          endDate: ''
        }, sorted.length)
      };

      const finalNodes = [...nds, newNode].sort((a, b) => a.position.x - b.position.x);
      
      if (autoConnect) {
        const newEdges: Edge[] = [];
        for (let i = 0; i < finalNodes.length - 1; i++) {
          newEdges.push({
            id: `e${finalNodes[i].id}-${finalNodes[i + 1].id}`,
            source: finalNodes[i].id,
            target: finalNodes[i + 1].id,
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' }
          });
        }
        setEdges(newEdges);
      }

      return finalNodes.map((n, i) => ({
        ...n,
        data: { ...n.data, index: i, dayLabel: getDayForIndex(i) }
      }));
    });
    setSearchResults([]);
    setSearchQuery('');
  }, [createNodeData, setNodes, setEdges, autoConnect, getDayForIndex]);

  /**
   * Logic to handle Loading an Existing Trip (Editing)
   */
  useEffect(() => {
    if (isEditing && trips.length > 0 && !initialLoadRef.current) {
      const trip = trips.find(t => t.id === id);
      if (trip) {
        initialLoadRef.current = true;
        setName(trip.name);
        setDescription(trip.description || '');
        setStartDate(trip.startDate || '');
        setEndDate(trip.endDate || '');
        setIsPublic(trip.isPublic || false);
        
        const initialNodes: Node[] = (trip.stops || []).map((stop, i) => ({
          id: stop.id,
          type: 'cityNode',
          position: stop.position || { x: 100 + (i * 450), y: 150 },
          data: createNodeData(stop, i)
        }));

        const initialEdges: Edge[] = [];
        for (let i = 0; i < initialNodes.length - 1; i++) {
          initialEdges.push({
            id: `e${initialNodes[i].id}-${initialNodes[i+1].id}`,
            source: initialNodes[i].id,
            target: initialNodes[i+1].id,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
            animated: true
          });
        }

        setNodes(initialNodes);
        setEdges(initialEdges);
      }
    }
  }, [id, isEditing, trips, createNodeData, setNodes, setEdges]);

  /**
   * Logic to handle "Launch Expedition" from the Explore page (Auto-Add Node)
   */
  useEffect(() => {
    const queryParam = searchParams.get('q');
    
    // If there is a query, we aren't editing a trip, and we haven't processed this load yet
    if (queryParam && !isEditing && !initialLoadRef.current) {
      initialLoadRef.current = true;
      setName(`Expedition to ${queryParam}`);
      
      const autoInitialize = async () => {
        setIsSearching(true);
        try {
          const results = await searchCities(queryParam);
          if (results && results.length > 0) {
            // Find the exact match or take the first AI suggestion
            const match = results.find(r => r.name.toLowerCase() === queryParam.toLowerCase()) || results[0];
            addCityToFlow(match);
          }
        } catch (err) {
          console.error("Auto-initialization failed:", err);
        } finally {
          setIsSearching(false);
          // Remove the query param from URL so refresh doesn't duplicate nodes
          setSearchParams({});
        }
      };

      autoInitialize();
    }
  }, [searchParams, isEditing, addCityToFlow, setSearchParams]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } }, eds)), [setEdges]);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchCities(searchQuery);
      setSearchResults(results);
    } catch (e: any) { 
      console.error("Search Error:", e);
      if (e.message === "STUDIO_QUOTA_EXCEEDED") {
        alert("Search engine is at capacity. Please wait 60s.");
      }
    } finally { 
      setIsSearching(false); 
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Project requires a name.');
      return;
    }

    setIsSaving(true);
    try {
      const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
      const stops: TripStop[] = sortedNodes.map(node => {
        const { onAI, onDelete, onDateChange, onDescriptionChange, onActivityUpdate, onActivityDelete, onActivityAdd, ...serializableData } = node.data;
        return {
          ...serializableData,
          id: node.id,
          position: node.position,
        } as TripStop;
      });

      if (stops.length === 0) {
        alert('Add at least one section to your expedition.');
        setIsSaving(false);
        return;
      }

      let finalStart = startDate;
      let finalEnd = endDate;
      
      if (!finalStart || !finalEnd) {
        const stopDates = stops.flatMap(s => [s.startDate, s.endDate]).filter(Boolean).sort();
        if (stopDates.length > 0) {
          finalStart = finalStart || stopDates[0];
          finalEnd = finalEnd || stopDates[stopDates.length - 1];
        }
      }

      const trip: Trip = {
        id: isEditing ? id! : Math.random().toString(36).substr(2, 9),
        userId: user.id,
        name: name.trim(),
        description: description || 'Studio Expedition Plan',
        startDate: finalStart || new Date().toISOString().split('T')[0],
        endDate: finalEnd || new Date().toISOString().split('T')[0],
        stops,
        totalBudget: stops.reduce((acc, s) => acc + (s.activities?.reduce((sub, act) => sub + (Number(act.cost) || 0), 0) || 0), 0),
        status: isEditing ? (trips?.find(t => t.id === id)?.status || 'planning') : 'planning',
        isPublic
      };

      onSave(trip);
      navigate('/my-trips');
    } catch (e) {
      console.error("Save Error:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] animate-in fade-in duration-700 overflow-hidden glass rounded-[48px] border border-white/5">
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-10 py-6 z-20 flex flex-col gap-6 shrink-0 transition-all duration-500">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate('/my-trips')} className="p-3.5 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 text-slate-500">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col gap-1 max-w-xl">
              <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Expedition Project Name..." 
                className="text-2xl font-black bg-transparent border-none focus:ring-0 p-0 text-white placeholder:text-slate-800" 
              />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Global Start</span>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)}
                    className="bg-transparent border-none p-0 text-[10px] font-bold text-blue-500 focus:ring-0 cursor-pointer" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Global End</span>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    className="bg-transparent border-none p-0 text-[10px] font-bold text-indigo-500 focus:ring-0 cursor-pointer" 
                  />
                </div>
                <button 
                  onClick={() => setShowBrief(!showBrief)}
                  className={`flex items-center gap-2 transition-colors ${showBrief ? 'text-blue-400' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  <AlignLeft className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Expedition Brief</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsPublic(!isPublic)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all ${isPublic ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-white/5 text-slate-500'}`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span className="text-[9px] font-black uppercase tracking-widest">{isPublic ? 'Public Hub' : 'Private'}</span>
            </button>

            <button 
              onClick={() => setAutoConnect(!autoConnect)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all ${autoConnect ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-slate-900 border-white/5 text-slate-500'}`}
            >
              {autoConnect ? <Link2 className="w-4 h-4" /> : <Link2Off className="w-4 h-4" />}
              <span className="text-[9px] font-black uppercase tracking-widest">{autoConnect ? 'Auto-Link' : 'Manual'}</span>
            </button>

            <div className="relative">
              <div className={`flex items-center glass-dark border rounded-2xl px-6 py-3 transition-all ${isSearching ? 'border-blue-500' : 'border-white/10'}`}>
                <Search className="w-4 h-4 mr-4 text-slate-600" />
                <input 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Add another Section..." 
                  className="bg-transparent border-none focus:ring-0 text-xs font-black uppercase text-white placeholder:text-slate-700 w-44" 
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-4 right-0 w-80 bg-slate-950 border border-white/10 rounded-[24px] shadow-2xl p-2 z-[60]">
                  {searchResults.map((res, i) => (
                    <button key={i} onClick={() => addCityToFlow(res)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-all text-left">
                      <div>
                        <h4 className="font-black text-sm text-white">{res.name}</h4>
                        <p className="text-[9px] text-slate-500 uppercase font-black">{res.country}</p>
                      </div>
                      <Plus className="w-4 h-4 text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleSave} disabled={isSaving} className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest transition-all text-[10px] flex items-center gap-3">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              {isEditing ? 'Sync Project' : 'Execute mission'}
            </button>
          </div>
        </div>

        {showBrief && (
          <div className="animate-in slide-in-from-top-4 duration-500 px-16 pb-2">
            <div className="relative group">
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Document your mission objectives, detailed requirements, and logistics brief here..."
                className="w-full bg-white/[0.02] hover:bg-white/[0.04] focus:bg-white/[0.05] border border-white/10 focus:border-blue-500/50 rounded-3xl p-6 text-sm font-medium text-slate-300 placeholder:text-slate-700 min-h-[120px] focus:ring-4 focus:ring-blue-500/5 transition-all outline-none resize-none custom-scrollbar italic leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow studio-canvas relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} color="#1e293b" gap={32} size={1} />
          <Controls className="!bg-[#0f172a] !border-slate-800" />
        </ReactFlow>
      </div>
    </div>
  );
};

const TripBuilder: React.FC<TripBuilderProps> = (props) => (
  <ReactFlowProvider>
    <TripBuilderContent {...props} />
  </ReactFlowProvider>
);

export default TripBuilder;