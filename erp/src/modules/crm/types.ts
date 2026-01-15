export type ActivityType = "note" | "call" | "email" | "meeting" | "task";

export interface Activity {
    id: string;
    type: ActivityType;
    content: string;
    date: string; // ISO string
    relatedTo: string; // Lead or Deal ID
    status?: "pending" | "completed"; // For tasks
}

export interface Lead {
    id: string;
    name: string;
    title?: string;
    company: string;
    email: string;
    phone?: string;
    status: "new" | "contacted" | "qualified" | "lost";
    source?: "website" | "referral" | "linkedin" | "other";
    lastContacted?: string;
    tags?: string[];
    owner?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
}

export interface Requirement {
    id: string;
    title: string;
    description?: string;
}

export interface Deal {
    id: string;
    title: string;
    value: number; // Changed from string to number for analytics
    formattedValue: string;
    stage: "new" | "proposal" | "negotiation" | "won" | "lost";
    company: string;
    contactId?: string;
    expectedCloseDate?: string;
    probability?: number; // 0-100
    products?: Product[];
    customerId?: string;
    requirements?: Requirement[];
}

export interface Customer {
    id: string;
    name: string;
    company: string;
    email: string;
    status: "active" | "inactive" | "churned";
    totalRevenue: string; // Formatted currency
    lastOrderDate: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    website?: string;
}
