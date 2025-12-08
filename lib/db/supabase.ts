import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing required Supabase environment variables: ' +
      (!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : '') +
      (!supabaseKey ? 'SUPABASE_SERVICE_ROLE_KEY' : '')
  );
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
