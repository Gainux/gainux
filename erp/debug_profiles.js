import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkcxldblnxgheudsckba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrY3hsZGJsbnhnaGV1ZHNja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Njc5NTUsImV4cCI6MjA4NDA0Mzk1NX0.jxKbFyqKUXiVJ8PAuvqAV21Lu-avQNJbvREjGUAymzI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('profiles').select('id, email, role, kyc_full_name');
  console.log('Error:', error);
  console.log('Total Profiles:', data.length);
  console.log('Profiles:', JSON.stringify(data, null, 2));
}

main();
