import { supabase } from "@/lib/supabase";
import type { Expense } from "../types";

export const expenseService = {
    async getExpenses(filters?: {
        category?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        let query = supabase
            .from('expenses')
            .select(`
                *,
                customer:customers(name)
            `)
            .order('expense_date', { ascending: false });

        if (filters?.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters?.startDate) {
            query = query.gte('expense_date', filters.startDate.toISOString());
        }

        if (filters?.endDate) {
            query = query.lte('expense_date', filters.endDate.toISOString());
        }

        const { data, error } = await query;
        if (error) throw error;
        return data;
    },

    async getExpenseById(id: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
                *,
                customer:customers(name)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createExpense(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) {
        // Map camelCase to snake_case for DB
        const dbExpense = {
            title: expense.title,
            description: expense.description,
            category: expense.category,
            amount: expense.amount,
            expense_date: expense.expenseDate,
            vendor: expense.vendor,
            customer_id: expense.customerId,
            receipt_url: expense.receiptUrl,
            status: expense.status,
        };

        const { data, error } = await supabase
            .from('expenses')
            .insert(dbExpense)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateExpense(id: string, expense: Partial<Expense>) {
        const dbExpense: any = {};
        if (expense.title) dbExpense.title = expense.title;
        if (expense.description) dbExpense.description = expense.description;
        if (expense.category) dbExpense.category = expense.category;
        if (expense.amount) dbExpense.amount = expense.amount;
        if (expense.expenseDate) dbExpense.expense_date = expense.expenseDate;
        if (expense.vendor) dbExpense.vendor = expense.vendor;
        if (expense.customerId) dbExpense.customer_id = expense.customerId;
        if (expense.receiptUrl) dbExpense.receipt_url = expense.receiptUrl;
        if (expense.status) dbExpense.status = expense.status;

        const { data, error } = await supabase
            .from('expenses')
            .update(dbExpense)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteExpense(id: string) {
        const { error } = await supabase
            .from('expenses')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async uploadReceipt(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    async getExpenseMetrics() {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Parallel fetching for dashboard metrics
        const [totalResult, pendingResult, categoryResult] = await Promise.all([
            // Total this month
            supabase
                .from('expenses')
                .select('amount')
                .gte('expense_date', firstDayOfMonth),

            // Total pending
            supabase
                .from('expenses')
                .select('amount')
                .eq('status', 'pending'),

            // All expenses for breakdown (could be optimized)
            supabase
                .from('expenses')
                .select('category, amount')
        ]);

        const totalThisMonth = totalResult.data?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
        const totalPending = pendingResult.data?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

        const categoryBreakdown = categoryResult.data?.reduce((acc: any, item) => {
            acc[item.category] = (acc[item.category] || 0) + (Number(item.amount) || 0);
            return acc;
        }, {}) || {};

        return {
            totalThisMonth,
            totalPending,
            categoryBreakdown
        };
    }
};
