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
    leaveType?: 'paid' | 'sick' | 'unpaid' | 'casual' | 'other';
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

export interface PerformanceGoal {
    id: string;
    orgId: string;
    employeeId: string;
    title: string;
    description?: string;
    status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    progress: number;
    createdAt: string;
    updatedAt: string;
}

export interface PerformanceReview {
    id: string;
    orgId: string;
    employeeId: string;
    reviewerId?: string;
    reviewer?: Employee;
    cycleName: string;
    status: 'draft' | 'scheduled' | 'in_progress' | 'completed' | 'signed';
    rating?: number;
    feedback?: string;
    reviewDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PerformanceStats {
    taskCompletionRate: number; // Percentage
    completedTasks: number;
    totalTasks: number;
    attendanceRate: number; // Percentage
    presentDays: number;
    totalWorkingDays: number;
    timesheetHours: number;
    goalsCompleted: number;
    totalGoals: number;
    averageRating: number;
}

export interface JobPosting {
    id: string;
    orgId: string;
    title: string;
    departmentId?: string;
    department?: Department;
    description?: string;
    requirements?: string[];
    type: 'full_time' | 'part_time' | 'contract' | 'internship';
    location?: string;
    salaryRangeMin?: number;
    salaryRangeMax?: number;
    currency: string;
    status: 'draft' | 'published' | 'closed' | 'archived';
    postedDate?: string;
    closingDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Candidate {
    id: string;
    orgId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
    skills?: string[];
    source?: string;
    createdAt: string;
    updatedAt: string;
}

export interface JobApplication {
    id: string;
    orgId: string;
    jobId: string;
    job?: JobPosting;
    candidateId: string;
    candidate?: Candidate;
    status: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
    coverLetter?: string;
    appliedDate: string;
    rating?: number;
    notes?: string;
    updatedAt: string;
}

export interface Interview {
    id: string;
    orgId: string;
    applicationId: string;
    application?: JobApplication;
    interviewerId?: string;
    interviewer?: Employee;
    roundName: string;
    scheduledAt: string;
    durationMinutes: number;
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
    feedback?: string;
    rating?: number;
    meetingLink?: string;
    createdAt: string;
    updatedAt: string;
}
