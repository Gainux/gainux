export interface RecruitJob {
    id: string;
    orgId: string;
    title: string;
    departmentId?: string;
    designationId?: string;
    type: 'full-time' | 'part-time' | 'contract' | 'intern';
    location: string;
    description?: string;
    requirements?: string;
    salaryRangeMin?: number;
    salaryRangeMax?: number;
    status: 'draft' | 'published' | 'closed';
    createdAt: string;
    updatedAt: string;

    // Joined fields
    department?: { name: string };
    designation?: { title: string };
    _count?: {
        applications: number;
    };
}

export interface RecruitCandidate {
    id: string;
    orgId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    source?: string;
    createdAt: string;
    updatedAt: string;
}

export interface RecruitApplication {
    id: string;
    orgId: string;
    jobId: string;
    candidateId: string;
    status: 'applied' | 'screening' | 'interview' | 'offered' | 'hired' | 'rejected';
    appliedAt: string;
    notes?: string;
    rating?: number;
    updatedAt: string;

    // Joined fields
    job?: RecruitJob;
    candidate?: RecruitCandidate;
}
