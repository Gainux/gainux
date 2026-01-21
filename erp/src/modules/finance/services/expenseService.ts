import { supabase } from "@/lib/supabase";
import type { Expense } from "../types";
import { financeService } from "./financeService";
import { toast } from "sonner";

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
                employee:employee_id (
                    first_name,
                    last_name,
                    email
                )
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

        return data.map((exp: any) => ({
            ...exp,
            expenseDate: exp.expense_date,
            receiptUrl: exp.receipt_url,
            rejectionReason: exp.rejection_reason,
            employeeName: exp.employee ? `${exp.employee.first_name || ''} ${exp.employee.last_name || ''}`.trim() || exp.employee.email : 'Unknown'
        })) as Expense[];
    },

    async getExpenseById(id: string) {
        const { data, error } = await supabase
            .from('expenses')
            .select(`
                *,
                employee:employee_id (
                    first_name,
                    last_name
                )
            `)
            .eq('id', id)
            .single();

        if (error) throw error;

        return {
            ...data,
            expenseDate: data.expense_date,
            receiptUrl: data.receipt_url,
            rejectionReason: data.rejection_reason,
        } as Expense;
    },

    async createExpense(expense: Partial<Expense> & { org_id: string }) {
        // Map to DB columns
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error("Not authenticated");

        const dbExpense = {
            org_id: expense.org_id,
            employee_id: user.user.id, // Current user
            title: expense.title,
            description: expense.description,
            category: expense.category,
            amount: expense.amount,
            expense_date: expense.expenseDate,
            vendor: expense.vendor,
            receipt_url: expense.receiptUrl,
            status: 'pending',
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
        if (expense.receiptUrl) dbExpense.receipt_url = expense.receiptUrl;

        // Status updates should go through approve/reject methods
        // if (expense.status) dbExpense.status = expense.status;

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
            .eq('id', id); // RLS will handle permission checks

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

    async approveExpense(id: string, orgId: string) {
        // 1. Update Status
        const { data: expense, error: fetchError } = await supabase
            .from('expenses')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;
        if (expense.status === 'approved') return; // Already approved

        const { error: updateError } = await supabase
            .from('expenses')
            .update({ status: 'approved' })
            .eq('id', id);

        if (updateError) throw updateError;

        // 2. GL Posting Logic (Cash Basis for MVP - Credit Cash, Debit Expense)
        // In a real system, you might separate Approval (Accrual) from Reimbursement (Cash Out).
        // Let's assume Approval = Reimbursement for MVP simplicity.

        try {
            const accounts = await financeService.getAccounts(orgId);

            // Get or Create "Cash on Hand" (1001) or "Petty Cash"
            let cashAccount = accounts.find(a => a.code === '1000' || a.name.includes('Cash'));
            if (!cashAccount) {
                // Fallback: Create default cash account
                cashAccount = await financeService.createAccount({
                    org_id: orgId,
                    code: '1000',
                    name: 'Cash on Hand',
                    type: 'asset',
                    currency: 'INR',
                    is_active: true
                });
            }

            // Get or Create Expense Account based on category (Simple mapping)
            // Default generic expense '5000' if no specific match
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
            await financeService.createJournalEntry({
                org_id: orgId,
                entry_date: new Date().toISOString().split('T')[0],
                description: `Expense Approval: ${expense.title} (${expense.vendor})`,
                reference: `EXP-${expense.id.slice(0, 8)}`,
                status: 'posted'
            }, [
                {
                    account_id: expenseAccount!.id,
                    debit: expense.amount,
                    credit: 0,
                    description: expense.description || expense.title
                },
                {
                    account_id: cashAccount!.id,
                    debit: 0,
                    credit: expense.amount,
                    description: 'Reimbursement'
                }
            ]);

            toast.success("Expense Approved and Posted to GL");

        } catch (glError) {
            console.error("GL Posting failed for expense", glError);
            toast.error("Expense approved but GL posting failed.");
        }
    },

    async rejectExpense(id: string, reason: string) {
        const { error } = await supabase
            .from('expenses')
            .update({ status: 'rejected', rejection_reason: reason })
            .eq('id', id);

        if (error) throw error;
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
