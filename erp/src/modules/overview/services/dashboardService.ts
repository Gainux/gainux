import { invoiceService } from "@/modules/finance/services/invoiceService";
import { dealService } from "@/modules/crm/services/dealService";
import { projectService } from "@/modules/project-management/services/projectService";
import { employeeService } from "@/modules/hrm/services/employeeService";
import { userService } from "@/modules/system/services/userService";

export interface DashboardMetrics {
    financial: {
        revenue: number;
        profit: number;
        expenses: number;
        outstanding: number;
    };
    crm: {
        activeDeals: number;
        pipelineValue: number;
        recentDeals: any[];
    };
    projects: {
        activeProjects: number;
        completedProjects: number;
        recentProjects: any[];
    };
    hrm: {
        totalEmployees: number;
        byDepartment: Record<string, number>;
    };
    system: {
        totalUsers: number;
    };
}

export const dashboardService = {
    async getDashboardMetrics(): Promise<DashboardMetrics> {
        // Fetch all data in parallel
        const [
            financialMetrics,
            deals,
            projects,
            employees,
            users
        ] = await Promise.all([
            invoiceService.getFinancialMetrics(),
            dealService.getDeals(),
            projectService.getProjects(),
            employeeService.getEmployees(),
            userService.getUsers()
        ]);

        // CRM Metrics
        const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
        const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        const recentDeals = deals.slice(0, 5);

        // Project Metrics
        const activeProjects = projects.filter(p => p.status === 'in_progress' || p.status === 'planning');
        const completedProjects = projects.filter(p => p.status === 'completed');
        const recentProjects = projects.slice(0, 5);

        // HRM Metrics
        const employeesByDepartment = employees.reduce((acc, emp) => {
            const deptName = emp.department?.name || 'Unassigned';
            acc[deptName] = (acc[deptName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            financial: {
                revenue: financialMetrics.totalRevenue,
                profit: financialMetrics.profit,
                expenses: financialMetrics.totalExpenses,
                outstanding: financialMetrics.outstandingAmount
            },
            crm: {
                activeDeals: activeDeals.length,
                pipelineValue,
                recentDeals,
            },
            projects: {
                activeProjects: activeProjects.length,
                completedProjects: completedProjects.length,
                recentProjects,
            },
            hrm: {
                totalEmployees: employees.length,
                byDepartment: employeesByDepartment
            },
            system: {
                totalUsers: users.length
            }
        };
    }
};
