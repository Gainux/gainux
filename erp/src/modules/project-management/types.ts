export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectRole = 'manager' | 'developer' | 'designer' | 'tester' | 'member';

export interface Project {
    id: string;
    name: string;
    description: string | null;
    clientId: string | null;
    client?: {
        id: string;
        name: string;
    };
    status: ProjectStatus;
    startDate: string | null; // ISO Date string
    endDate: string | null;   // ISO Date string
    budget: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProjectMember {
    id: string;
    projectId: string;
    employeeId: string;
    employee?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        avatarUrl?: string;
    };
    role: ProjectRole;
    joinedAt: string;
}

export interface Task {
    id: string;
    projectId: string;
    project?: {
        id: string;
        name: string;
    };
    assigneeId: string | null;
    assignee?: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string;
    };
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
    createdAt: string;
    updatedAt: string;
}
