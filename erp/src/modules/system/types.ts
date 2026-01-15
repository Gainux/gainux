export type UserRole = 'admin' | 'manager' | 'user';
export type UserStatus = 'active' | 'inactive';

export interface SystemUser {
    id: string;
    email: string;
    fullName: string | null;
    role: UserRole;
    avatarUrl: string | null;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}
