import { supabase } from '../../../lib/supabase';
import type { Account, JournalEntry, JournalEntryItem } from '../types';

export const financeService = {
    // --- Chart of Accounts ---

    async getAccounts(orgId: string): Promise<Account[]> {
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .eq('org_id', orgId)
            .order('code', { ascending: true });

        if (error) throw error;
        return data as Account[];
    },

    async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<Account> {
        const { data, error } = await supabase
            .from('accounts')
            .insert(account)
            .select()
            .single();

        if (error) throw error;
        return data as Account;
    },

    async updateAccount(id: string, updates: Partial<Account>): Promise<Account> {
        const { data, error } = await supabase
            .from('accounts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Account;
    },

    async deleteAccount(id: string): Promise<void> {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- Journal Entries ---

    async getJournalEntries(orgId: string): Promise<JournalEntry[]> {
        const { data, error } = await supabase
            .from('journal_entries')
            .select(`
        *,
        items:journal_entry_items(*)
      `)
            .eq('org_id', orgId)
            .order('entry_date', { ascending: false });

        if (error) throw error;
        return data as JournalEntry[];
    },

    async deleteJournalEntry(id: string): Promise<void> {
        // Items cascade delete usually, but let's be safe or rely on DB constraint
        // existing schema says: journal_id uuid references public.journal_entries(id) on delete cascade not null
        // So deleting header is enough.
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async createJournalEntry(
        entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at' | 'items'>,
        items: Omit<JournalEntryItem, 'id' | 'journal_id' | 'created_at'>[]
    ): Promise<JournalEntry> {
        // 1. Validate Debits = Credits
        const totalDebit = items.reduce((sum, item) => sum + Number(item.debit), 0);
        const totalCredit = items.reduce((sum, item) => sum + Number(item.credit), 0);

        // Allow small float point diffs
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Journal Entry is not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}`);
        }

        // 2. Start Transaction (Supabase RPC would be better, but doing client-side for now)
        // Create Header
        const { data: journalData, error: journalError } = await supabase
            .from('journal_entries')
            .insert(entry)
            .select()
            .single();

        if (journalError) throw journalError;

        // Create Items
        const itemsWithJournalId = items.map(item => ({
            ...item,
            journal_id: journalData.id,
        }));

        const { error: itemsError } = await supabase
            .from('journal_entry_items')
            .insert(itemsWithJournalId);

        if (itemsError) {
            // Rollback header if items fail (Best effort cleanup)
            await supabase.from('journal_entries').delete().eq('id', journalData.id);
            throw itemsError;
        }

        return journalData as JournalEntry;
    },
    async getTrialBalance(orgId: string): Promise<Account[]> {
        // 1. Fetch all accounts
        const { data: accounts, error: accountsError } = await supabase
            .from('accounts')
            .select('*')
            .eq('org_id', orgId)
            .order('code', { ascending: true });

        if (accountsError) throw accountsError;

        // 2. Fetch all journal items for this org (filtering by posted status would require join)
        // For MVP, we can join journal_entry_items with journal_entries to filter by status='posted'
        // But doing a deep query: accounts -> items(journal_id) is one way, but iterating is better for sums.

        // Let's do: Fetch Posted Journal Entries along with their items
        const { data: postedEntries, error: journalsError } = await supabase
            .from('journal_entries')
            .select(`
                id,
                items:journal_entry_items(account_id, debit, credit)
            `)
            .eq('org_id', orgId)
            .eq('status', 'posted');

        if (journalsError) throw journalsError;

        // 3. Aggregate Balances
        const accountBalances: Record<string, number> = {};

        // Flat mapping items
        postedEntries?.forEach((entry: any) => {
            entry.items?.forEach((item: any) => {
                const debit = Number(item.debit || 0);
                const credit = Number(item.credit || 0);
                const net = debit - credit;

                accountBalances[item.account_id] = (accountBalances[item.account_id] || 0) + net;
            });
        });

        // 4. Merge with accounts
        return (accounts as Account[]).map(acc => ({
            ...acc,
            current_balance: accountBalances[acc.id] || 0
        }));
    },
};
