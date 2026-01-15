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
    title: string;
    description?: string;
    category: 'office' | 'travel' | 'equipment' | 'utilities' | 'marketing' | 'other';
    amount: number;
    expenseDate: string;
    vendor: string;
    customerId?: string;
    receiptUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdBy?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface FinancialMetrics {
    totalRevenue: number;
    outstandingAmount: number;
    totalExpenses: number;
    profit: number;
}
