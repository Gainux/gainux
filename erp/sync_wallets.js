import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            process.env[match[1].trim()] = match[2].trim();
        }
    });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncWallets() {
    console.log("Starting wallet sync...");

    // Get all users who have a wallet
    const { data: wallets, error: wErr } = await supabase.from('wallets').select('*');
    if (wErr) {
        console.error("Failed to fetch wallets:", wErr);
        return;
    }

    for (const wallet of wallets) {
        const userId = wallet.user_id;

        // Get all completed transactions for this user
        const { data: txs, error: txErr } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', userId);

        if (txErr) {
            console.error(`Failed to fetch txs for user ${userId}:`, txErr);
            continue;
        }

        let calculatedBalance = 0;
        let calculatedTotalEarned = 0;

        for (const tx of txs) {
            if (tx.status === 'completed') {
                if (tx.type === 'credit') {
                    calculatedBalance += tx.amount;
                    calculatedTotalEarned += tx.amount;
                } else if (tx.type === 'debit') {
                    calculatedBalance -= tx.amount;
                }
            } else if (tx.status === 'pending') {
                // Pending debits (withdrawals) reduce balance immediately
                if (tx.type === 'debit') {
                    calculatedBalance -= tx.amount;
                }
            }
        }

        console.log(`User ${userId}: Old DB Balance=${wallet.balance}, Old TotalE=${wallet.total_earned}`);
        console.log(`User ${userId}: New DB Balance=${calculatedBalance}, New TotalE=${calculatedTotalEarned}`);

        // Update if there is a discrepancy
        if (calculatedBalance !== wallet.balance || calculatedTotalEarned !== wallet.total_earned) {
            const { error: updErr } = await supabase
                .from('wallets')
                .update({ balance: calculatedBalance, total_earned: calculatedTotalEarned })
                .eq('user_id', userId);

            if (updErr) {
                console.error(`Failed to update wallet for ${userId}:`, updErr);
            } else {
                console.log(`✅ Fixed wallet for user ${userId}`);
            }
        } else {
            console.log(`✅ Wallet for user ${userId} is already correct.`);
        }
    }

    console.log("Sync complete!");
}

syncWallets();
