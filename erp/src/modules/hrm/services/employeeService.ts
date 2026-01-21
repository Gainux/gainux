import { supabase } from '@/lib/supabase';
import type { Employee, Department, Designation } from '../types';

// Helper: Map database row to Employee type
const mapDbToEmployee = (row: any): Employee => ({
    id: row.id,
    orgId: row.org_id,
    userId: row.user_id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    dateOfJoining: row.date_of_joining,
    departmentId: row.department_id,
    designationId: row.designation_id,
    managerId: row.manager_id,
    employmentType: row.employment_type,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

// Helper: Map Employee to database format
const mapEmployeeToDb = (employee: Partial<Employee>) => ({
    org_id: employee.orgId,
    user_id: employee.userId,
    employee_code: employee.employeeCode,
    first_name: employee.firstName,
    last_name: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    date_of_birth: employee.dateOfBirth,
    date_of_joining: employee.dateOfJoining,
    department_id: employee.departmentId,
    designation_id: employee.designationId,
    manager_id: employee.managerId,
    employment_type: employee.employmentType,
    status: employee.status
});

export const employeeService = {
    async getEmployees(orgId: string): Promise<Employee[]> {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('org_id', orgId)
            .order('first_name');

        if (error) throw error;
        return (data || []).map(mapDbToEmployee);
    },

    async getEmployeeById(id: string): Promise<Employee | null> {
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data ? mapDbToEmployee(data) : null;
    },

    async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<Employee> {
        const { data, error } = await supabase
            .from('employees')
            .insert(mapEmployeeToDb(employee))
            .select()
            .single();

        if (error) throw error;
        return mapDbToEmployee(data);
    },

    async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
        const { data, error } = await supabase
            .from('employees')
            .update(mapEmployeeToDb(updates))
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapDbToEmployee(data);
    },

    async deleteEmployee(id: string): Promise<void> {
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Department Management
    async getDepartments(orgId: string): Promise<Department[]> {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .eq('org_id', orgId)
            .order('name');

        if (error) throw error;
        return data?.map(row => ({
            id: row.id,
            orgId: row.org_id,
            name: row.name,
            description: row.description,
            managerId: row.manager_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        })) || [];
    },

    async createDepartment(orgId: string, name: string, description?: string): Promise<Department> {
        const { data, error } = await supabase
            .from('departments')
            .insert({ org_id: orgId, name, description })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            orgId: data.org_id,
            name: data.name,
            description: data.description,
            managerId: data.manager_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    // Designation Management
    async getDesignations(orgId: string): Promise<Designation[]> {
        const { data, error } = await supabase
            .from('designations')
            .select('*')
            .eq('org_id', orgId)
            .order('title');

        if (error) throw error;
        return data?.map(row => ({
            id: row.id,
            orgId: row.org_id,
            title: row.title,
            description: row.description,
            createdAt: row.created_at
        })) || [];
    },

    async createDesignation(orgId: string, title: string, description?: string): Promise<Designation> {
        const { data, error } = await supabase
            .from('designations')
            .insert({ org_id: orgId, title, description })
            .select()
            .single();

        if (error) throw error;
        return {
            id: data.id,
            orgId: data.org_id,
            title: data.title,
            description: data.description,
            createdAt: data.created_at
        };
    }
};
