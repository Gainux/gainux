import { supabase } from "@/lib/supabase";
import type { Invoice, InvoiceItem } from "../types";
import { financeService } from "./financeService";
import { toast } from "sonner";

// Helper to get financial year


export const invoiceService = {
    async getInvoices(orgId?: string) {
        let query = supabase
            .from("invoices")
            .select(`
                *,
                invoice_items(*)
            `)
            .order("created_at", { ascending: false });

        if (orgId) {
            query = query.eq("org_id", orgId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((invoice: any) => ({
            ...invoice,
            invoiceNumber: invoice.invoice_number,
            customerId: invoice.customer_id,
            dealId: invoice.deal_id,
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,
            taxRate: parseFloat(invoice.tax_rate),
            taxAmount: parseFloat(invoice.tax_amount),
            subtotal: parseFloat(invoice.subtotal),
            total: parseFloat(invoice.total),
            items: invoice.invoice_items?.map((item: any) => ({
                id: item.id,
                invoiceId: item.invoice_id,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unit_price),
                amount: parseFloat(item.amount),
            })) || []
        })) as Invoice[];
    },

    async getInvoiceById(id: string) {
        const { data, error } = await supabase
            .from("invoices")
            .select(`
                *,
                invoice_items(*),
                companies(id, name, address, phone, website)
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        return {
            ...data,
            invoiceNumber: data.invoice_number,
            customerId: data.customer_id,
            dealId: data.deal_id,
            issueDate: data.issue_date,
            dueDate: data.due_date,
            taxRate: parseFloat(data.tax_rate),
            taxAmount: parseFloat(data.tax_amount),
            subtotal: parseFloat(data.subtotal),
            total: parseFloat(data.total),
            items: data.invoice_items?.map((item: any) => ({
                id: item.id,
                invoiceId: item.invoice_id,
                description: item.description,
                quantity: parseFloat(item.quantity),
                unitPrice: parseFloat(item.unit_price),
                amount: parseFloat(item.amount),
            })) || [],
            customer: data.companies
        } as Invoice & { customer: any };
    },

    async createInvoice(invoiceData: Partial<Invoice> & { orgId: string }, items: Partial<InvoiceItem>[]) {
        // Generate invoice number
        const { data: invoiceNumberData, error: numberError } = await supabase
            .rpc('generate_invoice_number');

        if (numberError) throw numberError;

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .insert([{
                org_id: invoiceData.orgId,
                invoice_number: invoiceNumberData,
                customer_id: invoiceData.customerId,
                deal_id: invoiceData.dealId,
                issue_date: invoiceData.issueDate,
                due_date: invoiceData.dueDate,
                status: invoiceData.status || 'draft',
                subtotal: invoiceData.subtotal,
                tax_rate: invoiceData.taxRate,
                tax_amount: invoiceData.taxAmount,
                total: invoiceData.total,
                currency: invoiceData.currency || 'INR',
                notes: invoiceData.notes,
            }])
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Create invoice items
        if (items.length > 0) {
            const { error: itemsError } = await supabase
                .from("invoice_items")
                .insert(items.map(item => ({
                    org_id: invoiceData.orgId,
                    invoice_id: invoice.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    amount: item.amount,
                })));

            if (itemsError) throw itemsError;
        }

        return this.getInvoiceById(invoice.id);
    },

    async updateInvoice(id: string, invoiceData: Partial<Invoice>, items?: Partial<InvoiceItem>[]) {
        const dbUpdates: any = {};

        if (invoiceData.customerId !== undefined) dbUpdates.customer_id = invoiceData.customerId;
        if (invoiceData.dealId !== undefined) dbUpdates.deal_id = invoiceData.dealId;
        if (invoiceData.issueDate) dbUpdates.issue_date = invoiceData.issueDate;
        if (invoiceData.dueDate) dbUpdates.due_date = invoiceData.dueDate;
        if (invoiceData.status) dbUpdates.status = invoiceData.status;
        if (invoiceData.subtotal !== undefined) dbUpdates.subtotal = invoiceData.subtotal;
        if (invoiceData.taxRate !== undefined) dbUpdates.tax_rate = invoiceData.taxRate;
        if (invoiceData.taxAmount !== undefined) dbUpdates.tax_amount = invoiceData.taxAmount;
        if (invoiceData.total !== undefined) dbUpdates.total = invoiceData.total;
        if (invoiceData.notes !== undefined) dbUpdates.notes = invoiceData.notes;

        const { error: updateError } = await supabase
            .from("invoices")
            .update(dbUpdates)
            .eq("id", id);

        if (updateError) throw updateError;

        // Update items if provided
        if (items !== undefined) {
            // Delete existing items
            await supabase
                .from("invoice_items")
                .delete()
                .eq("invoice_id", id);

            // Fetch invoice to get org_id
            const { data: inv } = await supabase.from('invoices').select('org_id').eq('id', id).single();
            const orgId = inv?.org_id;

            // Insert new items
            if (items.length > 0) {
                await supabase
                    .from("invoice_items")
                    .insert(items.map(item => ({
                        org_id: orgId,
                        invoice_id: id,
                        description: item.description,
                        quantity: item.quantity,
                        unit_price: item.unitPrice,
                        amount: item.amount,
                    })));
            }
        }

        return this.getInvoiceById(id);
    },

    async deleteInvoice(id: string) {
        // 1. Fetch invoice to get details for GL cleanup
        const { data: invoice, error: fetchError } = await supabase
            .from("invoices")
            .select("invoice_number, org_id")
            .eq("id", id)
            .single();

        if (fetchError) {
            // If invoice doesn't exist, just return or throw? 
            // If fetching failed, we probably can't delete it anyway.
            throw fetchError;
        }

        if (invoice && invoice.invoice_number && invoice.org_id) {
            // 2. Delete associated Journal Entry (if any)
            // We assume reference == invoice_number
            const { error: glError } = await supabase
                .from("journal_entries")
                .delete()
                .eq("org_id", invoice.org_id)
                .eq("reference", invoice.invoice_number);

            if (glError) {
                console.error("Failed to cleanup GL entry for invoice deletion:", glError);
                // Should we block? Probably yes, to ensure consistency.
                throw new Error(`Failed to delete associated GL entry: ${glError.message}`);
            } else {
                // console.log("Associated GL entry deleted.");
            }
        }

        // 3. Delete Invoice
        const { error } = await supabase
            .from("invoices")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async updateInvoiceStatus(id: string, status: Invoice['status']) {
        const { error } = await supabase
            .from("invoices")
            .update({ status })
            .eq("id", id);

        if (error) throw error;

        // --- GL INTEGRATION ---

        // If status changed to 'sent', post a Journal Entry
        if (status === 'sent') {
            try {
                // 1. Fetch Invoice Details
                const invoice = await this.getInvoiceById(id);
                const orgId = (invoice as any).org_id;

                if (!orgId) {
                    console.warn("Invoice missing org_id, skipping GL posting");
                    return this.getInvoiceById(id);
                }

                // 2. Fetch Existing Accounts
                // We fetch all to minimize queries and check existence
                const existingAccounts = await financeService.getAccounts(orgId);

                // Helper to Get or Create Account
                const getOrCreateAccount = async (code: string, name: string, type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense') => {
                    const found = existingAccounts.find(a => a.code === code);
                    if (found) return found;

                    console.log(`Auto-creating missing account: ${code} - ${name}`);
                    try {
                        const newAccount = await financeService.createAccount({
                            org_id: orgId,
                            code,
                            name,
                            type,
                            currency: 'INR',
                            is_active: true
                        });
                        return newAccount;
                    } catch (err: any) {
                        // Handle race condition if account was created in parallel
                        if (err.message && err.message.includes('unique constraint')) {
                            // Fetch again
                            const retryAccounts = await financeService.getAccounts(orgId);
                            return retryAccounts.find(a => a.code === code)!;
                        }
                        throw err;
                    }
                };

                // 3. Resolve Accounts (Auto-create if missing)
                // Accounts Receivable (1200) - Asset
                const arAccount = await getOrCreateAccount('1200', 'Accounts Receivable', 'asset');

                // Sales / Revenue (4000) - Revenue
                const salesAccount = await getOrCreateAccount('4000', 'Sales Revenue', 'revenue');

                // Tax Payable (2200) - Liability (Only needed if there is tax)
                let taxAccount = null;
                if (invoice.taxAmount > 0) {
                    taxAccount = await getOrCreateAccount('2200', 'Tax Payable', 'liability');
                }

                if (!arAccount || !salesAccount) {
                    throw new Error("Failed to resolve critical GL accounts (AR or Sales).");
                }

                // 4. Prepare Journal Entry Items
                const journalItems = [];

                // Debit AR (Total)
                journalItems.push({
                    account_id: arAccount.id,
                    debit: invoice.total,
                    credit: 0
                });

                // Credit Sales (Subtotal)
                journalItems.push({
                    account_id: salesAccount.id,
                    debit: 0,
                    credit: invoice.subtotal
                });

                // Credit Tax (Tax Amount)
                if (invoice.taxAmount > 0 && taxAccount) {
                    journalItems.push({
                        account_id: taxAccount.id,
                        debit: 0,
                        credit: invoice.taxAmount
                    });
                } else if (invoice.taxAmount > 0) {
                    // Fallback: Add to sales if tax account couldn't be created (unlikely)
                    journalItems[1].credit += invoice.taxAmount;
                }

                // 5. Create Journal Entry
                await financeService.createJournalEntry({
                    org_id: orgId,
                    entry_date: invoice.issueDate || new Date().toISOString(),
                    description: `Invoice #${invoice.invoiceNumber} - ${invoice.customer?.name || ''}`,
                    reference: invoice.invoiceNumber,
                    status: 'posted'
                }, journalItems);

                toast.success("GL Entry posted successfully");

            } catch (glError: any) {
                console.error("Failed to post GL entry for invoice:", glError);
                toast.error(`GL Posting Failed: ${glError.message}`);
            }
        }

        return this.getInvoiceById(id);
    },

    async getFinancialMetrics() {
        // Get all invoices
        const { data: invoices, error: invoicesError } = await supabase
            .from("invoices")
            .select("status, total");

        if (invoicesError) throw invoicesError;

        // Get all expenses
        const { data: expenses, error: expensesError } = await supabase
            .from("expenses")
            .select("amount, status")
            .eq("status", "approved");

        if (expensesError) throw expensesError;

        const totalRevenue = invoices
            .filter(inv => inv.status === 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        const outstandingAmount = invoices
            .filter(inv => inv.status === 'sent' || inv.status === 'overdue')
            .reduce((sum, inv) => sum + parseFloat(inv.total), 0);

        const totalExpenses = expenses
            .reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

        return {
            totalRevenue,
            outstandingAmount,
            totalExpenses,
            profit: totalRevenue - totalExpenses
        };
    }
};
