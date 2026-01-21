export interface Department {
    id: string;
    orgId: string;
    name: string;
    description?: string;
    managerId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Designation {
    id: string;
    orgId: string;
    title: string;
    description?: string;
    createdAt: string;
}

export interface Employee {
    id: string;
    orgId: string;
    userId: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    dateOfJoining: string;
    departmentId?: string;
    department?: Department;
    designationId?: string;
    designation?: Designation;
    managerId?: string;
    manager?: Employee;
    employmentType: 'full-time' | 'part-time' | 'contract' | 'intern';
    status: 'active' | 'inactive' | 'terminated';
    createdAt: string;
    updatedAt: string;
}

export interface EmployeeDocument {
    id: string;
    orgId: string;
    employeeId: string;
    name: string;
    url: string;
    type: 'resume' | 'contract' | 'id_proof' | 'certificate' | 'other';
    uploadedAt: string;
}

export interface AttendanceLog {
    id: string;
    orgId: string;
    employeeId: string;
    employee?: Employee;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeaveType {
    id: string;
    orgId: string;
    name: string;
    daysAllowedPerYear: number;
    isPaid: boolean;
    createdAt: string;
}

export interface LeaveRequest {
    id: string;
    orgId: string;
    employeeId: string;
    employee?: Employee;
    leaveTypeId: string;
    leaveType?: LeaveType;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface LeaveBalance {
    id: string;
    orgId: string;
    employeeId: string;
    leaveTypeId: string;
    leaveType?: LeaveType;
    year: number;
    daysTaken: number;
    daysRemaining: number;
    createdAt: string;
    updatedAt: string;
}

export interface SalaryStructure {
    id: string;
    orgId: string;
    employeeId: string;
    basicSalary: number;
    hra: number;
    allowances: number;
    deductions: number;
    effectiveFrom: string;
    effectiveTo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PayrollRun {
    id: string;
    orgId: string;
    month: number;
    year: number;
    status: 'draft' | 'processing' | 'completed' | 'paid';
    totalAmount: number;
    createdBy?: string;
    createdAt: string;
    processedAt?: string;
}

export interface Payslip {
    id: string;
    orgId: string;
    payrollRunId: string;
    employeeId: string;
    employee?: Employee;
    basicSalary: number;
    hra: number;
    allowances: number;
    grossSalary: number;
    deductions: number;
    tax: number;
    netSalary: number;
    status: 'generated' | 'sent' | 'paid';
    createdAt: string;
}
