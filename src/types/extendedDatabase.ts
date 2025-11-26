import type { Database } from '../database.types';

type TeamAdminTable = {
  Row: {
    id: string;
    email: string;
    created_at: string | null;
  };
  Insert: {
    id?: string;
    email: string;
    created_at?: string | null;
  };
  Update: {
    id?: string;
    email?: string;
    created_at?: string | null;
  };
  Relationships: [];
};

export type ExtendedDatabase = Database & {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      team_admins: TeamAdminTable;
      v_user_dashboard: {
        Row: {
          user_status: string | null;
          trial_status: string | null;
          trial_days_remaining: number | null;
          active_towers: number | null;
          active_plants: number | null;
          profile_completeness: string | null;
          engagement_status: string | null;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
  };
};

