import { createClient } from '@supabase/supabase-js';

// Use placeholders if env vars are missing to prevent the entire React app from crashing on load
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.error('CRITICAL: Supabase URL or Anon Key is missing from your .env file! Authentication will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
