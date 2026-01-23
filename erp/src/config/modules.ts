export type ModuleId =
    | 'overview'
    | 'crm'
    | 'hrm'
    | 'finance'
    | 'supply-chain'
    | 'manufacturing'
    | 'projects'
    | 'assets'
    | 'logistics'
    | 'quality'
    | 'analytics'
    | 'automation'
    | 'integrations'
    | 'retail'
    | 'healthcare'
    | 'construction'
    | 'marketplace'
    | 'system';

export interface ModuleConfig {
    id: ModuleId;
    name: string;
    description: string;
    defaultEnabled: boolean;
    required?: boolean;
}

export const MODULES: ModuleConfig[] = [
    // 1. Core / Overview
    {
        id: 'overview',
        name: 'Overview',
        description: 'Dashboard and Core System Overview',
        defaultEnabled: true,
        required: true
    },
    // 2. Finance
    {
        id: 'finance',
        name: 'Finance & Accounting',
        description: 'General Ledger, Invoicing, Expenses, Tax, and Banking',
        defaultEnabled: true,
    },
    // 3. HRM
    {
        id: 'hrm',
        name: 'Human Resources (HCM)',
        description: 'Employee Management, Payroll, Attendance, and Recruitment',
        defaultEnabled: true,
    },
    // 4. CRM
    {
        id: 'crm',
        name: 'Sales & CRM',
        description: 'Lead Management, Opportunities, Customers, and Sales Orders',
        defaultEnabled: true,
    },
    // 5. Projects
    {
        id: 'projects',
        name: 'Project Management',
        description: 'Project Costing, Timesheets, and Resource Allocation',
        defaultEnabled: true,
    },
    // 6. Analytics
    {
        id: 'analytics',
        name: 'BI & Analytics',
        description: 'Advanced Reporting, OLAP, and Predictive Insights',
        defaultEnabled: true,
    },
    // 7. Automation
    {
        id: 'automation',
        name: 'Workflow & Automation',
        description: 'Process Automation, Business Rules, and RPA',
        defaultEnabled: false,
    },
    // 8. Integrations
    {
        id: 'integrations',
        name: 'API & Integrations',
        description: 'Webhooks, API Management, and External Connectors',
        defaultEnabled: false,
    },

    // System
    {
        id: 'system',
        name: 'System Settings',
        description: 'Users, Roles, Security, and Configuration',
        defaultEnabled: true,
        required: true
    }
];
