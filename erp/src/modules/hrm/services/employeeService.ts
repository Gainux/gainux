import { supabase } from "@/lib/supabase";
import type { Employee, Department } from "../types";

// Helper to map DB snake_case to CamelCase
const mapToEmployee = (data: any): Employee => ({
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    hireDate: data.hire_date,
    jobTitle: data.job_title,
    departmentId: data.department_id,
    department: data.department ? {
        id: data.department.id,
        name: data.department.name,
        createdAt: data.department.created_at
    } : undefined,
    salary: Number(data.salary),
    status: data.status,
    address: data.address,
    emergencyContact: data.emergency_contact,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

export const employeeService = {
    async getEmployees(filters?: { departmentId?: string; status?: string }) {
        let query = supabase
            .from('employees')
            .select(`
                *,
                department:departments(id, name, created_at)
            `)
            .order('first_name', { ascending: true });

        if (filters?.departmentId && filters.departmentId !== 'all') {
            query = query.eq('department_id', filters.departmentId);
        }

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapToEmployee);
    },

    async getEmployeeById(id: string) {
        const { data, error } = await supabase
            .from('employees')
            .select(`
                *,
                department:departments(id, name, created_at)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToEmployee(data);
    },

    async createEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) {
        const dbEmployee = {
            first_name: employee.firstName,
            last_name: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            hire_date: employee.hireDate,
            job_title: employee.jobTitle,
            department_id: employee.departmentId || null,
            salary: employee.salary,
            status: employee.status,
            address: employee.address || null,
            emergency_contact: employee.emergencyContact || null,
        };

        const { data, error } = await supabase
            .from('employees')
            .insert(dbEmployee)
            .select()
            .single();

        if (error) throw error;
        return mapToEmployee(data);
    },

    async updateEmployee(id: string, employee: Partial<Employee>) {
        const dbEmployee: any = {};
        if (employee.firstName) dbEmployee.first_name = employee.firstName;
        if (employee.lastName) dbEmployee.last_name = employee.lastName;
        if (employee.email) dbEmployee.email = employee.email;
        if (employee.phone) dbEmployee.phone = employee.phone;
        if (employee.hireDate) dbEmployee.hire_date = employee.hireDate;
        if (employee.jobTitle) dbEmployee.job_title = employee.jobTitle;
        if (employee.departmentId !== undefined) dbEmployee.department_id = employee.departmentId || null;
        if (employee.salary) dbEmployee.salary = employee.salary;
        if (employee.status) dbEmployee.status = employee.status;
        if (employee.address) dbEmployee.address = employee.address;
        if (employee.emergencyContact) dbEmployee.emergency_contact = employee.emergencyContact;

        const { data, error } = await supabase
            .from('employees')
            .update(dbEmployee)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToEmployee(data);
    },

    async deleteEmployee(id: string) {
        const { error } = await supabase
            .from('employees')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getDepartments() {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .order('name');

        if (error) throw error;
        return data as Department[];
    }
};
