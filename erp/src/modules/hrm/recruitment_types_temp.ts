export interface JobPosting {
    id: string;
    orgId: string;
    title: string;
    departmentId?: string;
    department?: Department; // Assuming reusing the existing Department interface
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
