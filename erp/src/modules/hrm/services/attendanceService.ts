import { supabase } from '@/lib/supabase';
import type { AttendanceLog } from '../types';

const mapDbToAttendance = (row: any): AttendanceLog => ({
    id: row.id,
    orgId: row.org_id,
    employeeId: row.employee_id,
    date: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

const mapAttendanceToDb = (attendance: Partial<AttendanceLog>) => ({
    org_id: attendance.orgId,
    employee_id: attendance.employeeId,
    date: attendance.date,
    check_in: attendance.checkIn,
    check_out: attendance.checkOut,
    status: attendance.status,
    notes: attendance.notes
});

export const attendanceService = {
    async getAttendanceLogs(orgId: string, date?: string, startDate?: string, endDate?: string): Promise<AttendanceLog[]> {
        let query = supabase
            .from('attendance_logs')
            .select('*')
            .eq('org_id', orgId);

        if (date) {
            query = query.eq('date', date);
        } else if (startDate && endDate) {
            query = query.gte('date', startDate).lte('date', endDate);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapDbToAttendance);
    },

    async getEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string): Promise<AttendanceLog[]> {
        let query = supabase
            .from('attendance_logs')
            .select('*')
            .eq('employee_id', employeeId);

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapDbToAttendance);
    },

    async checkIn(employeeId: string, orgId: string, date: string): Promise<AttendanceLog> {
        // Check if already checked in today
        const { data: existing } = await supabase
            .from('attendance_logs')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', date)
            .single();

        if (existing) {
            throw new Error('Already checked in for today');
        }

        const { data, error } = await supabase
            .from('attendance_logs')
            .insert({
                org_id: orgId,
                employee_id: employeeId,
                date,
                check_in: new Date().toISOString(),
                status: 'present'
            })
            .select()
            .single();

        if (error) throw error;
        return mapDbToAttendance(data);
    },

    async checkOut(employeeId: string, date: string): Promise<AttendanceLog> {
        const { data: existing } = await supabase
            .from('attendance_logs')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', date)
            .single();

        if (!existing) {
            throw new Error('No check-in record found for today');
        }

        if (existing.check_out) {
            throw new Error('Already checked out for today');
        }

        const { data, error } = await supabase
            .from('attendance_logs')
            .update({ check_out: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return mapDbToAttendance(data);
    },

    async markAttendance(attendance: Omit<AttendanceLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<AttendanceLog> {
        const { data, error } = await supabase
            .from('attendance_logs')
            .upsert(mapAttendanceToDb(attendance), { onConflict: 'employee_id, date' })
            .select()
            .single();

        if (error) throw error;
        return mapDbToAttendance(data);
    },

    async updateAttendance(id: string, updates: Partial<AttendanceLog>): Promise<AttendanceLog> {
        const { data, error } = await supabase
            .from('attendance_logs')
            .update(mapAttendanceToDb(updates))
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapDbToAttendance(data);
    },

    async deleteAttendance(id: string): Promise<void> {
        const { error } = await supabase
            .from('attendance_logs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
