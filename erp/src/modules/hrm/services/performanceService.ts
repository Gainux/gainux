
import { supabase } from "@/lib/supabase";
import type { PerformanceGoal, PerformanceReview, PerformanceStats } from "../types";

export const performanceService = {
    // --- Stats Aggregation ---
    async getPerformanceStats(orgId: string, employeeId: string, referenceDate: Date = new Date()): Promise<PerformanceStats> {
        // Calculate start and end of the selected month
        const startOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
        const endOfMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0, 23, 59, 59);

        // 1. Task Completion (from Project Management)
        // We filter tasks that are DUE in this month OR were Completed in this month (if we tracked completion date, but for now let's stick to due_date or created_at logic).
        // Standard approach: Tasks Due in this month.
        let totalTasks = 0;
        let completedTasks = 0;
        let taskCompletionRate = 0;

        try {
            let taskQuery = supabase
                .from('tasks')
                .select('id, status, due_date')
                .eq('assignee_id', employeeId);

            // Filter by due date range for the selected month
            taskQuery = taskQuery
                .gte('due_date', startOfMonth.toISOString())
                .lte('due_date', endOfMonth.toISOString());

            const { data: tasks, error: tasksError } = await taskQuery;

            if (!tasksError && tasks) {
                totalTasks = tasks.length;
                completedTasks = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
                taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            } else if (tasksError) {
                console.warn('Failed to fetch tasks stats:', tasksError);
            }
        } catch (err) {
            console.warn('Error fetching tasks stats (likely schema mismatch):', err);
        }

        // 2. Attendance (from HRM)
        const { data: attendance } = await supabase
            .from('attendance_logs')
            .select('status')
            .eq('org_id', orgId)
            .eq('employee_id', employeeId)
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString());

        const presentDays = attendance?.filter(a => a.status === 'present').length || 0;
        // Simple calculation for working days (excluding weekends) - can be refined later
        const totalWorkingDays = 22; // approx, could be dynamic based on month length
        const attendanceRate = (presentDays / totalWorkingDays) * 100;

        // 3. Timesheets (from Project Management)
        const { data: timesheets } = await supabase
            .from('timesheets')
            .select('hours')
            .eq('org_id', orgId)
            .eq('employee_id', employeeId)
            .gte('date', startOfMonth.toISOString())
            .lte('date', endOfMonth.toISOString());

        const timesheetHours = timesheets?.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0) || 0;

        // 4. Goals (from Performance)
        const { data: goals } = await supabase
            .from('perf_goals')
            .select('id, status')
            .eq('org_id', orgId)
            .eq('employee_id', employeeId);

        const totalGoals = goals?.length || 0;
        const goalsCompleted = goals?.filter(g => g.status === 'completed').length || 0;

        // 5. Reviews Rating
        const { data: reviews } = await supabase
            .from('perf_reviews')
            .select('rating')
            .eq('org_id', orgId)
            .eq('employee_id', employeeId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1);

        const averageRating = reviews?.[0]?.rating || 0;

        return {
            taskCompletionRate,
            completedTasks,
            totalTasks,
            attendanceRate,
            presentDays,
            totalWorkingDays,
            timesheetHours,
            goalsCompleted,
            totalGoals,
            averageRating
        };
    },

    // --- Goals Management ---
    async getGoals(orgId: string, employeeId?: string) {
        let query = supabase
            .from('perf_goals')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (employeeId) {
            query = query.eq('employee_id', employeeId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as PerformanceGoal[];
    },

    async createGoal(goal: Partial<PerformanceGoal>) {
        const { data, error } = await supabase
            .from('perf_goals')
            .insert(goal)
            .select()
            .single();

        if (error) throw error;
        return data as PerformanceGoal;
    },

    async updateGoal(id: string, updates: Partial<PerformanceGoal>) {
        const { data, error } = await supabase
            .from('perf_goals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as PerformanceGoal;
    },

    async deleteGoal(id: string) {
        const { error } = await supabase
            .from('perf_goals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // --- Reviews Management ---
    async getReviews(orgId: string, employeeId?: string) {
        let query = supabase
            .from('perf_reviews')
            .select(`
                *,
                reviewer:employees!reviewer_id(first_name, last_name)
            `)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (employeeId) {
            query = query.eq('employee_id', employeeId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as PerformanceReview[];
    },

    async createReview(review: Partial<PerformanceReview>) {
        const { data, error } = await supabase
            .from('perf_reviews')
            .insert(review)
            .select()
            .single();

        if (error) throw error;
        return data as PerformanceReview;
    },

    async updateReview(id: string, updates: Partial<PerformanceReview>) {
        const { data, error } = await supabase
            .from('perf_reviews')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as PerformanceReview;
    }
};
