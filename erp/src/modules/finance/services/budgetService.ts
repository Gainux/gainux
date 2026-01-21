
import { supabase } from '@/lib/supabase';
import type { Budget, BudgetItem } from '../types';

export const budgetService = {
    getBudgets: async (orgId: string): Promise<Budget[]> => {
        // Map DB columns to frontend types if necessary, but supabase types are usually exact matches
        // We defined startDate/endDate in types, but DB has start_date/end_date.
        // We should use .select() allowing auto-mapping if we typed the client, or map manually.
        // For now, let's assume direct mapping or consistent naming.
        // Wait, the types I added used camelCase: startDate, endDate.
        // Supabase returns snake_case.

        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('org_id', orgId)
            .order('start_date', { ascending: false });

        if (error) throw error;

        return (data || []).map((b: any) => ({
            ...b,
            startDate: b.start_date,
            endDate: b.end_date
        }));
    },

    getBudgetById: async (id: string): Promise<Budget & { items: BudgetItem[] }> => {
        const { data, error } = await supabase
            .from('budgets')
            .select(`
        *,
        items:budget_items (
            *,
            account:accounts (
                id,
                name,
                code,
                type
            )
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;

        const budget = {
            ...data,
            startDate: data.start_date,
            endDate: data.end_date,
            items: data.items.map((i: any) => ({
                ...i,
                account: i.account
            }))
        };
        return budget;
    },

    createBudget: async (budget: Partial<Budget> & { org_id: string }): Promise<Budget> => {
        const dbPayload = {
            org_id: budget.org_id,
            name: budget.name,
            description: budget.description,
            start_date: budget.startDate,
            end_date: budget.endDate,
            created_by: budget.created_by
        };

        const { data, error } = await supabase
            .from('budgets')
            .insert([dbPayload])
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            startDate: data.start_date,
            endDate: data.end_date
        };
    },

    addBudgetItem: async (item: Partial<BudgetItem>): Promise<BudgetItem> => {
        const { data, error } = await supabase
            .from('budget_items')
            .insert([item])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateBudgetItem: async (id: string, amount: number): Promise<BudgetItem> => {
        const { data, error } = await supabase
            .from('budget_items')
            .update({ amount })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteBudget: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('budgets')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
