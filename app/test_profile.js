import { createClient } from '@supabase/supabase-js';


const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('profiles').select('kyc_full_name, phone, bank_account_number, ifsc_code, upi_id').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}
test();
