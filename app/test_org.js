import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: profile, error } = await supabase.from('profiles').select('*').limit(1).single();
  console.log("Profile:", profile);
}
test();
