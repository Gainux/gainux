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

    async getPayrollRunById(id: string): Promise<PayrollRun | null> {
        const { data, error } = await supabase
            .from('payroll_runs')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data ? mapDbToPayrollRun(data) : null;
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

    async deletePayrollRun(runId: string): Promise<void> {
        const { error } = await supabase
            .from('payroll_runs')
            .delete()
            .eq('id', runId);

        if (error) throw error;
    },

    async generatePayslips(payrollRunId: string, orgId: string): Promise<Payslip[]> {
        // 1. Get Organization Settings for Leave Policy
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('settings')
            .eq('id', orgId)
            .single();

        if (orgError) throw orgError;

        const paidLeavesPerYear = org.settings?.leave_policy?.paid_leaves || 0;
        const monthlyLeaveAllowance = paidLeavesPerYear / 12;

        // 2. Get Payroll Run Details for Month/Year
        const { data: run, error: runError } = await supabase
            .from('payroll_runs')
            .select('month, year')
            .eq('id', payrollRunId)
            .single();

        if (runError) throw runError;

        const startDate = new Date(Date.UTC(run.year, run.month - 1, 1)).toISOString();
        const endDate = new Date(Date.UTC(run.year, run.month, 0)).toISOString(); // Last day of month

        // 3. Get all active employees
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('org_id', orgId)
            .eq('status', 'active');

        if (empError) throw empError;

        // 4. Fetch Attendance for the Month
        // We use a raw query here to aggregate absent days efficiently, or just fetch all logs
        // unique key is employee_id, date.
        const { data: attendanceLogs, error: attError } = await supabase
            .from('attendance_logs')
            .select('employee_id, status')
            .eq('org_id', orgId)
            .gte('date', startDate)
            .lte('date', endDate);

        if (attError) throw attError;

        // Group attendance by employee
        const attendanceMap = new Map<string, { absent: number, present: number }>();
        attendanceLogs?.forEach(log => {
            const stats = attendanceMap.get(log.employee_id) || { absent: 0, present: 0 };
            if (log.status === 'absent') stats.absent++;
            else if (log.status === 'present') stats.present++;
            attendanceMap.set(log.employee_id, stats);
        });

        const payslips: Payslip[] = [];

        for (const emp of employees || []) {
            const salary = await this.getSalaryStructure(emp.id);

            if (salary) {
                // Calculate LOP
                const stats = attendanceMap.get(emp.id) || { absent: 0, present: 0 };
                // Logic: If absent days > monthly allowance, deduct salary
                // Note: deeply simplified. Real payroll considers working days, weekends, holidays etc.
                // Assuming 30 days fixed for calculation base
                const daysInMonth = 30;
                const perDaySalary = (salary.basicSalary + salary.hra + salary.allowances) / daysInMonth;

                // Allow carry forward? No, simple monthly cap for now as per "allowance" logic
                // If paidLeavesPerYear is 12, monthly is 1. If absent 2 days, 1 day LOP.
                const billableAbsentDays = Math.max(0, stats.absent - monthlyLeaveAllowance);
                const lopDeduction = billableAbsentDays * perDaySalary;

                const grossSalary = salary.basicSalary + salary.hra + salary.allowances;
                const totalDeductions = salary.deductions + lopDeduction;
                const netSalary = grossSalary - totalDeductions;

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
                        deductions: totalDeductions, // Includes LOP
                        tax: 0, // Simplified for MVP
                        net_salary: netSalary,
                        status: 'generated'
                    })
                    .select()
                    .single();

                if (error) {
                    throw new Error(`Failed to generate payslip for employee ${emp.id}: ${error.message}`);
                }
                if (data) {
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
