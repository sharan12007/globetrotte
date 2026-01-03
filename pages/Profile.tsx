import React from 'react';
import { User as UserType } from '../types';
import { 
  User as UserIcon, 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  LogOut, 
  Camera, 
  Cpu, 
  Zap, 
  ChevronRight,
  CreditCard
} from 'lucide-react';

interface ProfileProps {
  user: UserType;
  setUser: (u: UserType) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, setUser }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Header Section */}
      <header className="px-4 space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-0.5 w-8 bg-blue-600"></div>
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em]">System Configuration</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter">User Profile</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Manage your geospatial credentials and preferences</p>
      </header>

      {/* Main Profile Card */}
      <div className="mx-4 glass-dark rounded-[48px] border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="h-48 bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        </div>
        
        <div className="px-12 pb-12">
          <div className="relative -mt-16 mb-10 flex items-end gap-8">
            <div className="relative group">
              <img 
                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=1e293b&color=ffffff&size=256`} 
                alt={user.name} 
                className="w-40 h-40 rounded-[40px] border-8 border-[#020617] shadow-2xl bg-slate-900 object-cover" 
              />
              <button className="absolute bottom-2 right-2 p-3 bg-blue-600 rounded-2xl text-white shadow-xl hover:scale-110 transition-all border-4 border-[#020617]">
                <Camera className="w-5 h-5" />
              </button>
            </div>
            <div className="pb-4 space-y-1">
               <h2 className="text-3xl font-black text-white tracking-tight uppercase">{user.name}</h2>
               <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em]">Geospatial Architect • Level 4</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Display Identity</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  value={user.name} 
                  onChange={e => setUser({...user, name: e.target.value})} 
                  className="w-full pl-14 pr-6 py-5 bg-white/[0.03] border border-white/5 rounded-3xl font-bold text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800" 
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Communication Node (Email)</label>
              <div className="relative">
                <Cpu className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                <input 
                  value={user.email} 
                  disabled 
                  className="w-full pl-14 pr-6 py-5 bg-black/40 border border-white/5 rounded-3xl font-bold text-slate-600 cursor-not-allowed italic" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* Travel Preferences */}
        <div className="glass p-10 rounded-[48px] border border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white flex items-center gap-4 text-sm uppercase tracking-widest">
              <div className="bg-blue-600/20 p-2 rounded-xl"><Globe className="w-5 h-5 text-blue-500" /></div> 
              Regional Protocol
            </h3>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Default Currency</span>
              <select className="bg-transparent border-none text-[11px] font-black text-white uppercase tracking-widest focus:ring-0 cursor-pointer">
                <option className="bg-[#020617]">USD ($)</option>
                <option className="bg-[#020617]">EUR (€)</option>
                <option className="bg-[#020617]">GBP (£)</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Interface Language</span>
              <select className="bg-transparent border-none text-[11px] font-black text-white uppercase tracking-widest focus:ring-0 cursor-pointer">
                <option className="bg-[#020617]">English (US)</option>
                <option className="bg-[#020617]">Spanish (ES)</option>
                <option className="bg-[#020617]">French (FR)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass p-10 rounded-[48px] border border-white/5 space-y-8">
          <h3 className="font-black text-white flex items-center gap-4 text-sm uppercase tracking-widest">
            <div className="bg-orange-600/20 p-2 rounded-xl"><Bell className="w-5 h-5 text-orange-500" /></div> 
            Transmission Alerts
          </h3>
          <div className="space-y-4">
             {[
               { label: 'Expedition Reminders', active: true },
               { label: 'Geospatial Price Alerts', active: false },
               { label: 'Community Sync Notifications', active: true }
             ].map((pref, i) => (
               <label key={i} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all cursor-pointer group">
                 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{pref.label}</span>
                 <input type="checkbox" defaultChecked={pref.active} className="w-6 h-6 rounded-lg bg-slate-950 border-white/10 text-blue-600 focus:ring-blue-600/20" />
               </label>
             ))}
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mx-4 p-12 bg-red-950/10 border border-red-500/20 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] rounded-full"></div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3 text-red-500 mb-2">
            <Shield className="w-5 h-5" />
            <h3 className="font-black uppercase tracking-[0.3em] text-[10px]">Termination Protocol</h3>
          </div>
          <h4 className="text-2xl font-black text-white tracking-tight uppercase">Delete Studio Account</h4>
          <p className="text-xs font-medium text-slate-500 max-w-md italic">
            Initiating this command will permanently erase your geospatial history, blueprints, and credentials. This action is non-reversible.
          </p>
        </div>
        <button className="bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-2xl relative z-10 active:scale-95">
          Erase All Data
        </button>
      </div>

    </div>
  );
};

export default Profile;