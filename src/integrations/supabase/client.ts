import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables. Check .env');
}

// Canonical Supabase client — ALL frontend modules import from here.
// import { supabase } from '@/integrations/supabase/client';
export const supabase = createClient<Database>(
    SUPABASE_URL || 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY || 'placeholder',
    {
        auth: {
            storage: localStorage,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true, // handles Google OAuth redirects
        },
    }
);

// Helper for calling Supabase Edge Functions
export const callEdgeFunction = <T = unknown>(name: string, body: object) =>
    supabase.functions.invoke<T>(name, { body });
