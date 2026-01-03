import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Compass, Map, LogOut, PlusCircle, LayoutDashboard, Search, Users, Calendar } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-[100] px-4 py-4 pointer-events-none no-print">
      {/* 
          FIXES: 
          - Changed 'container mx-auto' to 'w-full max-w-7xl mx-auto' for smoother scaling
          - Reduced height from h-22 to h-20
          - Reduced padding from px-10 to px-6
      */}
      <div className="w-full max-w-7xl mx-auto h-20 glass rounded-[30px] px-6 flex items-center justify-between shadow-[0_30px_60px_rgba(0,0,0,0.4)] border border-white/10 pointer-events-auto">
        
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-blue-600 p-2.5 rounded-xl transition-all group-hover:rotate-12 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col -space-y-1">
               <span className="text-lg font-black tracking-tighter text-white">GlobeTrotter</span>
               <span className="text-[7px] font-black text-blue-500 uppercase tracking-[0.3em]">Studio v2.5</span>
            </div>
          </Link>

          {/* Reduced gap between links and reduced individual link padding */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { to: "/", icon: LayoutDashboard, label: "Dashboard" },
              { to: "/explore", icon: Search, label: "Explore" },
              { to: "/community", icon: Users, label: "Community" },
              { to: "/calendar", icon: Calendar, label: "Schedule" },
              { to: "/my-trips", icon: Map, label: "Expeditions" },
            ].map((item) => (
              <NavLink 
                key={item.to}
                to={item.to} 
                end={item.to === "/"}
                className={({ isActive }) => `flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
              >
                <item.icon className="w-3.5 h-3.5" /> {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/create" className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
            <PlusCircle className="w-3.5 h-3.5" /> New Draft
          </Link>
          
          <div className="w-px h-8 bg-white/10 mx-1"></div>
          
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-3 p-1 hover:bg-white/5 rounded-xl transition-all pr-4">
              <img 
                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=1e293b&color=ffffff`} 
                alt={user.name} 
                className="w-10 h-10 rounded-xl border border-white/10 shadow-md" 
              />
              <div className="hidden xl:block">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Auth User</p>
                <p className="text-[10px] font-bold text-white leading-none">{user.name.split(' ')[0]}</p>
              </div>
            </Link>
            
            <button 
              onClick={() => { onLogout(); navigate('/'); }} 
              className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all" 
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;