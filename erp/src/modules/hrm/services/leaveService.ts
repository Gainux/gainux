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
    leaveTypeId: row.leave_type_id,
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
    // Leave Types
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
            .select('*')
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

    async approveLeave(requestId: string, approverId: string): Promise<LeaveRequest> {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({
                status: 'approved',
                approved_by: approverId,
                approved_at: new Date().toISOString()
            })
            .eq('id', requestId)
            .select()
            .single();

        if (error) throw error;

        // Update leave balance
        const request = mapDbToLeaveRequest(data);
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
        const { data: existing } = await supabase
            .from('leave_balances')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('leave_type_id', leaveTypeId)
            .eq('year', year)
            .single();

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
