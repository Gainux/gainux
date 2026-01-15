import { supabase } from "@/lib/supabase";
import type { Payroll } from "../types";

// Helper to map DB snake_case to CamelCase
const mapToPayroll = (data: any): Payroll => ({
    id: data.id,
    employeeId: data.employee_id,
    employee: data.employee ? {
        id: data.employee.id,
        firstName: data.employee.first_name,
        lastName: data.employee.last_name,
        email: "",
        hireDate: "",
        jobTitle: "",
        departmentId: "",
        salary: 0,
        status: "active",
        department: data.employee.department ? {
            id: "",
            name: data.employee.department.name,
            createdAt: ""
        } : undefined
    } : undefined,
    payPeriodStart: data.pay_period_start,
    payPeriodEnd: data.pay_period_end,
    paymentDate: data.payment_date,
    baseSalary: Number(data.base_salary),
    deductions: Number(data.deductions),
    bonuses: Number(data.bonuses),
    netPay: Number(data.net_pay),
    status: data.status,
    createdAt: data.created_at
});

export const payrollService = {
    async getPayrollRecords(month: string) { // Format: YYYY-MM
        const startOfMonth = `${month}-01`;

        // Calculate end of month roughly or use date-fns in UI to pass exact dates
        // Here we just filter by pay_period_start being in the month

        const { data, error } = await supabase
            .from('payroll')
            .select(`
                *,
                employee:employees(id, first_name, last_name, department:departments(name))
            `)
            .gte('pay_period_start', startOfMonth)
            .lte('pay_period_start', `${month}-31`) // Simple rough check
            .order('payment_date', { ascending: false });

        if (error) throw error;
        return data.map(mapToPayroll);
    },

    async generatePayroll(employeeId: string, payPeriodStart: string, payPeriodEnd: string) {
        // Fetch employee salary info
        const { data: employee } = await supabase
            .from('employees')
            .select('salary')
            .eq('id', employeeId)
            .single();

        if (!employee) throw new Error("Employee not found");

        const baseSalary = employee.salary;
        const deductions = 0; // Logic for tax/deductions can be added here
        const bonuses = 0;
        const netPay = baseSalary - deductions + bonuses;

        const { data, error } = await supabase
            .from('payroll')
            .insert({
                employee_id: employeeId,
                pay_period_start: payPeriodStart,
                pay_period_end: payPeriodEnd,
                payment_date: new Date().toISOString().split('T')[0],
                base_salary: baseSalary,
                deductions,
                bonuses,
                net_pay: netPay,
                status: 'draft'
            })
            .select()
            .single();

        if (error) throw error;
        return mapToPayroll(data);
    },

    async markAsPaid(id: string) {
        const { data, error } = await supabase
            .from('payroll')
            .update({ status: 'paid' })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToPayroll(data);
    }
};
