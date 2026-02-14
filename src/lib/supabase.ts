import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'STUDENT' | 'MENTOR' | 'ORGANISATION' | 'ADMIN' | 'SUPER_ADMIN';
          bio: string | null;
          company: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: 'STUDENT' | 'MENTOR' | 'ORGANISATION' | 'ADMIN' | 'SUPER_ADMIN';
          bio?: string | null;
          company?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'STUDENT' | 'MENTOR' | 'ORGANISATION' | 'ADMIN' | 'SUPER_ADMIN';
          bio?: string | null;
          company?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: any;
          created_at: string;
          updated_at: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          company: string;
          description: string;
          location: string;
          salary_range: string | null;
          job_type: string;
          experience_level: string;
          skills: string[];
          posted_date: string;
          application_deadline: string | null;
          is_active: boolean;
          created_at: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          resume_id: string | null;
          cover_letter: string | null;
          status: string;
          applied_at: string;
          updated_at: string;
        };
      };
    };
  };
};
