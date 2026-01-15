import { supabase } from "@/lib/supabase";
import { LeaveRequest } from "../types";

// Helper to map DB snake_case to CamelCase
const mapToLeaveRequest = (data: any): LeaveRequest => ({
    id: data.id,
    employeeId: data.employee_id,
    employee: data.employee ? {
        id: data.employee.id,
        firstName: data.employee.first_name,
        lastName: data.employee.last_name,
        email: "",
        hireDate: "",
        jobTitle: "",
        departmentId: "",
        salary: 0,
        status: "active",
        department: data.employee.department ? {
            id: "", // partial
            name: data.employee.department.name,
            createdAt: ""
        } : undefined
    } : undefined,
    leaveType: data.leave_type,
    startDate: data.start_date,
    endDate: data.end_date,
    reason: data.reason,
    status: data.status,
    approvedBy: data.approved_by,
    createdAt: data.created_at
});

export const leaveService = {
    async getLeaveRequests(status?: string) {
        let query = supabase
            .from('leave_requests')
            .select(`
                *,
                employee:employees(id, first_name, last_name, department:departments(name))
            `)
            .order('start_date', { ascending: false });

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapToLeaveRequest);
    },

    async requestLeave(request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'approvedBy'>) {
        const dbRequest = {
            employee_id: request.employeeId,
            leave_type: request.leaveType,
            start_date: request.startDate,
            end_date: request.endDate,
            reason: request.reason,
            status: 'pending'
        };

        const { data, error } = await supabase
            .from('leave_requests')
            .insert(dbRequest)
            .select()
            .single();

        if (error) throw error;
        return mapToLeaveRequest(data);
    },

    async updateLeaveStatus(id: string, status: 'approved' | 'rejected', approverId: string) {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({
                status: status,
                approved_by: approverId
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToLeaveRequest(data);
    }
};
