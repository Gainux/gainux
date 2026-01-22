import { supabase } from '@/lib/supabase';
import type { LeaveType, LeaveRequest, LeaveBalance } from '../types';

const mapDbToLeaveType = (row: any): LeaveType => ({
    id: row.id,
    orgId: row.org_id,
    name: row.name,
    daysAllowedPerYear: row.days_allowed_per_year,
    isPaid: row.is_paid,
    createdAt: row.created_at
});

const mapDbToLeaveRequest = (row: any): LeaveRequest => ({
    id: row.id,
    orgId: row.org_id,
    employeeId: row.employee_id,
    employee: row.employees ? {
        id: row.employees.id,
        orgId: row.employees.org_id,
        userId: row.employees.user_id,
        employeeCode: row.employees.employee_code,
        firstName: row.employees.first_name,
        lastName: row.employees.last_name,
        email: row.employees.email,
        dateOfJoining: row.employees.date_of_joining,
        departmentId: row.employees.department_id,
        designationId: row.employees.designation_id,
        managerId: row.employees.manager_id,
        employmentType: row.employees.employment_type,
        status: row.employees.status,
        createdAt: row.employees.created_at,
        updatedAt: row.employees.updated_at
    } : undefined,
    leaveTypeId: row.leave_type_id,
    leaveType: row.leave_types ? {
        id: row.leave_types.id,
        orgId: row.leave_types.org_id,
        name: row.leave_types.name,
        daysAllowedPerYear: row.leave_types.days_allowed_per_year,
        isPaid: row.leave_types.is_paid,
        createdAt: row.leave_types.created_at
    } : undefined,
    startDate: row.start_date,
    endDate: row.end_date,
    daysCount: row.days_count,
    reason: row.reason,
    status: row.status,
    approvedBy: row.approved_by,
    approvedAt: row.approved_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

const mapDbToLeaveBalance = (row: any): LeaveBalance => ({
    id: row.id,
    orgId: row.org_id,
    employeeId: row.employee_id,
    leaveTypeId: row.leave_type_id,
    year: row.year,
    daysTaken: row.days_taken,
    daysRemaining: row.days_remaining,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const leaveService = {
    // ... existing getLeaveTypes ...
    async getLeaveTypes(orgId: string): Promise<LeaveType[]> {
        const { data, error } = await supabase
            .from('leave_types')
            .select('*')
            // Fetch types specific to this org OR global types (null org_id)
            .or(`org_id.eq.${orgId},org_id.is.null`)
            .order('name');

        if (error) throw error;
        return (data || []).map(mapDbToLeaveType);
    },

    async createLeaveType(orgId: string, name: string, daysAllowedPerYear: number, isPaid: boolean = true): Promise<LeaveType> {
        const { data, error } = await supabase
            .from('leave_types')
            .insert({
                org_id: orgId,
                name,
                days_allowed_per_year: daysAllowedPerYear,
                is_paid: isPaid
            })
            .select()
            .single();

        if (error) throw error;
        return mapDbToLeaveType(data);
    },

    // Leave Requests
    async getLeaveRequests(orgId: string, employeeId?: string): Promise<LeaveRequest[]> {
        let query = supabase
            .from('leave_requests')
            // Use explicit foreign key to avoid ambiguity with approved_by
            .select(`
                *,
                employees:employees!leave_requests_employee_id_fkey!inner(*),
                leave_types(*)
            `)
            .eq('org_id', orgId);

        if (employeeId) {
            query = query.eq('employee_id', employeeId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapDbToLeaveRequest);
    },

    async applyLeave(request: Omit<LeaveRequest, 'id' | 'status' | 'approvedBy' | 'approvedAt' | 'createdAt' | 'updatedAt'>): Promise<LeaveRequest> {
        const { data, error } = await supabase
            .from('leave_requests')
            .insert({
                org_id: request.orgId,
                employee_id: request.employeeId,
                leave_type_id: request.leaveTypeId,
                start_date: request.startDate,
                end_date: request.endDate,
                days_count: request.daysCount,
                reason: request.reason,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;
        return mapDbToLeaveRequest(data);
    },

    async approveLeave(requestId: string, approverId?: string | null): Promise<LeaveRequest> {
        const updateData: any = {
            status: 'approved',
            approved_at: new Date().toISOString()
        };

        if (approverId) {
            updateData.approved_by = approverId;
        }

        // 1. Perform Update
        const { error: updateError } = await supabase
            .from('leave_requests')
            .update(updateData)
            .eq('id', requestId);

        if (updateError) throw updateError;

        // 2. Fetch Updated Request
        const { data: requestData, error: fetchError } = await supabase
            .from('leave_requests')
            .select(`
                *,
                employees:employees!leave_requests_employee_id_fkey!inner(*),
                leave_types(*)
            `)
            .eq('id', requestId)
            .single();

        if (fetchError) throw fetchError;

        // 3. Update Leave Balance
        const request = mapDbToLeaveRequest(requestData);
        await this.updateLeaveBalance(
            request.orgId,
            request.employeeId,
            request.leaveTypeId,
            request.daysCount,
            new Date(request.startDate).getFullYear()
        );

        return request;
    },

    async rejectLeave(requestId: string): Promise<LeaveRequest> {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({ status: 'rejected' })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;
        return mapDbToLeaveRequest(data);
    },

    // Leave Balances
    async getLeaveBalances(employeeId: string, year: number): Promise<LeaveBalance[]> {
        const { data, error } = await supabase
            .from('leave_balances')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('year', year);

        if (error) throw error;
        return (data || []).map(mapDbToLeaveBalance);
    },

    async initializeLeaveBalance(orgId: string, employeeId: string, leaveTypeId: string, year: number, daysAllowed: number): Promise<LeaveBalance> {
        const { data, error } = await supabase
            .from('leave_balances')
            .insert({
                org_id: orgId,
                employee_id: employeeId,
                leave_type_id: leaveTypeId,
                year,
                days_taken: 0,
                days_remaining: daysAllowed
            })
            .select()
            .single();

        if (error) throw error;
        return mapDbToLeaveBalance(data);
    },

    async updateLeaveBalance(orgId: string, employeeId: string, leaveTypeId: string, daysTaken: number, year: number): Promise<void> {
        console.log("Updating balance for:", { employeeId, leaveTypeId, year, daysTaken });

        const { data: existing, error: fetchError } = await supabase
            .from('leave_balances')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('leave_type_id', leaveTypeId)
            .eq('year', year)
            .maybeSingle();

        if (fetchError) {
            console.error("Error fetching balance:", fetchError);
            // If error is 406 permissions or duplicates, we might need to handle it.
        }

        if (existing) {
            const newDaysTaken = Number(existing.days_taken) + Number(daysTaken);
            const newDaysRemaining = Number(existing.days_remaining) - Number(daysTaken);

            await supabase
                .from('leave_balances')
                .update({
                    days_taken: newDaysTaken,
                    days_remaining: newDaysRemaining
                })
                .eq('id', existing.id);
        } else {
            // Balance record doesn't exist, we need to fetch the leave type to know the default allowance
            const { data: leaveType } = await supabase
                .from('leave_types')
                .select('days_allowed_per_year')
                .eq('id', leaveTypeId)
                .single();

            if (leaveType) {
                const totalAllowed = Number(leaveType.days_allowed_per_year);
                await supabase
                    .from('leave_balances')
                    .insert({
                        org_id: orgId,
                        employee_id: employeeId,
                        leave_type_id: leaveTypeId,
                        year,
                        days_taken: daysTaken,
                        days_remaining: totalAllowed - daysTaken
                    });
            }
        }
    }
};
