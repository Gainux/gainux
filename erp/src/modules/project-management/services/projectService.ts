import { supabase } from "@/lib/supabase";
import type { Project, ProjectMember, Task, ProjectStatus, TaskStatus } from "../types";

// --- Helpers ---

const mapToProject = (data: any): Project => ({
    id: data.id,
    name: data.name,
    description: data.description,
    clientId: data.client_id,
    client: data.customers ? {
        id: data.customers.id,
        name: data.customers.name
    } : undefined,
    status: data.status,
    startDate: data.start_date,
    endDate: data.end_date,
    budget: Number(data.budget),
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapToTask = (data: any): Task => ({
    id: data.id,
    projectId: data.project_id,
    project: data.projects ? {
        id: data.projects.id,
        name: data.projects.name
    } : undefined,
    assigneeId: data.assignee_id,
    assignee: data.employees ? {
        id: data.employees.id,
        firstName: data.employees.first_name,
        lastName: data.employees.last_name
    } : undefined,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.due_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

const mapToMember = (data: any): ProjectMember => ({
    id: data.id,
    projectId: data.project_id,
    employeeId: data.employee_id,
    employee: data.employees ? {
        id: data.employees.id,
        firstName: data.employees.first_name,
        lastName: data.employees.last_name,
        email: data.employees.email
    } : undefined,
    role: data.role,
    joinedAt: data.joined_at
});

// --- Service ---

export const projectService = {
    // Projects
    async getProjects() {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                customers (id, name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToProject);
    },

    async getProjectById(id: string) {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                customers (id, name)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToProject(data);
    },

    async createProject(project: Partial<Project>) {
        const { data, error } = await supabase
            .from('projects')
            .insert({
                name: project.name,
                description: project.description,
                client_id: project.clientId,
                status: project.status || 'planning',
                start_date: project.startDate,
                end_date: project.endDate,
                budget: project.budget
            })
            .select()
            .single();

        if (error) throw error;
        return mapToProject(data);
    },

    async updateProject(id: string, updates: Partial<Project>) {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.budget !== undefined) dbUpdates.budget = updates.budget;

        const { data, error } = await supabase
            .from('projects')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToProject(data);
    },

    async deleteProject(id: string) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Members
    async getProjectMembers(projectId: string) {
        const { data, error } = await supabase
            .from('project_members')
            .select(`
                *,
                employees (id, first_name, last_name, email)
            `)
            .eq('project_id', projectId);

        if (error) throw error;
        return data.map(mapToMember);
    },

    async addProjectMember(member: Partial<ProjectMember>) {
        const { data, error } = await supabase
            .from('project_members')
            .insert({
                project_id: member.projectId,
                employee_id: member.employeeId,
                role: member.role
            })
            .select()
            .single();

        if (error) throw error;
        return mapToMember(data);
    },

    async removeProjectMember(memberId: string) {
        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('id', memberId);
        if (error) throw error;
    },

    // Tasks
    async getProjectTasks(projectId: string) {
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                employees (id, first_name, last_name)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToTask);
    },

    async createTask(task: Partial<Task>) {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                project_id: task.projectId,
                assignee_id: task.assigneeId,
                title: task.title,
                description: task.description,
                status: task.status || 'todo',
                priority: task.priority || 'medium',
                due_date: task.dueDate
            })
            .select()
            .single();

        if (error) throw error;
        return mapToTask(data);
    },

    async updateTask(id: string, updates: Partial<Task>) {
        const dbUpdates: any = {};
        if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId;
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;

        const { data, error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToTask(data);
    },

    async deleteTask(id: string) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
