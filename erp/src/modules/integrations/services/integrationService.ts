import type { ConnectedApp, ApiKey, Webhook } from "../types";

const MOCK_APPS: ConnectedApp[] = [
    { id: 'slack', name: 'Slack', description: 'Send notifications to Slack channels.', icon: 'slack', isConnected: false },
    { id: 'gmail', name: 'Google Workspace', description: 'Sync emails and calendar events.', icon: 'mail', isConnected: true, connectedAt: '2024-01-15T10:00:00Z' },
    { id: 'stripe', name: 'Stripe', description: 'Process payments and sync invoices.', icon: 'credit-card', isConnected: false },
    { id: 'aws', name: 'AWS S3', description: 'Store documents in your S3 bucket.', icon: 'cloud', isConnected: false },
];

const MOCK_KEYS: ApiKey[] = [
    { id: 'k1', name: 'Production Backend', keyPrefix: 'pk_live_837...', createdAt: '2024-01-01T00:00:00Z', status: 'active', lastUsedAt: '2024-03-20T10:30:00Z' },
    { id: 'k2', name: 'Test Key', keyPrefix: 'pk_test_921...', createdAt: '2024-02-15T00:00:00Z', status: 'revoked' },
];

const MOCK_WEBHOOKS: Webhook[] = [];

export const integrationService = {
    // Apps
    getConnectedApps: async (): Promise<ConnectedApp[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...MOCK_APPS]), 500));
    },
    toggleAppConnection: async (id: string, isConnected: boolean): Promise<void> => {
        return new Promise(resolve => {
            const app = MOCK_APPS.find(a => a.id === id);
            if (app) {
                app.isConnected = isConnected;
                app.connectedAt = isConnected ? new Date().toISOString() : undefined;
            }
            setTimeout(resolve, 500);
        });
    },

    // API Keys
    getApiKeys: async (): Promise<ApiKey[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...MOCK_KEYS]), 400));
    },
    createApiKey: async (name: string): Promise<ApiKey> => {
        return new Promise(resolve => {
            const newKey: ApiKey = {
                id: crypto.randomUUID(),
                name,
                keyPrefix: `pk_live_${Math.random().toString(36).substring(7)}...`,
                createdAt: new Date().toISOString(),
                status: 'active'
            };
            MOCK_KEYS.unshift(newKey);
            setTimeout(() => resolve(newKey), 600);
        });
    },
    revokeApiKey: async (id: string): Promise<void> => {
        return new Promise(resolve => {
            const key = MOCK_KEYS.find(k => k.id === id);
            if (key) key.status = 'revoked';
            setTimeout(resolve, 300);
        });
    },

    // Webhooks
    getWebhooks: async (): Promise<Webhook[]> => {
        return new Promise(resolve => setTimeout(() => resolve([...MOCK_WEBHOOKS]), 400));
    },
    createWebhook: async (url: string, events: string[]): Promise<Webhook> => {
        return new Promise(resolve => {
            const newHook: Webhook = {
                id: crypto.randomUUID(),
                url,
                events,
                isActive: true,
                secret: 'whsec_' + Math.random().toString(36).substring(7),
                createdAt: new Date().toISOString(),
                failureCount: 0
            };
            MOCK_WEBHOOKS.push(newHook);
            setTimeout(() => resolve(newHook), 600);
        });
    },
    deleteWebhook: async (id: string): Promise<void> => {
        return new Promise(resolve => {
            const idx = MOCK_WEBHOOKS.findIndex(w => w.id === id);
            if (idx > -1) MOCK_WEBHOOKS.splice(idx, 1);
            setTimeout(resolve, 400);
        });
    }
};
