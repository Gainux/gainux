import { supabase } from "@/lib/supabase";
import type { Invoice, InvoiceItem } from "../types";

export const invoiceService = {
    async getInvoices() {
        const { data, error } = await supabase
            .from("invoices")
            .select(`
                *,
                invoice_items(*)
            `)
            .order("created_at", { ascending: false });

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
                customers(name, email, company)
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
            customer: data.customers
        } as Invoice & { customer: any };
    },

    async createInvoice(invoiceData: Partial<Invoice>, items: Partial<InvoiceItem>[]) {
        // Generate invoice number
        const { data: invoiceNumberData, error: numberError } = await supabase
            .rpc('generate_invoice_number');

        if (numberError) throw numberError;

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from("invoices")
            .insert([{
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

            // Insert new items
            if (items.length > 0) {
                await supabase
                    .from("invoice_items")
                    .insert(items.map(item => ({
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
