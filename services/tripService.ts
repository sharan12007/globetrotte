import { supabase } from '../lib/supabase';
import { Trip } from '../types';

export const tripService = {
  // 1. Fetch all trips for the logged-in user from the cloud
  async getUserTrips() {
    const { data, error } = await supabase
      .from('trips')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Supabase Fetch Error:", error);
      throw error;
    }
    return data;
  },

  // 2. Save a new trip or update an existing one in the cloud
  async saveTrip(trip: Trip) {
    const { data, error } = await supabase
      .from('trips')
      .upsert({
        // If the ID is a long UUID, keep it. If it's a short temp ID, let Supabase generate one.
        id: trip.id.length > 20 ? trip.id : undefined, 
        user_id: trip.userId,
        name: trip.name,
        description: trip.description,
        start_date: trip.startDate,
        end_date: trip.endDate,
        total_budget: trip.totalBudget,
        status: trip.status,
        is_public: trip.isPublic,
        stops: trip.stops // This saves your entire node/activity array
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase Save Error:", error);
      throw error;
    }
    return data;
  },

  // 3. Delete a trip from the cloud
  async deleteTrip(id: string) {
    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase Delete Error:", error);
      throw error;
    }
  }
};