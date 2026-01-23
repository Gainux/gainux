
export type CRMStatus = 'new' | 'contacted' | 'qualified' | 'lost' | 'lead' | 'proposal' | 'negotiation' | 'won';

export interface Lead {
    id: string;
    orgId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    companyName?: string;
    source?: string;
    status: string; // 'new' | 'contacted' | 'qualified' | 'lost'
    ownerId?: string;
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    notes?: string;

    // Compatibility fields
    name?: string;
    title?: string;
    company?: string;
    lastContacted?: string;

    createdAt: string;
    updatedAt: string;
}

export interface Company {
    id: string;
    orgId: string;
    name: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string; // Kept for backward compat if needed, but city/state/zip prefered

    // Detailed address fields
    city?: string;
    state?: string;
    zip?: string;
    country?: string;

    // Metrics
    status?: string | 'active' | 'inactive';
    totalRevenue?: number; // Should be number, service might be using string or formatting it
    lastOrderDate?: string;

    createdAt: string;
    updatedAt: string;
}

export interface Contact {
    id: string;
    orgId: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    position?: string;
    companyId?: string;
    company?: Company;
    createdAt: string;
    updatedAt: string;
}

export type Customer = Company;

export interface Requirement {
    id: string;
    title: string; // Added title
    description: string;
    priority: 'low' | 'medium' | 'high';
}

export interface Deal {
    id: string;
    orgId: string;
    title: string;
    value: number;
    currency: string;
    stage: string;
    probability: number;
    quantity?: number;
    expectedCloseDate?: string;
    leadId?: string;
    lead?: Lead;
    companyId?: string;
    company?: Company;
    contactId?: string;
    contact?: Contact;
    customerId?: string;
    ownerId?: string;
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
    requirements?: Requirement[];
}

export interface Activity {
    id: string;
    orgId: string;
    type: string;
    subject?: string;
    description?: string; // Used as content
    dueDate?: string;
    completed: boolean;
    dealId?: string;
    leadId?: string;
    contactId?: string;
    performedBy?: string;
    performer?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string; // Used as date

    // Virtual fields for UI compatibility if needed, but prefer mapping in component
    content?: string;
    date?: string;
}

export interface CRMActivity extends Activity { }

export interface QuoteItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Quote {
    id: string;
    orgId: string;
    quoteNumber: string;
    dealId?: string;
    deal?: Deal;
    companyId?: string;
    company?: Company;
    contactId?: string;
    contact?: Contact;
    issueDate?: string;
    validUntil?: string;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    totalAmount: number;
    currency: string;
    notes?: string;
    items: QuoteItem[];
    createdAt: string;
    updatedAt: string;
}
