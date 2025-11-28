import { createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';

export type TeamAdmin = {
  id: string;
  email: string;
  created_at: string | null;
};

export type TeamAdminContextValue = {
  admins: TeamAdmin[];
  loading: boolean;
  refresh: () => Promise<void>;
  addAdmin: (email: string) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
};

export const TeamAdminContext = createContext<TeamAdminContextValue | undefined>(undefined);

export async function fetchTeamAdmins(): Promise<TeamAdmin[]> {
  const { data, error } = await supabase
    .from('team_admins')
    .select('id,email,created_at')
    .order('email', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export function useTeamAdminContext() {
  const context = useContext(TeamAdminContext);
  if (!context) {
    throw new Error('useTeamAdminContext must be used within a TeamAdminProvider');
  }
  return context;
}






