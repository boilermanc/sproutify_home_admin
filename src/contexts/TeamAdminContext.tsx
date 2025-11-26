import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import {
  TeamAdminContext,
  fetchTeamAdmins,
  type TeamAdmin,
  type TeamAdminContextValue,
} from './teamAdminContextBase';

type ProviderProps = {
  children: ReactNode;
  initialAdmins: TeamAdmin[];
  onChange?: (admins: TeamAdmin[]) => void;
};

export function TeamAdminProvider({ children, initialAdmins, onChange }: ProviderProps) {
  const [admins, setAdmins] = useState<TeamAdmin[]>(initialAdmins);
  const [loading, setLoading] = useState(false);

  const syncAdminList = useCallback(
    (next: TeamAdmin[]) => {
      setAdmins(next);
      onChange?.(next);
    },
    [onChange]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const fresh = await fetchTeamAdmins();
      syncAdminList(fresh);
    } finally {
      setLoading(false);
    }
  }, [syncAdminList]);

  const addAdmin = useCallback(
    async (email: string) => {
      const normalized = email.trim().toLowerCase();
      if (!normalized) {
        throw new Error('Email is required');
      }

      setLoading(true);
      const { error } = await supabase.from('team_admins').insert({ email: normalized });
      if (error) {
        setLoading(false);
        throw error;
      }

      await refresh();
    },
    [refresh]
  );

  const removeAdmin = useCallback(
    async (id: string) => {
      setLoading(true);
      const { error } = await supabase.from('team_admins').delete().eq('id', id);
      if (error) {
        setLoading(false);
        throw error;
      }
      await refresh();
    },
    [refresh]
  );

  const value = useMemo<TeamAdminContextValue>(
    () => ({
      admins,
      loading,
      refresh,
      addAdmin,
      removeAdmin,
    }),
    [admins, loading, refresh, addAdmin, removeAdmin]
  );

  return <TeamAdminContext.Provider value={value}>{children}</TeamAdminContext.Provider>;
}

