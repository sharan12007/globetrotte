import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { tripService } from './services/tripService'; // This will now work!
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MyTrips from './pages/MyTrips';
import TripBuilder from './pages/TripBuilder';
import ItineraryView from './pages/ItineraryView';
import Auth from './pages/Auth';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import SharedView from './pages/SharedView';
import Explore from './pages/Explore';
import Community from './pages/Community';
import CalendarView from './pages/CalendarView';
import { Trip, User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Auth Persistence: Check if user is logged in on page load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.display_name || 'Architect',
          email: session.user.email!,
          preferences: { language: 'en', currency: 'USD' }
        });
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.display_name || 'Architect',
          email: session.user.email!,
          preferences: { language: 'en', currency: 'USD' }
        });
      } else {
        setUser(null);
        setTrips([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch User's Trips from Cloud when they log in
  useEffect(() => {
    if (user) {
      const loadCloudData = async () => {
        try {
          const data = await tripService.getUserTrips();
          setTrips(data.map((t: any) => ({
            ...t,
            userId: t.user_id,
            startDate: t.start_date,
            endDate: t.end_date,
            totalBudget: t.total_budget,
            isPublic: t.is_public
          })));
        } catch (e) {
          console.error("Failed to sync archives:", e);
        }
      };
      loadCloudData();
    }
  }, [user]);

  // 3. Save/Update Trip to Cloud
  const handleSaveTrip = async (trip: Trip) => {
    try {
      const saved = await tripService.saveTrip(trip);
      const formatted = {
        ...saved,
        userId: saved.user_id,
        startDate: saved.start_date,
        endDate: saved.end_date,
        totalBudget: saved.total_budget,
        isPublic: saved.is_public
      };

      setTrips(prev => {
        const exists = prev.find(t => t.id === formatted.id);
        if (exists) return prev.map(t => t.id === formatted.id ? formatted : t);
        return [formatted, ...prev];
      });
    } catch (e) {
      alert("Cloud Sync Failed. Please check your connection.");
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      await tripService.deleteTrip(id);
      setTrips(trips.filter(t => t.id !== id));
    } catch (e) {
      alert("Failed to delete record from cloud.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
       <div className="animate-pulse text-blue-500 font-black uppercase tracking-[0.5em]">Establishing Connection...</div>
    </div>
  );

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] flex flex-col text-slate-200">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={user ? <Dashboard trips={trips} user={user} /> : <Auth onLogin={setUser} />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/community" element={<Community trips={trips} user={user} onClone={handleSaveTrip} />} />
            <Route path="/calendar" element={<CalendarView trips={trips} />} />
            <Route path="/my-trips" element={<MyTrips trips={trips} onDelete={deleteTrip} />} />
            <Route path="/create" element={user ? <TripBuilder user={user} onSave={handleSaveTrip} /> : <Navigate to="/" />} />
            <Route path="/edit/:id" element={user ? <TripBuilder user={user} trips={trips} onSave={handleSaveTrip} /> : <Navigate to="/" />} />
            <Route path="/view/:id" element={<ItineraryView trips={trips} />} />
            <Route path="/shared/:id" element={<SharedView trips={trips} />} />
            <Route path="/analytics" element={<Analytics trips={trips} />} />
            <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <footer className="bg-slate-950/50 border-t border-slate-800/50 py-8 text-center text-slate-500 text-xs font-medium uppercase tracking-[0.2em] no-print">
          © {new Date().getFullYear()} GlobeTrotter Studio. Engineering the perfect journey.
        </footer>
      </div>
    </Router>
  );
};

export default App;