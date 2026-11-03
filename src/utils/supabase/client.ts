import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  import.meta.env?.VITE_SUPABASE_URL ||
  (import.meta.env as any)?.NEXT_PUBLIC_SUPABASE_URL ||
  'https://vtlcbycbsrhcxemwlpbf.supabase.co';

const supabaseKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (import.meta.env as any)?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_qk1ZBdWX9tBmS5V-H3KaFA_T-7CROvL';

export const createClient = () => {
  if (typeof createBrowserClient === 'function') {
    return createBrowserClient(supabaseUrl, supabaseKey);
  }
  return createSupabaseClient(supabaseUrl, supabaseKey);
};
