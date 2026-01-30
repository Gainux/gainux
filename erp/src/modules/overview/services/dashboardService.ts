import { invoiceService } from "@/modules/finance/services/invoiceService";
import { dealService } from "@/modules/crm/services/dealService";
import { salesOrderService } from "@/modules/crm/services/salesOrderService";
import { projectService } from "@/modules/project-management/services/projectService";
import { employeeService } from "@/modules/hrm/services/employeeService";
import { userService } from "@/modules/system/services/userService";
import { supabase } from "@/lib/supabase";

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
        recentOrders: any[];
        funnel: { name: string; value: number }[];
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
    async getDashboardMetrics(orgId: string): Promise<DashboardMetrics> {
        // Fetch all data in parallel
        const [
            financialMetrics,
            deals,
            orders,
            projects,
            employees,
            users
        ] = await Promise.all([
            invoiceService.getFinancialMetrics(orgId),
            dealService.getDeals(orgId),
            salesOrderService.getOrders(orgId),
            projectService.getProjects(undefined, orgId),
            employeeService.getEmployees(orgId),
            userService.getUsers() // Users might be global or needing filter, checking userService later
        ]);

        // CRM Metrics
        const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
        const pipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
        const recentDeals = deals.slice(0, 5);

        // Project Metrics
        const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'planning');
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
                recentOrders: orders.slice(0, 5),
                funnel: [
                    { name: 'Lead', value: deals.filter(d => d.stage === 'lead').length },
                    { name: 'Proposal', value: deals.filter(d => d.stage === 'proposal').length },
                    { name: 'Negotiation', value: deals.filter(d => d.stage === 'negotiation').length },
                    { name: 'Won', value: deals.filter(d => d.stage === 'won').length },
                    { name: 'Lost', value: deals.filter(d => d.stage === 'lost').length }
                ]
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
    },

    async getAnalyticsData(orgId?: string) {
        // Fetch data
        let expensesQuery = supabase.from("expenses").select("*");
        if (orgId) expensesQuery = expensesQuery.eq("org_id", orgId);

        const [invoices, expenses, deals] = await Promise.all([
            invoiceService.getInvoices(orgId),
            expensesQuery,
            dealService.getDeals(orgId)
        ]);

        const allInvoices = invoices;
        const allExpenses = expenses.data || [];
        const allDeals = deals;

        // 1. Revenue & Expenses Over Time (Last 6 Months)
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            return d.toLocaleString('default', { month: 'short' });
        }).reverse();

        const financialsOverTime = months.map(month => {
            const revenue = allInvoices
                .filter(inv => inv.issueDate && new Date(inv.issueDate).toLocaleString('default', { month: 'short' }) === month)
                .reduce((sum, inv) => sum + (inv.total || 0), 0);

            const expense = allExpenses
                .filter((exp: any) => exp.date && new Date(exp.date).toLocaleString('default', { month: 'short' }) === month)
                .reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0);

            return { name: month, revenue, expense };
        });

        // 2. Deals by Stage
        const dealsByStage = allDeals.reduce((acc, deal) => {
            const stage = deal.stage || 'Unknown';
            acc[stage] = (acc[stage] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const dealsByStageData = Object.entries(dealsByStage).map(([name, value]) => ({ name, value }));

        // 3. Expense Categories
        const expensesByCategory = allExpenses.reduce((acc: Record<string, number>, exp: any) => {
            const cat = exp.category || 'Uncategorized';
            acc[cat] = (acc[cat] || 0) + (Number(exp.amount) || 0);
            return acc;
        }, {});
        const expensesByCategoryData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));

        return {
            financialsOverTime,
            dealsByStageData,
            expensesByCategoryData
        };
    }
};
