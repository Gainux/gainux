import { supabase } from "@/lib/supabase";
import type { Expense } from "../types";

export const expenseService = {
    async getExpenses() {
        const { data, error } = await supabase
            .from("expenses")
            .select("*")
            .order("expense_date", { ascending: false });

        if (error) throw error;

        return data.map((expense: any) => ({
            ...expense,
            amount: parseFloat(expense.amount),
            expenseDate: expense.expense_date,
            customerId: expense.customer_id,
            receiptUrl: expense.receipt_url,
            createdBy: expense.created_by,
            createdAt: expense.created_at,
            updatedAt: expense.updated_at,
        })) as Expense[];
    },

    async getExpenseById(id: string) {
        const { data, error } = await supabase
            .from("expenses")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return {
            ...data,
            amount: parseFloat(data.amount),
            expenseDate: data.expense_date,
            customerId: data.customer_id,
            receiptUrl: data.receipt_url,
            createdBy: data.created_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        } as Expense;
    },

    async createExpense(expenseData: Partial<Expense>) {
        const { data, error } = await supabase
            .from("expenses")
            .insert([{
                title: expenseData.title,
                description: expenseData.description,
                category: expenseData.category,
                amount: expenseData.amount,
                expense_date: expenseData.expenseDate,
                vendor: expenseData.vendor,
                customer_id: expenseData.customerId,
                receipt_url: expenseData.receiptUrl,
                status: expenseData.status || 'pending',
                created_by: expenseData.createdBy,
            }])
            .select()
            .single();

        if (error) throw error;

        return this.getExpenseById(data.id);
    },

    async updateExpense(id: string, updates: Partial<Expense>) {
        const dbUpdates: any = {};

        if (updates.title) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.expenseDate) dbUpdates.expense_date = updates.expenseDate;
        if (updates.vendor) dbUpdates.vendor = updates.vendor;
        if (updates.customerId !== undefined) dbUpdates.customer_id = updates.customerId;
        if (updates.receiptUrl !== undefined) dbUpdates.receipt_url = updates.receiptUrl;
        if (updates.status) dbUpdates.status = updates.status;

        const { error } = await supabase
            .from("expenses")
            .update(dbUpdates)
            .eq("id", id);

        if (error) throw error;

        return this.getExpenseById(id);
    },

    async deleteExpense(id: string) {
        const { error } = await supabase
            .from("expenses")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async approveExpense(id: string) {
        return this.updateExpense(id, { status: 'approved' });
    },

    async rejectExpense(id: string) {
        return this.updateExpense(id, { status: 'rejected' });
    },

    async getExpensesByCategory() {
        const { data, error } = await supabase
            .from("expenses")
            .select("category, amount")
            .eq("status", "approved");

        if (error) throw error;

        const summary: Record<string, number> = {};
        data.forEach((expense: any) => {
            if (!summary[expense.category]) {
                summary[expense.category] = 0;
            }
            summary[expense.category] += parseFloat(expense.amount);
        });

        return summary;
    }
};
