import { supabase } from '@/lib/supabase';

export interface DepartmentModuleAccess {
    id: string;
    departmentId: string;
    moduleId: string;
    hasAccess: boolean;
    orgId: string;
    createdAt: string;
    updatedAt: string;
}

export const departmentAccessService = {
    /**
     * Get all module access records for a department
     */
    async getDepartmentModuleAccess(orgId: string, departmentId: string): Promise<DepartmentModuleAccess[]> {
        const { data, error } = await supabase
            .from('department_module_access')
            .select('*')
            .eq('org_id', orgId)
            .eq('department_id', departmentId);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            departmentId: item.department_id,
            moduleId: item.module_id,
            hasAccess: item.has_access,
            orgId: item.org_id,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));
    },

    /**
     * Set module access for a department
     */
    async setDepartmentModuleAccess(
        orgId: string,
        departmentId: string,
        moduleId: string,
        hasAccess: boolean
    ): Promise<void> {
        const { error } = await supabase
            .from('department_module_access')
            .upsert({
                department_id: departmentId,
                module_id: moduleId,
                has_access: hasAccess,
                org_id: orgId,
            }, {
                onConflict: 'department_id,module_id,org_id'
            });

        if (error) throw error;
    },

    /**
     * Get modules accessible to an employee based on their department
     */
    async getEmployeeModuleAccess(employeeId: string): Promise<string[]> {
        // First, get employee's department
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .select('department_id, org_id')
            .eq('id', employeeId)
            .single();

        if (empError) throw empError;

        // If no department, return empty array (will fall back to role-based access)
        if (!employee.department_id) {
            return [];
        }

        // Get department's module access
        const { data, error } = await supabase
            .from('department_module_access')
            .select('module_id')
            .eq('department_id', employee.department_id)
            .eq('org_id', employee.org_id)
            .eq('has_access', true);

        if (error) throw error;

        return (data || []).map(item => item.module_id);
    },

    /**
     * Get modules accessible to an employee based on their Auth User ID
     */
    async getEmployeeModuleAccessByUserId(userId: string): Promise<string[]> {
        // First, get employee's department using user_id
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .select('department_id, org_id')
            .eq('user_id', userId)
            .maybeSingle();

        if (empError) throw empError;
        if (!employee) return []; // Not an employee

        // If no department, return empty array
        if (!employee.department_id) {
            return [];
        }

        // Get department's module access
        const { data, error } = await supabase
            .from('department_module_access')
            .select('module_id')
            .eq('department_id', employee.department_id)
            .eq('org_id', employee.org_id)
            .eq('has_access', true);

        if (error) throw error;

        return (data || []).map(item => item.module_id);
    },

    /**
     * Bulk update department access for multiple modules
     */
    async bulkUpdateDepartmentAccess(
        orgId: string,
        departmentId: string,
        moduleAccessMap: Record<string, boolean>
    ): Promise<void> {
        const records = Object.entries(moduleAccessMap).map(([moduleId, hasAccess]) => ({
            department_id: departmentId,
            module_id: moduleId,
            has_access: hasAccess,
            org_id: orgId,
        }));

        const { error } = await supabase
            .from('department_module_access')
            .upsert(records, {
                onConflict: 'department_id,module_id,org_id'
            });

        if (error) throw error;
    },

    /**
     * Delete all module access records for a department
     */
    async clearDepartmentAccess(orgId: string, departmentId: string): Promise<void> {
        const { error } = await supabase
            .from('department_module_access')
            .delete()
            .eq('org_id', orgId)
            .eq('department_id', departmentId);

        if (error) throw error;
    },

    /**
     * Check if a department has access to a specific module
     */
    async checkDepartmentHasModule(
        orgId: string,
        departmentId: string,
        moduleId: string
    ): Promise<boolean> {
        const { data, error } = await supabase
            .from('department_module_access')
            .select('has_access')
            .eq('org_id', orgId)
            .eq('department_id', departmentId)
            .eq('module_id', moduleId)
            .single();

        if (error) {
            // If no record exists, default to false
            if (error.code === 'PGRST116') return false;
            throw error;
        }

        return data?.has_access || false;
    },
};
