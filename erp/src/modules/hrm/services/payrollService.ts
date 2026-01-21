import { supabase } from '@/lib/supabase';
import type { SalaryStructure, PayrollRun, Payslip } from '../types';

const mapDbToSalaryStructure = (row: any): SalaryStructure => ({
    id: row.id,
    orgId: row.org_id,
    employeeId: row.employee_id,
    basicSalary: row.basic_salary,
    hra: row.hra,
    allowances: row.allowances,
    deductions: row.deductions,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

const mapDbToPayrollRun = (row: any): PayrollRun => ({
    id: row.id,
    orgId: row.org_id,
    month: row.month,
    year: row.year,
    status: row.status,
    totalAmount: row.total_amount,
    createdBy: row.created_by,
    createdAt: row.created_at,
    processedAt: row.processed_at
});

const mapDbToPayslip = (row: any): Payslip => ({
    id: row.id,
    orgId: row.org_id,
    payrollRunId: row.payroll_run_id,
    employeeId: row.employee_id,
    basicSalary: row.basic_salary,
    hra: row.hra,
    allowances: row.allowances,
    grossSalary: row.gross_salary,
    deductions: row.deductions,
    tax: row.tax,
    netSalary: row.net_salary,
    status: row.status,
    createdAt: row.created_at
});

export const payrollService = {
    // Salary Structures
    async getSalaryStructure(employeeId: string): Promise<SalaryStructure | null> {
        const { data, error } = await supabase
            .from('salary_structures')
            .select('*')
            .eq('employee_id', employeeId)
            .is('effective_to', null) // Get current active salary
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
        return data ? mapDbToSalaryStructure(data) : null;
    },

    async setSalaryStructure(structure: Omit<SalaryStructure, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalaryStructure> {
        // Close any existing active salary structure
        await supabase
            .from('salary_structures')
            .update({ effective_to: new Date().toISOString() })
            .eq('employee_id', structure.employeeId)
            .is('effective_to', null);

        const { data, error } = await supabase
            .from('salary_structures')
            .insert({
                org_id: structure.orgId,
                employee_id: structure.employeeId,
                basic_salary: structure.basicSalary,
                hra: structure.hra,
                allowances: structure.allowances,
                deductions: structure.deductions,
                effective_from: structure.effectiveFrom
            })
            .select()
            .single();

        if (error) throw error;
        return mapDbToSalaryStructure(data);
    },

    // Payroll Runs
    async getPayrollRuns(orgId: string): Promise<PayrollRun[]> {
        const { data, error } = await supabase
            .from('payroll_runs')
            .select('*')
            .eq('org_id', orgId)
            .order('year', { ascending: false })
            .order('month', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapDbToPayrollRun);
    },

    async createPayrollRun(orgId: string, month: number, year: number, userId: string): Promise<PayrollRun> {
        const { data, error } = await supabase
            .from('payroll_runs')
            .insert({
                org_id: orgId,
                month,
                year,
                status: 'draft',
                total_amount: 0,
                created_by: userId
            })
            .select()
            .single();

        if (error) throw error;
        return mapDbToPayrollRun(data);
    },

    async generatePayslips(payrollRunId: string, orgId: string): Promise<Payslip[]> {
        // Get all active employees
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('org_id', orgId)
            .eq('status', 'active');

        if (empError) throw empError;

        const payslips: Payslip[] = [];

        for (const emp of employees || []) {
            const salary = await this.getSalaryStructure(emp.id);

            if (salary) {
                const grossSalary = salary.basicSalary + salary.hra + salary.allowances;
                const netSalary = grossSalary - salary.deductions;

                const { data, error } = await supabase
                    .from('payslips')
                    .insert({
                        org_id: orgId,
                        payroll_run_id: payrollRunId,
                        employee_id: emp.id,
                        basic_salary: salary.basicSalary,
                        hra: salary.hra,
                        allowances: salary.allowances,
                        gross_salary: grossSalary,
                        deductions: salary.deductions,
                        tax: 0, // Simplified for MVP
                        net_salary: netSalary,
                        status: 'generated'
                    })
                    .select()
                    .single();

                if (!error && data) {
                    payslips.push(mapDbToPayslip(data));
                }
            }
        }

        // Update total amount in payroll run
        const totalAmount = payslips.reduce((sum, p) => sum + p.netSalary, 0);
        await supabase
            .from('payroll_runs')
            .update({
                total_amount: totalAmount,
                status: 'completed',
                processed_at: new Date().toISOString()
            })
            .eq('id', payrollRunId);

        return payslips;
    },

    async getPayslips(payrollRunId: string): Promise<Payslip[]> {
        const { data, error } = await supabase
            .from('payslips')
            .select('*')
            .eq('payroll_run_id', payrollRunId);

        if (error) throw error;
        return (data || []).map(mapDbToPayslip);
    },

    async getEmployeePayslips(employeeId: string): Promise<Payslip[]> {
        const { data, error } = await supabase
            .from('payslips')
            .select('*')
            .eq('employee_id', employeeId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapDbToPayslip);
    }
};
