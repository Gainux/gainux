import { supabase } from '@/lib/supabase';
import type { Training, TrainingProgress } from '../types';

// Helper to map DB snake_case to CamelCase
const mapDbToTraining = (row: any): Training => ({
    id: row.id,
    orgId: row.org_id,
    title: row.title,
    description: row.description,
    contentUrl: row.content_url,
    contentType: row.content_type,
    targetDepartmentId: row.target_department_id,
    targetDepartment: row.targetDepartment, // Joined relation
    targetDesignationId: row.target_designation_id,
    targetDesignation: row.targetDesignation, // Joined relation
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

export const trainingService = {
    // Fetch trainings.
    async getTrainings(orgId: string, employeeDepartmentId?: string, employeeDesignationId?: string): Promise<Training[]> {
        let query = supabase
            .from('trainings')
            .select(`
                *,
                targetDepartment:departments(*),
                targetDesignation:designations(*)
            `)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        const mappedData = data.map(mapDbToTraining);

        // Backend filtering for targeting if needed, but doing client side or simple logic here is fine for v1
        if (employeeDepartmentId || employeeDesignationId) {
            return mappedData.filter(t => {
                const deptMatch = !t.targetDepartmentId || t.targetDepartmentId === employeeDepartmentId;
                const desigMatch = !t.targetDesignationId || t.targetDesignationId === employeeDesignationId;
                return deptMatch && desigMatch;
            });
        }

        return mappedData;
    },

    async createTraining(training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Promise<Training> {
        const payload = {
            org_id: training.orgId,
            title: training.title,
            description: training.description,
            content_url: training.contentUrl,
            content_type: training.contentType,
            target_department_id: training.targetDepartmentId,
            target_designation_id: training.targetDesignationId,
            created_by: training.createdBy
        };

        const { data, error } = await supabase
            .from('trainings')
            .insert(payload)
            .select()
            .single();

        if (error) throw error;
        return mapDbToTraining(data);
    },

    async getProgress(trainingId: string, employeeId: string): Promise<TrainingProgress | null> {
        const { data, error } = await supabase
            .from('training_progress')
            .select('*')
            .eq('training_id', trainingId)
            .eq('employee_id', employeeId)
            .maybeSingle();

        if (error) throw error;

        if (!data) return null;

        return {
            id: data.id,
            trainingId: data.training_id,
            employeeId: data.employee_id,
            status: data.status,
            completedAt: data.completed_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async updateProgress(trainingId: string, employeeId: string, status: 'completed' | 'in_progress'): Promise<void> {
        const { error } = await supabase
            .from('training_progress')
            .upsert({
                training_id: trainingId,
                employee_id: employeeId,
                status: status,
                completed_at: status === 'completed' ? new Date().toISOString() : null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'training_id, employee_id' });

        if (error) throw error;
    },

    async deleteTraining(id: string): Promise<void> {
        const { error } = await supabase
            .from('trainings')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async updateTraining(id: string, updates: Partial<Training>): Promise<Training> {
        const payload: any = {
            title: updates.title,
            description: updates.description,
            content_url: updates.contentUrl,
            content_type: updates.contentType,
            target_department_id: updates.targetDepartmentId,
            target_designation_id: updates.targetDesignationId,
            updated_at: new Date().toISOString()
        };

        // Clean up undefined values
        Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

        const { data, error } = await supabase
            .from('trainings')
            .update(payload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapDbToTraining(data);
    }
};
