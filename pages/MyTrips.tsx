import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, Calendar, MapPin, Share2, Plus, Map as MapIcon, ChevronRight, MessageCircle, FileText, Copy, X } from 'lucide-react';
import { Trip } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface MyTripsProps {
  trips: Trip[];
  onDelete: (id: string) => void;
}

const MyTrips: React.FC<MyTripsProps> = ({ trips, onDelete }) => {
  const [activeShareTrip, setActiveShareTrip] = useState<Trip | null>(null);
  const navigate = useNavigate();

  const handleWhatsAppShare = (trip: Trip) => {
    const shareUrl = `${window.location.origin}/#/shared/${trip.id}`;
    const message = `Check out my mission blueprint for ${trip.name}: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCopyLink = (trip: Trip) => {
    const shareUrl = `${window.location.origin}/#/shared/${trip.id}`;
    navigator.clipboard.writeText(shareUrl);
    alert('Geospatial link copied to clipboard.');
  };

const handleExportPDF = async (trip: Trip) => {
  // 1. Move to the view page
  navigate(`/view/${trip.id}`);

  // Give React time to render the route
  setTimeout(async () => {
    // Target the specific itinerary scroll container
    const element = document.querySelector('.flex-grow.px-4') as HTMLElement;
    if (!element) return;

    try {
      // 2. TEMPORARY STYLING FOR CAPTURE
      // We force the container to show EVERYTHING so html2canvas can see it
      const originalStyle = element.style.cssText;
      element.style.height = 'auto';
      element.style.overflow = 'visible';
      element.style.maxWidth = '1200px'; // Standard professional width
      
      // Hide buttons temporarily via class
      const uiElements = document.querySelectorAll('.no-print');
      uiElements.forEach(el => (el as HTMLElement).style.display = 'none');

      // 3. CAPTURE
      const canvas = await html2canvas(element, {
        backgroundColor: '#020617',
        scale: 2, // High resolution
        useCORS: true,
        scrollY: -window.scrollY, // Fixes alignment issues
        windowWidth: 1200, // Captures at a consistent "desktop" width
      });

      // 4. RESTORE ORIGINAL UI
      element.style.cssText = originalStyle;
      uiElements.forEach(el => (el as HTMLElement).style.display = '');

      // 5. CALCULATE PDF DIMENSIONS
      const imgData = canvas.toDataURL('image/png');
      
      // We calculate the ratio so the PDF is exactly the same shape as the trip
      const imgWidth = 595.28; // Standard A4 Width in points
      const pageHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [imgWidth, pageHeight] // The PDF page will grow to fit your trip!
      });

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);
      pdf.save(`GlobeTrotter_Mission_Brief_${trip.name}.pdf`);
      
    } catch (error) {
      console.error("Transmission Error:", error);
    }
  }, 1500);
};

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700 relative">
      
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-0.5 w-8 bg-blue-600"></div>
            <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">Personal Archive</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter">My Expeditions</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Managing {trips.length} active geospatial blueprints</p>
        </div>
        
        <Link to="/create" className="flex items-center gap-3 bg-white text-slate-950 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-2xl">
          <Plus className="w-4 h-4" /> New Expedition
        </Link>
      </header>

      {trips.length === 0 ? (
        <div className="mx-4 glass border-2 border-dashed border-slate-800 rounded-[56px] py-40 text-center space-y-8">
          <div className="w-24 h-24 bg-slate-900/50 rounded-[32px] flex items-center justify-center mx-auto border border-slate-800">
            <MapIcon className="w-10 h-10 text-slate-700" />
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight uppercase">Archive is Empty</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
          {trips.map(trip => (
            <div key={trip.id} className="group glass-dark rounded-[48px] overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all duration-500 flex flex-col card-glow relative">
              <div className="relative h-64 overflow-hidden">
                <img src={trip.coverImage || `https://picsum.photos/seed/${trip.id}/800/600`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-8 right-8">
                   <h3 className="text-2xl font-black text-white truncate tracking-tight uppercase group-hover:text-blue-400 transition-colors">{trip.name}</h3>
                </div>
              </div>

              <div className="p-8 flex-grow space-y-6">
                <div className="flex items-center justify-between py-6 border-y border-white/5">
                   <div className="flex -space-x-3">
                    {trip.stops.slice(0, 3).map((stop, i) => (
                      <div key={i} className="w-9 h-9 rounded-full border-[3px] border-[#020617] bg-slate-800 flex items-center justify-center text-[9px] font-black text-slate-400">{stop.city[0]}</div>
                    ))}
                   </div>
                   <div className="text-right">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Fiscal Index</p>
                    <p className="text-lg font-black text-emerald-400 tracking-tight">₹{trip.totalBudget.toLocaleString()}</p>
                   </div>
                </div>
              </div>

              <div className="px-8 pb-8 grid grid-cols-2 gap-3">
                <Link to={`/view/${trip.id}`} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all"><Eye className="w-3.5 h-3.5" /> View</Link>
                <Link to={`/edit/${trip.id}`} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-blue-600/10 hover:text-blue-400 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all"><Edit className="w-3.5 h-3.5" /> Edit</Link>
                <button onClick={() => { if(confirm('Erase this blueprint?')) onDelete(trip.id) }} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/10 hover:text-red-400 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                
                {/* UPGRADED SHARE BUTTON */}
                <button onClick={() => setActiveShareTrip(trip)} className="flex items-center justify-center gap-2 bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MISSION TRANSMISSION MODAL */}
      {activeShareTrip && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-[#020617]/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg glass-dark rounded-[40px] border border-white/10 p-10 relative shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            <button onClick={() => setActiveShareTrip(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            
            <div className="space-y-8">
              <div className="space-y-2 text-center">
                <div className="bg-blue-600/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase">Transmission Hub</h3>
                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Select distribution protocol for "{activeShareTrip.name}"</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button onClick={() => handleWhatsAppShare(activeShareTrip)} className="flex items-center gap-6 p-6 bg-white/5 hover:bg-emerald-600/10 border border-white/5 hover:border-emerald-500/30 rounded-3xl group transition-all">
                  <div className="bg-emerald-500/20 p-4 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white text-emerald-500 transition-all"><MessageCircle className="w-6 h-6" /></div>
                  <div className="text-left">
                    <p className="text-white font-black uppercase tracking-widest text-[11px]">WhatsApp Direct</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight">Transmit blueprint to contacts</p>
                  </div>
                </button>

                <button onClick={() => handleExportPDF(activeShareTrip)} className="flex items-center gap-6 p-6 bg-white/5 hover:bg-blue-600/10 border border-white/5 hover:border-blue-500/30 rounded-3xl group transition-all">
                  <div className="bg-blue-500/20 p-4 rounded-2xl group-hover:bg-blue-500 group-hover:text-white text-blue-500 transition-all"><FileText className="w-6 h-6" /></div>
                  <div className="text-left">
                    <p className="text-white font-black uppercase tracking-widest text-[11px]">Generate PDF Archive</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight">Export visual mission manifest</p>
                  </div>
                </button>

                <button onClick={() => handleCopyLink(activeShareTrip)} className="flex items-center gap-6 p-6 bg-white/5 hover:bg-indigo-600/10 border border-white/5 hover:border-indigo-500/30 rounded-3xl group transition-all">
                  <div className="bg-indigo-500/20 p-4 rounded-2xl group-hover:bg-indigo-500 group-hover:text-white text-indigo-500 transition-all"><Copy className="w-6 h-6" /></div>
                  <div className="text-left">
                    <p className="text-white font-black uppercase tracking-widest text-[11px]">Secure Link</p>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight">Copy geospatial URL to clipboard</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTrips;