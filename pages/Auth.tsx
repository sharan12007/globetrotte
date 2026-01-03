import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Compass, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';

const Auth = ({ onLogin }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // REAL LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(`Access Denied: ${error.message}`);
      } else {
        onLogin(data.user);
      }
    } else {
      // REAL SIGNUP
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name } // Stores the name in user metadata
        }
      });

      if (error) {
        alert(`Initialization Failed: ${error.message}`);
      } else {
        alert('Verification link sent! Check your email to activate your studio account.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-dark p-12 rounded-[48px] border border-white/10 shadow-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-900/40">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">GlobeTrotter</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Geospatial Studio Login</p>
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500'}`}>Sign In</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-slate-950 shadow-xl' : 'text-slate-500'}`}>Register</button>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
              <div className="relative">
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full pl-11 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all" />
                <UserIcon className="absolute left-4 top-4.5 w-4 h-4 text-slate-600" />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative">
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-11 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all" />
              <Mail className="absolute left-4 top-4.5 w-4 h-4 text-slate-600" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Password</label>
            <div className="relative">
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-11 py-4 bg-white/5 border border-white/5 rounded-2xl text-white focus:border-blue-500/50 outline-none transition-all" />
              <Lock className="absolute left-4 top-4.5 w-4 h-4 text-slate-600" />
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px]">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (isLogin ? 'Authenticate' : 'Create Account')} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;