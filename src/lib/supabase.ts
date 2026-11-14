import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

if (isSupabaseConfigured) {
  try {
    client = createClient(supabaseUrl!, supabaseAnonKey!);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

// Proxy-based supabase client that fails gracefully if not initialized
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    if (client) {
      return (client as any)[prop];
    }

    // Return a function that returns a chainable dummy object
    return () => {
      const dummyChain = {
        from: () => dummyChain,
        select: () => dummyChain,
        order: () => dummyChain,
        limit: () => dummyChain,
        single: () => Promise.resolve({ data: null, error: null }),
        // Thenable to handle the final await
        then: (onfulfilled: any) => onfulfilled({ data: [], error: null }),
      };
      return dummyChain;
    };
  },
});
