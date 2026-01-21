import { supabase } from '../../../lib/supabase';
import { financeService } from './financeService';
import type { BankAccount, JournalEntry } from '../types';

export const bankService = {

    async getBankAccounts(orgId: string): Promise<BankAccount[]> {
        const { data, error } = await supabase
            .from('bank_accounts')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Map snake_case to camelCase
        return data.map((item: any) => ({
            id: item.id,
            org_id: item.org_id,
            accountName: item.account_name,
            accountNumber: item.account_number,
            bankName: item.bank_name,
            currency: item.currency,
            balance: item.balance,
            glAccountId: item.gl_account_id,
            isActive: item.is_active,
            created_at: item.created_at,
            updated_at: item.updated_at
        }));
    },

    async createBankAccount(data: Partial<BankAccount> & { org_id: string }): Promise<BankAccount> {
        // 1. Create a corresponding GL Account (Asset)
        const glAccountCode = `BANK-${Date.now().toString().slice(-6)}`; // Simple unique code generator

        const glAccount = await financeService.createAccount({
            org_id: data.org_id,
            code: glAccountCode,
            name: `${data.bankName || 'Bank'} - ${data.accountName}`,
            type: 'asset',
            subtype: 'cash', // cash/bank
            currency: data.currency || 'USD',
            is_active: true
        });

        // 2. Create Bank Account linked to GL
        const dbEntry = {
            org_id: data.org_id,
            account_name: data.accountName,
            account_number: data.accountNumber,
            bank_name: data.bankName,
            currency: data.currency || 'USD',
            balance: data.balance || 0,
            gl_account_id: glAccount.id,
            is_active: true
        };

        const { data: newBank, error } = await supabase
            .from('bank_accounts')
            .insert(dbEntry)
            .select()
            .single();

        if (error) throw error;

        // TODO: If balance > 0, we should technically create an opening balance journal entry
        // For now, we trust the user set the simpler 'balance' field.

        return {
            ...newBank,
            accountName: newBank.account_name,
            accountNumber: newBank.account_number,
            bankName: newBank.bank_name,
            glAccountId: newBank.gl_account_id,
            isActive: newBank.is_active
        };
    },

    async transferFunds(
        orgId: string,
        fromAccountId: string,
        toAccountId: string,
        amount: number,
        date: string,
        description?: string
    ) {
        // ... (existing transfer logic)
        // 1. Get Accounts to find GL IDs
        const { data: accounts } = await supabase
            .from('bank_accounts')
            .select('id, gl_account_id, account_name, balance')
            .in('id', [fromAccountId, toAccountId]);

        const fromAcc = accounts?.find((a: any) => a.id === fromAccountId);
        const toAcc = accounts?.find((a: any) => a.id === toAccountId);

        if (!fromAcc || !toAcc) throw new Error("Invalid accounts for transfer");
        if (!fromAcc.gl_account_id || !toAcc.gl_account_id) throw new Error("Bank accounts are not linked to GL");

        // 2. Create Journal Entry
        // Credit From (Decrease Asset), Debit To (Increase Asset)
        const journal = await financeService.createJournalEntry(
            {
                org_id: orgId,
                entry_date: date,
                description: description || `Transfer from ${fromAcc.account_name} to ${toAcc.account_name}`,
                reference: `TRF-${Date.now()}`,
                status: 'posted'
            },
            [
                {
                    account_id: fromAcc.gl_account_id,
                    credit: amount,
                    debit: 0,
                    description: "Internal Transfer (Out)"
                },
                {
                    account_id: toAcc.gl_account_id,
                    debit: amount,
                    credit: 0,
                    description: "Internal Transfer (In)"
                }
            ]
        );

        // 3. Update Cached Balances (for quick UI access)
        await supabase.rpc('update_bank_balance', { p_id: fromAccountId, p_amount: -amount });
        await supabase.rpc('update_bank_balance', { p_id: toAccountId, p_amount: amount });

        // Simple update approach for MVP (Potential race condition but fine for single user demo):
        await supabase.from('bank_accounts').update({ balance: Number(fromAcc.balance) - amount }).eq('id', fromAccountId);
        await supabase.from('bank_accounts').update({ balance: Number(toAcc.balance) + amount }).eq('id', toAccountId);

        return journal;
    },

    async getBankTransactions(orgId: string, glAccountId: string) {
        // Fetch all journal items for this GL Account to build history
        const { data, error } = await supabase
            .from('journal_entry_items')
            .select(`
                *,
                journal_entry:journal_entries(*)
            `)
            .eq('account_id', glAccountId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Flatten and Format
        return data.map((item: any) => {
            const debit = Number(item.debit || 0);
            const credit = Number(item.credit || 0);
            const amount = debit - credit; // Asset: Debit is +, Credit is -

            return {
                id: item.id,
                date: item.journal_entry.entry_date,
                description: item.journal_entry.description || item.description,
                reference: item.journal_entry.reference,
                amount: amount,
                type: amount >= 0 ? 'deposit' : 'withdrawal'
            };
        });
    }
};
