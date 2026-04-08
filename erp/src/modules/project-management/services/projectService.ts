import { supabase } from "@/lib/supabase";
import type { Project, ProjectMember, Task } from "../types";

// --- Helpers ---

const mapToProject = (data: any): Project => ({
    id: data.id,
    name: data.name,
    description: data.description,
    clientId: data.client_id,
    client: data.companies ? {
        id: data.companies.id,
        name: data.companies.name
    } : undefined,
    status: data.status,
    startDate: data.start_date,
    endDate: data.end_date,
    budget: Number(data.budget),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    orgId: data.org_id
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
    updatedAt: data.updated_at,
    sprintId: data.sprint_id,
    sprint: data.sprints ? {
        id: data.sprints.id,
        name: data.sprints.name
    } : undefined
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
    async getProjects(employeeId?: string, orgId?: string) {
        if (employeeId) {
            let query = supabase
                .from('projects')
                .select(`
                    *,
                    companies (id, name),
                    resource_allocations!inner(employee_id)
                `)
                .eq('resource_allocations.employee_id', employeeId)
                .order('created_at', { ascending: false });

            if (orgId) {
                query = query.eq('org_id', orgId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data.map(mapToProject);
        } else {
            let query = supabase
                .from('projects')
                .select(`
                    *,
                    companies (id, name)
                `)
                .order('created_at', { ascending: false });

            if (orgId) {
                query = query.eq('org_id', orgId);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data.map(mapToProject);
        }
    },

    async getProjectById(id: string) {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                companies (id, name)
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
                client_id: project.clientId || null,
                status: project.status || 'planning',
                start_date: project.startDate || null,
                end_date: project.endDate || null,
                budget: project.budget,
                org_id: project.orgId || null
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
                employees (id, first_name, last_name),
                sprints (id, name)
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
                due_date: task.dueDate,
                sprint_id: task.sprintId
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
        if (updates.sprintId !== undefined) dbUpdates.sprint_id = updates.sprintId;

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
    },

    // Resource Allocation
    async getResourceAllocations(projectId: string) {
        const { data, error } = await supabase
            .from('resource_allocations')
            .select(`
                *,
                employees (id, first_name, last_name)
            `)
            .eq('project_id', projectId);

        if (error) throw error;
        return data.map((item: any) => ({
            id: item.id,
            projectId: item.project_id,
            employeeId: item.employee_id,
            employee: item.employees ? {
                id: item.employees.id,
                firstName: item.employees.first_name,
                lastName: item.employees.last_name,
                avatarUrl: item.employees.avatar_url
            } : undefined,
            startDate: item.start_date,
            endDate: item.end_date,
            allocationPercentage: item.allocation_percentage
        }));
    },

    async createResourceAllocation(allocation: any) {
        // Fetch org_id from the employee record (since project might not have it exposed or linked differently)
        // We assume the employee belongs to the same org as the resource allocation should.
        const { data: employee } = await supabase
            .from('employees')
            .select('org_id')
            .eq('id', allocation.employeeId)
            .single();

        if (!employee) throw new Error('Employee not found');

        const { data, error } = await supabase
            .from('resource_allocations')
            .insert({
                project_id: allocation.projectId,
                employee_id: allocation.employeeId,
                start_date: allocation.startDate,
                end_date: allocation.endDate,
                allocation_percentage: allocation.allocationPercentage,
                org_id: employee.org_id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateResourceAllocation(id: string, updates: Partial<any>) {
        const dbUpdates: any = {};
        if (updates.employeeId !== undefined) dbUpdates.employee_id = updates.employeeId;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.allocationPercentage !== undefined) dbUpdates.allocation_percentage = updates.allocationPercentage;

        // If employeeId is changing, we might need to update org_id too, but usually org stays same.
        // We'll skip org_id update for now as moves between orgs are rare/complex.

        const { data, error } = await supabase
            .from('resource_allocations')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteResourceAllocation(id: string) {
        const { error } = await supabase
            .from('resource_allocations')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Timesheets
    async getTimesheets(projectId?: string, orgId?: string) {
        let query = supabase
            .from('timesheets')
            .select(`
                *,
                projects (name)
            `)
            .order('date', { ascending: false });

        if (projectId) {
            query = query.eq('project_id', projectId);
        }

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map((item: any) => ({
            id: item.id,
            projectId: item.project_id,
            projectName: item.projects?.name,
            taskId: item.task_id,
            employeeId: item.employee_id,
            date: item.date,
            hours: Number(item.hours),
            description: item.description,
            status: item.status,
            isBillable: item.is_billable,
            hourlyRate: item.hourly_rate ? Number(item.hourly_rate) : undefined,
            startTime: item.start_time,
            endTime: item.end_time
        }));
    },

    async createTimesheetEntry(entry: any) {
        // Fetch org_id from the employee
        const { data: employee } = await supabase
            .from('employees')
            .select('org_id')
            .eq('id', entry.employeeId)
            .single();

        if (!employee) throw new Error('Employee not found');

        const { data, error } = await supabase
            .from('timesheets')
            .insert({
                project_id: entry.projectId,
                task_id: entry.taskId,
                employee_id: entry.employeeId,
                date: entry.date,
                hours: entry.hours,
                description: entry.description,
                status: entry.status || 'draft',
                is_billable: entry.isBillable ?? false,
                hourly_rate: entry.hourlyRate || 0,
                org_id: employee.org_id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateTimesheetEntry(id: string, updates: Partial<any>) {
        const dbUpdates: any = {};
        if (updates.hours !== undefined) dbUpdates.hours = updates.hours;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
        if (updates.taskId !== undefined) dbUpdates.task_id = updates.taskId;
        if (updates.isBillable !== undefined) dbUpdates.is_billable = updates.isBillable;
        if (updates.hourlyRate !== undefined) dbUpdates.hourly_rate = updates.hourlyRate;
        if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
        if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;

        const { data, error } = await supabase
            .from('timesheets')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteTimesheetEntry(id: string) {
        const { error } = await supabase
            .from('timesheets')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Timer Methods
    async getActiveTimer(employeeId: string) {
        const { data, error } = await supabase
            .from('timesheets')
            .select(`
                *,
                projects (name)
            `)
            .eq('employee_id', employeeId)
            .is('end_time', null)
            .maybeSingle();

        if (error) throw error;
        if (!data) return null;

        return {
            id: data.id,
            projectId: data.project_id,
            projectName: data.projects?.name,
            taskId: data.task_id,
            employeeId: data.employee_id,
            date: data.date,
            hours: Number(data.hours),
            description: data.description,
            status: data.status,
            startTime: data.start_time
        };
    },

    async startTimer(entry: any) {
        const { data: employee } = await supabase
            .from('employees')
            .select('org_id')
            .eq('id', entry.employeeId)
            .single();

        if (!employee) throw new Error('Employee not found');

        const { data, error } = await supabase
            .from('timesheets')
            .insert({
                project_id: entry.projectId,
                task_id: entry.taskId,
                employee_id: entry.employeeId,
                date: new Date().toISOString().split('T')[0], // Today
                hours: 0,
                description: entry.description,
                status: 'draft',
                org_id: employee.org_id,
                start_time: new Date().toISOString()
            })
            .select(`*, projects(name)`)
            .single();

        if (error) throw error;
        return {
            id: data.id,
            projectId: data.project_id,
            projectName: data.projects?.name,
            taskId: data.task_id,
            employeeId: data.employee_id,
            date: data.date,
            description: data.description,
            startTime: data.start_time
        };
    },

    async stopTimer(id: string) {
        const endTime = new Date();

        // Fetch result first to calculate duration
        const { data: entry } = await supabase
            .from('timesheets')
            .select('start_time')
            .eq('id', id)
            .single();

        if (!entry) throw new Error('Timer not found');

        const startTime = new Date(entry.start_time);
        const durationMs = endTime.getTime() - startTime.getTime();
        const hours = durationMs / (1000 * 60 * 60);

        const { data, error } = await supabase
            .from('timesheets')
            .update({
                end_time: endTime.toISOString(),
                hours: Number(hours.toFixed(2))
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Expenses
    async getProjectExpenses(projectId: string) {
        const { data, error } = await supabase
            .from('project_expenses')
            .select('*')
            .eq('project_id', projectId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data.map((item: any) => ({
            id: item.id,
            projectId: item.project_id,
            category: item.category,
            amount: Number(item.amount),
            date: item.date,
            description: item.description
        }));
    },

    async createProjectExpense(expense: any) {
        const { data, error } = await supabase
            .from('project_expenses')
            .insert({
                project_id: expense.projectId,
                category: expense.category,
                amount: expense.amount,
                date: expense.date,
                description: expense.description
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },
    // Sprints
    async getSprints(projectId: string) {
        const { data, error } = await supabase
            .from('sprints')
            .select('*')
            .eq('project_id', projectId)
            .order('start_date', { ascending: false });

        if (error) throw error;
        return data.map((item: any) => ({
            id: item.id,
            projectId: item.project_id,
            name: item.name,
            startDate: item.start_date,
            endDate: item.end_date,
            status: item.status,
            goal: item.goal,
            createdAt: item.created_at
        }));
    },

    async createSprint(sprint: any) {
        const { data, error } = await supabase
            .from('sprints')
            .insert({
                project_id: sprint.projectId,
                name: sprint.name,
                start_date: sprint.startDate,
                end_date: sprint.endDate,
                status: sprint.status || 'planned',
                goal: sprint.goal
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateSprint(id: string, updates: Partial<any>) {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
        if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.goal !== undefined) dbUpdates.goal = updates.goal;

        const { data, error } = await supabase
            .from('sprints')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteSprint(id: string) {
        const { error } = await supabase
            .from('sprints')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
