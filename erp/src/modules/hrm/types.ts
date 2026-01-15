export interface Department {
    id: string;
    name: string;
    managerId?: string;
    createdAt: string;
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    hireDate: string;
    jobTitle: string;
    departmentId?: string;
    department?: Department; // Joined
    salary: number;
    status: 'active' | 'on_leave' | 'terminated';
    address?: string;
    emergencyContact?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Attendance {
    id: string;
    employeeId: string;
    employee?: Employee; // Joined
    date: string;
    clockIn?: string;
    clockOut?: string;
    status: 'present' | 'absent' | 'late' | 'half_day';
    notes?: string;
    createdAt?: string;
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    employee?: Employee; // Joined
    leaveType: 'vacation' | 'sick' | 'personal' | 'maternity' | 'unpaid';
    startDate: string;
    endDate: string;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    createdAt?: string;
}

export interface Payroll {
    id: string;
    employeeId: string;
    employee?: Employee; // Joined
    payPeriodStart: string;
    payPeriodEnd: string;
    paymentDate: string;
    baseSalary: number;
    deductions: number;
    bonuses: number;
    netPay: number;
    status: 'draft' | 'processed' | 'paid';
    createdAt?: string;
}
