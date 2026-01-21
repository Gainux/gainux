import { supabase } from "@/lib/supabase";
import type { Bill, BillItem } from "../types";
import { financeService } from "./financeService";
import { toast } from "sonner";

export const billService = {

    // --- Bills ---

    async getBills(orgId: string) {
        const { data, error } = await supabase
            .from("bills")
            .select(`
                *,
                vendors(name),
                bill_items(*)
            `)
            .eq("org_id", orgId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data.map((bill: any) => ({
            ...bill,
            billNumber: bill.bill_number,
            vendorInvoiceNumber: bill.vendor_invoice_number,
            issueDate: bill.issue_date,
            dueDate: bill.due_date,
            taxRate: parseFloat(bill.tax_rate),
            taxAmount: parseFloat(bill.tax_amount),
            total: parseFloat(bill.total_amount),
            vendor: bill.vendors, // Join result
            items: bill.bill_items?.map((item: any) => ({
                id: item.id,
                billId: item.bill_id,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unit_price),
                amount: parseFloat(item.amount),
                expenseAccountId: item.expense_account_id
            })) || []
        })) as Bill[];
    },

    async getBillById(id: string) {
        const { data, error } = await supabase
            .from("bills")
            .select(`
                *,
                vendors(*),
                bill_items(*)
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        return {
            ...data,
            billNumber: data.bill_number,
            vendorInvoiceNumber: data.vendor_invoice_number,
            issueDate: data.issue_date,
            dueDate: data.due_date,
            taxRate: parseFloat(data.tax_rate),
            taxAmount: parseFloat(data.tax_amount),
            total: parseFloat(data.total_amount),
            vendor: data.vendors,
            items: data.bill_items?.map((item: any) => ({
                id: item.id,
                billId: item.bill_id,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unit_price),
                amount: parseFloat(item.amount),
                expenseAccountId: item.expense_account_id
            })) || []
        } as Bill;
    },

    async createBill(billData: Partial<Bill> & { orgId: string }, items: Partial<BillItem>[]) {
        // Generate Bill Number
        const { data: billNumberData, error: numberError } = await supabase
            .rpc('generate_bill_number', { p_org_id: billData.orgId });

        if (numberError) throw numberError;

        // Create Bill Header
        const { data: bill, error: billError } = await supabase
            .from("bills")
            .insert([{
                org_id: billData.orgId,
                vendor_id: billData.vendor_id,
                bill_number: billNumberData,
                vendor_invoice_number: billData.vendorInvoiceNumber,
                issue_date: billData.issueDate,
                due_date: billData.dueDate,
                status: 'draft',
                subtotal: billData.subtotal,
                tax_rate: billData.taxRate,
                tax_amount: billData.taxAmount,
                total_amount: billData.total,
                currency: 'INR',
                notes: billData.notes,
            }])
            .select()
            .single();

        if (billError) throw billError;

        // Create Bill Items
        if (items.length > 0) {
            const { error: itemsError } = await supabase
                .from("bill_items")
                .insert(items.map(item => ({
                    bill_id: bill.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    amount: item.amount,
                    expense_account_id: item.expenseAccountId // Could be mapped to a default expense account
                })));

            if (itemsError) throw itemsError;
        }

        return bill;
    },

    async updateBillStatus(id: string, status: Bill['status'], orgId: string) {
        // 1. Update Status
        const { error } = await supabase
            .from("bills")
            .update({ status })
            .eq("id", id);

        if (error) throw error;

        // 2. GL Posting Logic (Draft -> Open)
        if (status === 'open') {
            try {
                // Fetch Bill Details
                const bill = await this.getBillById(id);
                if (!bill) throw new Error("Bill not found");

                // ENSURE DEFAULT ACCOUNTS EXIST (Auto-Creation)
                // 1. Accounts Payable (Liability) - 2000
                // 2. General Expense (Expense) - 5000 (Simple default for now)

                const accounts = await financeService.getAccounts(orgId);

                let apAccount = accounts.find(a => a.code === '2000');
                if (!apAccount) {
                    apAccount = await financeService.createAccount({
                        org_id: orgId,
                        code: '2000',
                        name: 'Accounts Payable',
                        type: 'liability',
                        currency: 'INR',
                        is_active: true
                    });
                }

                let expenseAccount = accounts.find(a => a.code === '5000');
                if (!expenseAccount) {
                    expenseAccount = await financeService.createAccount({
                        org_id: orgId,
                        code: '5000',
                        name: 'General Expenses',
                        type: 'expense',
                        currency: 'INR',
                        is_active: true
                    });
                }

                // Create Journal Entry
                // Debit: Expense (Increase Expense)
                // Credit: Accounts Payable (Increase Liability)

                await financeService.createJournalEntry(
                    {
                        org_id: orgId,
                        entry_date: bill.issueDate,
                        description: `Bill #${bill.billNumber} - ${bill.vendor?.name}`,
                        reference: bill.billNumber,
                        status: 'posted'
                    },
                    [
                        {
                            account_id: expenseAccount.id,
                            debit: bill.subtotal, // Currently putting full subtotal to expense. Tax handling needs a Tax Input account (omitted for MVP).
                            credit: 0,
                            description: `Expense for Bill #${bill.billNumber}`
                        },
                        {
                            account_id: apAccount.id,
                            debit: 0,
                            credit: bill.total, // Full Amount to AP
                            description: `Payable for Bill #${bill.billNumber}`
                        },
                        // Note: If Tax exists, we should technically Debit 'Tax Input' account.
                        // For MVP simplicity: Debit Expense = Subtotal, Debit Tax = Tax Amount? 
                        // Let's iterate: if tax > 0, add tax line.
                        ...(bill.taxAmount > 0 ? [{
                            account_id: expenseAccount.id, // Using Expense for tax too for super simplicity, or create a 'Tax Input' asset?
                            // Better: Let's reuse 'General Expenses' for now to keep it balanced.
                            // Real world: Debit Tax Receivable/Input. 
                            debit: bill.taxAmount,
                            credit: 0,
                            description: `Tax on Bill #${bill.billNumber}`
                        }] : [])
                    ]
                );

                toast.success("Bill Posted to General Ledger");

            } catch (glError: any) {
                console.error("GL Posting Failed:", glError);
                toast.error(`Bill Status Updated, but GL Posting Failed: ${glError.message}`);
            }
        }
    },

    async deleteBill(id: string) {
        // Clean up GL Logic similar to Invoices
        const { data: bill, error: fetchError } = await supabase
            .from("bills")
            .select("bill_number, org_id")
            .eq("id", id)
            .single();

        if (fetchError) throw fetchError;

        if (bill) {
            // Delete associated Journal Entry
            await supabase
                .from("journal_entries")
                .delete()
                .eq("org_id", bill.org_id)
                .eq("reference", bill.bill_number);
        }

        const { error } = await supabase
            .from("bills")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
