import { supabase } from "@/lib/supabase";
import type { Attendance } from "../types";

// Helper to map DB snake_case to CamelCase
const mapToAttendance = (data: any): Attendance => ({
    id: data.id,
    employeeId: data.employee_id,
    date: data.date,
    clockIn: data.clock_in,
    clockOut: data.clock_out,
    status: data.status,
    notes: data.notes,
    createdAt: data.created_at
});

// Helper to map CamelCase to DB snake_case
const mapToDbAttendance = (data: Partial<Attendance>) => {
    const dbData: any = {};
    if (data.id) dbData.id = data.id;
    if (data.employeeId) dbData.employee_id = data.employeeId;
    if (data.date) dbData.date = data.date;
    if (data.clockIn !== undefined) dbData.clock_in = data.clockIn;
    if (data.clockOut !== undefined) dbData.clock_out = data.clockOut;
    if (data.status) dbData.status = data.status;
    if (data.notes !== undefined) dbData.notes = data.notes;
    return dbData;
};

export const attendanceService = {
    async getAttendance(date: string) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('date', date);

        if (error) throw error;
        return data.map(mapToAttendance);
    },

    async getTodayStats() {
        // 1. Get today's date YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];

        // 2. Count total active employees
        const { count: total, error: empError } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');

        if (empError) throw empError;

        // 3. Count present/absent for today
        const { data: attendance, error: attError } = await supabase
            .from('attendance')
            .select('status')
            .eq('date', today);

        if (attError) throw attError;

        const present = attendance?.filter(a => ['present', 'late', 'half_day'].includes(a.status)).length || 0;
        const absent = attendance?.filter(a => a.status === 'absent').length || 0;

        return {
            total: total || 0,
            present,
            absent
        };
    },

    async bulkUpsertAttendance(records: Partial<Attendance>[]) {
        const dbRecords = records.map(mapToDbAttendance);

        const { data, error } = await supabase
            .from('attendance')
            .upsert(dbRecords, { onConflict: 'employee_id, date' })
            .select();

        if (error) throw error;
        return data.map(mapToAttendance);
    },

    async upsertAttendance(record: Partial<Attendance>) {
        const dbRecord = mapToDbAttendance(record);

        const { data, error } = await supabase
            .from('attendance')
            .upsert(dbRecord, { onConflict: 'employee_id, date' })
            .select()
            .single();

        if (error) throw error;
        return mapToAttendance(data);
    },

    async clockIn(employeeId: string) {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });

        const { data, error } = await supabase
            .from('attendance')
            .upsert({
                employee_id: employeeId,
                date: today,
                clock_in: now,
                status: 'present'
            }, { onConflict: 'employee_id, date' })
            .select()
            .single();

        if (error) throw error;
        return mapToAttendance(data);
    },

    async clockOut(employeeId: string) {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });

        // Update only if clock_out is null or explicitly requested
        // Using upsert with existing data is tricky without fetching first, 
        // but update is safer for clock-out to ensure record exists.
        const { data, error } = await supabase
            .from('attendance')
            .update({ clock_out: now })
            .eq('employee_id', employeeId)
            .eq('date', today)
            .select()
            .single();

        if (error) throw error;
        return mapToAttendance(data);
    }
};
