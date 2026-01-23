export type TriggerType = 'deal_created' | 'deal_won' | 'lead_created' | 'invoice_overdue' | 'task_assigned';
export type ActionType = 'send_email' | 'create_task' | 'slack_notification' | 'update_field';

export interface WorkflowCondition {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: string | number | boolean;
}

export interface WorkflowAction {
    id: string;
    type: ActionType;
    config: Record<string, any>; // JSON configuration for the action
}

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    trigger: TriggerType;
    conditions: WorkflowCondition[];
    actions: WorkflowAction[];
    createdAt: string;
    updatedAt: string;
    lastRunAt?: string;
    runCount: number;
}
