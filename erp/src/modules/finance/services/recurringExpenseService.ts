import { supabase } from "@/lib/supabase";
import type { RecurringExpense, RecurringFrequency, RecurringStatus } from "../types";

const mapRow = (row: any): RecurringExpense => ({
    id: row.id,
    org_id: row.org_id,
    vendor_id: row.vendor_id,
    description: row.description,
    amount: Number(row.amount) || 0,
    currency: row.currency || "INR",
    frequency: row.frequency as RecurringFrequency,
    payment_day: row.payment_day,
    start_date: row.start_date,
    end_date: row.end_date ?? undefined,
    occurrences: row.occurrences ?? undefined,
    occurrences_completed: row.occurrences_completed ?? 0,
    status: row.status as RecurringStatus,
    tax_rate: Number(row.tax_rate) || 0,
    notes: row.notes ?? undefined,
    next_payment_date: row.next_payment_date ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    vendor: row.companies ? { id: row.companies.id, name: row.companies.name } : undefined,
});

export const recurringExpenseService = {
    async getAll(orgId: string): Promise<RecurringExpense[]> {
        const { data, error } = await supabase
            .from("recurring_expenses")
            .select("*, companies(id, name)")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false });

        if (error) throw error;
        return (data || []).map(mapRow);
    },

    async create(
        orgId: string,
        payload: Omit<RecurringExpense, "id" | "org_id" | "occurrences_completed" | "created_at" | "updated_at" | "vendor">
    ): Promise<RecurringExpense> {
        const { data, error } = await supabase
            .from("recurring_expenses")
            .insert({
                org_id: orgId,
                vendor_id: payload.vendor_id,
                description: payload.description,
                amount: payload.amount,
                currency: payload.currency || "INR",
                frequency: payload.frequency,
                payment_day: payload.payment_day,
                start_date: payload.start_date,
                end_date: payload.end_date || null,
                occurrences: payload.occurrences || null,
                occurrences_completed: 0,
                status: payload.status || "active",
                tax_rate: payload.tax_rate || 0,
                notes: payload.notes || null,
                next_payment_date: payload.next_payment_date || null,
            })
            .select("*, companies(id, name)")
            .single();

        if (error) throw error;
        return mapRow(data);
    },

    async update(
        id: string,
        payload: Partial<Omit<RecurringExpense, "id" | "org_id" | "vendor" | "created_at" | "updated_at">>
    ): Promise<RecurringExpense> {
        const updates: any = {};
        if (payload.vendor_id !== undefined) updates.vendor_id = payload.vendor_id;
        if (payload.description !== undefined) updates.description = payload.description;
        if (payload.amount !== undefined) updates.amount = payload.amount;
        if (payload.currency !== undefined) updates.currency = payload.currency;
        if (payload.frequency !== undefined) updates.frequency = payload.frequency;
        if (payload.payment_day !== undefined) updates.payment_day = payload.payment_day;
        if (payload.start_date !== undefined) updates.start_date = payload.start_date;
        if (payload.end_date !== undefined) updates.end_date = payload.end_date || null;
        if (payload.occurrences !== undefined) updates.occurrences = payload.occurrences || null;
        if (payload.status !== undefined) updates.status = payload.status;
        if (payload.tax_rate !== undefined) updates.tax_rate = payload.tax_rate;
        if (payload.notes !== undefined) updates.notes = payload.notes || null;
        if (payload.next_payment_date !== undefined) updates.next_payment_date = payload.next_payment_date || null;

        const { data, error } = await supabase
            .from("recurring_expenses")
            .update(updates)
            .eq("id", id)
            .select("*, companies(id, name)")
            .single();

        if (error) throw error;
        return mapRow(data);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from("recurring_expenses")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async updateStatus(id: string, status: RecurringStatus): Promise<RecurringExpense> {
        return this.update(id, { status });
    },
};
