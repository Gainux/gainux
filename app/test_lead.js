import { createClient } from '@supabase/supabase-js';

// use service role key if available, else anon
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { error } = await supabase
      .from('leads')
      .insert({
          first_name: 'Test',
          last_name: 'Test',
          email: 'test@example.com',
          phone: '1234567890',
          company_name: 'Test Co',
          source: 'Referral Portal',
          status: 'new',
          referrer_id: '00000000-0000-0000-0000-000000000000'
      });
  console.log("Insert 1 Error:", error);
}
test();
