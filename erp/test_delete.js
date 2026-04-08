import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dkcxldblnxgheudsckba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrY3hsZGJsbnhnaGV1ZHNja2JhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0Njc5NTUsImV4cCI6MjA4NDA0Mzk1NX0.jxKbFyqKUXiVJ8PAuvqAV21Lu-avQNJbvREjGUAymzI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkErr(promise, context) {
    const { data, error } = await promise;
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw error;
    }
    return data;
}

async function main() {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'info@gainux.com',
        password: 'Gainux.com@123'
    });
    
    if (authError || !authData.user) return;
    
    const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .eq('name', 'Amal Productions')
        .limit(1);
        
    if (!companies || companies.length === 0) {
        console.log('Could not find Amal Productions');
        return;
    }
    
    const id = companies[0].id;
    console.log("Found Company ID:", id);

    try {
        const { data: quotes } = await supabase.from('quotes').select('id').eq('company_id', id);
        const quoteIds = quotes ? quotes.map(q => q.id) : [];

        let orderIdsToDelete = [];
        const { data: salesOrdersCompany } = await supabase.from('sales_orders').select('id').eq('company_id', id);
        if (salesOrdersCompany) {
            orderIdsToDelete.push(...salesOrdersCompany.map(o => o.id));
        }

        if (quoteIds.length > 0) {
            const { data: salesOrdersQuotes } = await supabase.from('sales_orders').select('id').in('quote_id', quoteIds);
            if (salesOrdersQuotes) {
                orderIdsToDelete.push(...salesOrdersQuotes.map(o => o.id));
            }
        }

        orderIdsToDelete = [...new Set(orderIdsToDelete)];
        console.log("orderIdsToDelete:", orderIdsToDelete);

        if (orderIdsToDelete.length > 0) {
            const deletedItems = await checkErr(supabase.from('sales_order_items').delete().in('order_id', orderIdsToDelete).select(), "sales_order_items");
            console.log("Deleted items:", deletedItems);
            
            const deletedOrders = await checkErr(supabase.from('sales_orders').delete().in('id', orderIdsToDelete).select(), "sales_orders");
            console.log("Deleted orders:", deletedOrders);
        }

        // Wait, did we miss anything? Check if there are STILL sales orders with these quotes?
        if (quoteIds.length > 0) {
            const { data: checkOrders } = await supabase.from('sales_orders').select('id').in('quote_id', quoteIds);
            console.log("Check if any SOs remain for quotes:", checkOrders);
        }
        
    } catch (e) {
        console.error("Failed to delete exception occurred.");
    }
}

main();
