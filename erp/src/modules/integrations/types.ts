export interface ConnectedApp {
    id: string;
    name: string;
    description: string;
    icon: string; // URL or Lucide icon name
    isConnected: boolean;
    connectedAt?: string;
    config?: Record<string, any>;
}

export interface ApiKey {
    id: string;
    name: string;
    keyPrefix: string; // e.g., "pk_live_..."
    createdAt: string;
    lastUsedAt?: string;
    status: 'active' | 'revoked';
}

export interface Webhook {
    id: string;
    url: string;
    events: string[]; // e.g., ['deal.created', 'invoice.paid']
    isActive: boolean;
    secret: string; // For signature verification
    createdAt: string;
    failureCount: number;
}
