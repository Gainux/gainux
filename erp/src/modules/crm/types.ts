
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
    address?: string;
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

export interface Deal {
    id: string;
    orgId: string;
    title: string;
    value: number;
    currency: string;
    stage: string; // 'lead' | 'proposal' | 'negotiation' | 'won' | 'lost'
    probability: number;
    expectedCloseDate?: string;
    leadId?: string;
    lead?: Lead;
    companyId?: string;
    company?: Company;
    contactId?: string;
    contact?: Contact;
    ownerId?: string;
    owner?: {
        id: string;
        firstName: string;
        lastName: string;
    };
    createdAt: string;
    updatedAt: string;
    requirements?: any[];
}

export interface CRMActivity {
    id: string;
    orgId: string;
    type: string; // 'Call', 'Email', 'Meeting', 'Note'
    subject?: string;
    description?: string;
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
    createdAt: string;
}

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
