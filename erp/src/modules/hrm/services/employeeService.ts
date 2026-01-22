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
    department: row.department ? {
        id: row.department.id,
        orgId: row.department.org_id,
        name: row.department.name,
        description: row.department.description,
        managerId: row.department.manager_id,
        createdAt: row.department.created_at,
        updatedAt: row.department.updated_at
    } : undefined,
    designationId: row.designation_id,
    designation: row.designation ? {
        id: row.designation.id,
        orgId: row.designation.org_id,
        title: row.designation.title,
        description: row.designation.description,
        createdAt: row.designation.created_at
    } : undefined,
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
        const { data: employees, error } = await supabase
            .from('employees')
            .select('*')
            .eq('org_id', orgId)
            .order('first_name');

        if (error) throw error;

        // Fetch relations manually to avoid join issues
        const { data: departments } = await supabase.from('departments').select('*').eq('org_id', orgId);
        const { data: designations } = await supabase.from('designations').select('*').eq('org_id', orgId);

        return (employees || []).map(row => {
            const emp = mapDbToEmployee(row);
            if (departments) {
                const dept = departments.find(d => d.id === row.department_id);
                if (dept) {
                    emp.department = {
                        id: dept.id,
                        orgId: dept.org_id,
                        name: dept.name,
                        description: dept.description,
                        managerId: dept.manager_id,
                        createdAt: dept.created_at,
                        updatedAt: dept.updated_at
                    };
                }
            }
            if (designations) {
                const desig = designations.find(d => d.id === row.designation_id);
                if (desig) {
                    emp.designation = {
                        id: desig.id,
                        orgId: desig.org_id,
                        title: desig.title,
                        description: desig.description,
                        createdAt: desig.created_at
                    };
                }
            }
            return emp;
        });
    },

    async getEmployeeById(id: string): Promise<Employee | null> {
        const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (error) throw error;
        if (!employee) return null;

        const emp = mapDbToEmployee(employee);

        // Fetch relations
        if (employee.department_id) {
            const { data: dept } = await supabase.from('departments').select('*').eq('id', employee.department_id).maybeSingle();
            if (dept) {
                emp.department = {
                    id: dept.id,
                    orgId: dept.org_id,
                    name: dept.name,
                    description: dept.description,
                    managerId: dept.manager_id,
                    createdAt: dept.created_at,
                    updatedAt: dept.updated_at
                };
            }
        }

        if (employee.designation_id) {
            const { data: desig } = await supabase.from('designations').select('*').eq('id', employee.designation_id).maybeSingle();
            if (desig) {
                emp.designation = {
                    id: desig.id,
                    orgId: desig.org_id,
                    title: desig.title,
                    description: desig.description,
                    createdAt: desig.created_at
                };
            }
        }

        return emp;
    },

    async getEmployeeByUserId(userId: string): Promise<Employee | null> {
        const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"
        if (!employee) return null;

        const emp = mapDbToEmployee(employee);
        // We can fetch relations if needed, similar to getEmployeeById
        // For performance dashboard, we usually just need the ID, but let's be consistent.

        return emp;
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
