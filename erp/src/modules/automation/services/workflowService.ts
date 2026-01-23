import type { Workflow } from "../types";

// Mock Data
const MOCK_WORKFLOWS: Workflow[] = [
    {
        id: '1',
        name: 'Welcome Email for New Leads',
        description: 'Sends a welcome email when a new lead is created.',
        isActive: true,
        trigger: 'lead_created',
        conditions: [],
        actions: [
            { id: 'a1', type: 'send_email', config: { template: 'welcome_v1', to: '{{lead.email}}' } }
        ],
        createdAt: '2024-03-10T10:00:00Z',
        updatedAt: '2024-03-10T10:00:00Z',
        runCount: 142
    },
    {
        id: '2',
        name: 'Big Deal Alert',
        description: 'Notify Sales Manager when a deal > $10k is won.',
        isActive: true,
        trigger: 'deal_won',
        conditions: [
            { field: 'value', operator: 'greater_than', value: 10000 }
        ],
        actions: [
            { id: 'a2', type: 'slack_notification', config: { channel: '#sales-wins', message: 'Big deal won!' } },
            { id: 'a3', type: 'create_task', config: { title: 'Call Customer', assignee: 'manager' } }
        ],
        createdAt: '2024-03-15T14:30:00Z',
        updatedAt: '2024-03-20T09:15:00Z',
        runCount: 5
    }
];

export const workflowService = {
    getWorkflows: async (): Promise<Workflow[]> => {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_WORKFLOWS]), 600);
        });
    },

    getWorkflowById: async (id: string): Promise<Workflow | undefined> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_WORKFLOWS.find(w => w.id === id)), 400);
        });
    },

    createWorkflow: async (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount'>): Promise<Workflow> => {
        return new Promise((resolve) => {
            const newWorkflow: Workflow = {
                ...workflow,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                runCount: 0
            };
            MOCK_WORKFLOWS.push(newWorkflow);
            setTimeout(() => resolve(newWorkflow), 800);
        });
    },

    updateWorkflow: async (id: string, updates: Partial<Workflow>): Promise<Workflow> => {
        return new Promise((resolve, reject) => {
            const index = MOCK_WORKFLOWS.findIndex(w => w.id === id);
            if (index === -1) {
                reject(new Error("Workflow not found"));
                return;
            }
            MOCK_WORKFLOWS[index] = { ...MOCK_WORKFLOWS[index], ...updates, updatedAt: new Date().toISOString() };
            setTimeout(() => resolve(MOCK_WORKFLOWS[index]), 600);
        });
    },

    deleteWorkflow: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            const index = MOCK_WORKFLOWS.findIndex(w => w.id === id);
            if (index > -1) {
                MOCK_WORKFLOWS.splice(index, 1);
            }
            setTimeout(() => resolve(), 500);
        });
    }
};
