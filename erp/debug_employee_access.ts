
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("--- Debugging Employee Access (ANON KEY) ---");
    console.log("Checking if we can list profiles...");

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, first_name, role, auth_id')
        .limit(5);

    if (profileError) {
        console.error("Error fetching profiles:", profileError.message);
    } else {
        console.log(`Found ${profiles?.length} profiles.`);
        console.table(profiles);
    }

    console.log("\nChecking if we can list employees...");
    const { data: employees, error: employeeError } = await supabase
        .from('employees')
        .select('id, email, first_name, user_id, org_id')
        .limit(5);

    if (employeeError) {
        console.error("Error fetching employees:", employeeError.message);
    } else {
        console.log(`Found ${employees?.length} employees.`);
        console.table(employees);
    }
}

debug();
