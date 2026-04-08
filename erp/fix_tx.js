import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkcxldblnxgheudsckba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrY3hsZGJsbnhnaGV1ZHNja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Njc5NTUsImV4cCI6MjA4NDA0Mzk1NX0.jxKbFyqKUXiVJ8PAuvqAV21Lu-avQNJbvREjGUAymzI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: withdrawals, error: wError } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('status', 'completed');

  if (wError) return console.error(wError);

  console.log(`Found ${withdrawals.length} completed withdrawals.`);

  for (const w of withdrawals) {
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .update({ status: 'completed', description: 'Withdrawal (Completed)' })
      .eq('user_id', w.user_id)
      .eq('type', 'debit')
      .eq('status', 'pending');
    
    if (txError) {
      console.error(`Error updating tx for user ${w.user_id}:`, txError);
    } else {
      console.log(`Updated pending tx for user ${w.user_id} to completed.`);
    }
  }
}

main();
