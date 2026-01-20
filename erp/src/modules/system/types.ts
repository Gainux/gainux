export type UserRole = 'admin' | 'manager' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface Organization {
    id: string;
    name: string;
    slug: string;
    currency: string;
    tax_id?: string;
    address?: any;
    settings?: any;
    created_at: string;
    updated_at?: string;
}

export interface Branch {
    id: string;
    org_id: string;
    name: string;
    code?: string;
    address?: any;
    is_main: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AuditLog {
    id: string;
    org_id: string;
    user_id: string;
    action: string;
    entity: string;
    entity_id: string;
    details: any;
    ip_address?: string;
    created_at: string;
}

export interface SystemUser {
    id: string;
    auth_id: string;
    email: string;
    full_name?: string | null;
    role: UserRole;
    avatar_url?: string | null;
    status: UserStatus;
    org_id?: string;
    branch_id?: string;
    is_super_admin?: boolean;
    created_at: string;
    updated_at?: string;
}
