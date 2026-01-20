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
    // 5. Procurement
    {
        id: 'supply-chain',
        name: 'Procurement & Supply Chain',
        description: 'Vendor Management, Purchase Orders, and Inventory',
        defaultEnabled: false,
    },
    // 6. Manufacturing
    {
        id: 'manufacturing',
        name: 'Manufacturing',
        description: 'Production Planning, BOM, Shop Floor, and Quality Control',
        defaultEnabled: false,
    },
    // 7. Projects
    {
        id: 'projects',
        name: 'Project Management',
        description: 'Project Costing, Timesheets, and Resource Allocation',
        defaultEnabled: true,
    },
    // 8. Assets
    {
        id: 'assets',
        name: 'Asset Management (EAM)',
        description: 'Asset Lifecycle, Maintenance, and Work Orders',
        defaultEnabled: false,
    },
    // 9. Logistics
    {
        id: 'logistics',
        name: 'Logistics & Distribution',
        description: 'Fleet Management, Route Planning, and Shipping',
        defaultEnabled: false,
    },
    // 10. Quality
    {
        id: 'quality',
        name: 'Quality & Compliance',
        description: 'QMS, Audits, Risk Management, and Compliance',
        defaultEnabled: false,
    },
    // 11. Analytics
    {
        id: 'analytics',
        name: 'BI & Analytics',
        description: 'Advanced Reporting, OLAP, and Predictive Insights',
        defaultEnabled: true,
    },
    // 12. Automation
    {
        id: 'automation',
        name: 'Workflow & Automation',
        description: 'Process Automation, Business Rules, and RPA',
        defaultEnabled: false,
    },
    // 13. Integration / Marketplace
    {
        id: 'marketplace',
        name: 'Marketplace & Add-ons',
        description: 'Extensions, Plugins, and Third-party Integrations',
        defaultEnabled: true,
    },
    {
        id: 'integrations',
        name: 'API & Integrations',
        description: 'Webhooks, API Management, and External Connectors',
        defaultEnabled: false,
    },
    // 15. Industry Specific
    {
        id: 'retail',
        name: 'Retail & POS',
        description: 'Point of Sale, Loyalty, and Store Management',
        defaultEnabled: false,
    },
    {
        id: 'healthcare',
        name: 'Healthcare (HIS)',
        description: 'Patient Management, EMR Lite, and Clinic Operations',
        defaultEnabled: false,
    },
    {
        id: 'construction',
        name: 'Construction',
        description: 'BOQ, Contracts, and Site Management',
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
