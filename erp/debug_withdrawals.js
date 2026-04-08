import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkcxldblnxgheudsckba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrY3hsZGJsbnhnaGV1ZHNja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Njc5NTUsImV4cCI6MjA4NDA0Mzk1NX0.jxKbFyqKUXiVJ8PAuvqAV21Lu-avQNJbvREjGUAymzI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('withdrawals').select('*');
  console.log('Error 1:', error);
  console.log('Withdrawals raw:', JSON.stringify(data, null, 2));

  const { data: joinData, error: joinError } = await supabase
    .from('withdrawals')
    .select('*, profiles:user_id(kyc_full_name, bank_account_number, ifsc_code, upi_id)');
    
  console.log('Error 2:', joinError);
  console.log('Withdrawals joined:', JSON.stringify(joinData, null, 2));
}

main();
