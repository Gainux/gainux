export interface Invoice {
    id: string;
    invoiceNumber: string;
    customerId?: string;
    dealId?: string;
    issueDate: string;
    dueDate: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    currency: string;
    notes?: string;
    items?: InvoiceItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface InvoiceItem {
    id: string;
    invoiceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    createdAt?: string;
}

export interface Expense {
    id: string;
    org_id: string;
    employee_id: string; // profile_id
    title: string;
    description?: string;
    category: string;
    amount: number;
    expenseDate: string; // expense_date
    vendor: string;
    receiptUrl?: string; // receipt_url
    status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
    rejectionReason?: string; // rejection_reason
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
    employeeName?: string; // For display
}

export interface FinancialMetrics {
    totalRevenue: number;
    outstandingAmount: number;
    totalExpenses: number;
    profit: number;
}

// General Ledger Types

export interface Account {
    id: string;
    org_id: string;
    code: string;
    name: string;
    type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
    subtype?: string;
    parent_id?: string | null;
    currency: string;
    is_active: boolean;
    current_balance?: number; // Calculated/Cached
    created_at: string;
    updated_at: string;
    children?: Account[]; // For tree view
}

export interface JournalEntry {
    id: string;
    org_id: string;
    entry_date: string;
    description: string;
    reference?: string;
    status: 'draft' | 'posted';
    created_by?: string;
    created_at: string;
    updated_at: string;
    items?: JournalEntryItem[];
}

export interface JournalEntryItem {
    id: string;
    journal_id: string;
    account_id: string;
    debit: number;
    credit: number;
    description?: string;
    created_at?: string;
    account?: Account; // Joined for display
}

export interface AccountTypeOption {
    value: string;
    label: string;
}

import type { Vendor } from "@/modules/procurement/types";

export type { Vendor };

export interface Bill {
    id: string;
    org_id: string;
    vendor_id: string;
    billNumber: string; // bill_number
    vendorInvoiceNumber?: string; // vendor_invoice_number
    issueDate: string; // issue_date
    dueDate: string; // due_date
    status: 'draft' | 'open' | 'paid' | 'overdue' | 'void';
    currency: string;
    subtotal: number;
    taxRate: number; // tax_rate
    taxAmount: number; // tax_amount
    total: number; // total_amount
    notes?: string;
    items?: BillItem[];
    created_at: string;
    updated_at: string;
    vendor?: Vendor; // For display
}

export interface BillItem {
    id: string;
    billId: string; // bill_id
    description: string;
    quantity: number;
    unitPrice: number; // unit_price
    amount: number;
    expenseAccountId?: string; // expense_account_id
    created_at?: string;
}

export interface BankAccount {
    id: string;
    org_id: string;
    accountName: string; // account_name
    accountNumber?: string; // account_number
    bankName?: string; // bank_name
    currency: string;
    balance: number;
    glAccountId?: string; // gl_account_id
    isActive: boolean; // is_active
    created_at?: string;
    updated_at?: string;
}

export const ACCOUNT_TYPES: AccountTypeOption[] = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expense' },
];

export interface Budget {
    id: string;
    org_id: string;
    name: string;
    description?: string;
    startDate: string; // start_date in DB, mapped
    endDate: string;   // end_date in DB, mapped
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface BudgetItem {
    id: string;
    budget_id: string;
    account_id: string;
    amount: number;
    period_type: 'total' | 'monthly';
    created_at?: string;
    updated_at?: string;
    account?: Account;
}

export interface FixedAsset {
    id: string;
    org_id: string;
    assetName: string; // asset_name
    assetCode?: string; // asset_code
    description?: string;
    purchaseDate: string; // purchase_date
    purchaseCost: number; // purchase_cost
    salvageValue: number; // salvage_value
    usefulLifeYears: number; // useful_life_years
    depreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE'; // depreciation_method
    status: 'active' | 'disposed' | 'written_off';
    currentValue?: number; // current_value
    accumulatedDepreciation?: number; // accumulated_depreciation
    created_at?: string;
    updated_at?: string;
}

export interface DepreciationScheduleItem {
    year: number;
    openingValue: number;
    depreciationAmount: number;
    closingValue: number;
}
