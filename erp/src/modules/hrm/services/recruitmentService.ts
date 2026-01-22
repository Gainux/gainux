
import { supabase } from '@/lib/supabase';
import type { JobPosting, Candidate, JobApplication, Interview } from '../types';

export const recruitmentService = {
    // Job Postings
    async getJobPostings(orgId: string): Promise<JobPosting[]> {
        const { data, error } = await supabase
            .from('recruitment_jobs')
            .select('*, department:departments(*)')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapDbToJobPosting);
    },

    async getJobPostingById(id: string): Promise<JobPosting | null> {
        const { data, error } = await supabase
            .from('recruitment_jobs')
            .select('*, department:departments(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return null;
        return mapDbToJobPosting(data);
    },

    async createJobPosting(job: Partial<JobPosting>): Promise<JobPosting> {
        const dbJob = mapJobPostingToDb(job);
        const { data, error } = await supabase
            .from('recruitment_jobs')
            .insert(dbJob)
            .select()
            .single();

        if (error) throw error;
        return mapDbToJobPosting(data);
    },

    async updateJobPosting(id: string, updates: Partial<JobPosting>): Promise<JobPosting> {
        const dbUpdates = mapJobPostingToDb(updates);
        const { data, error } = await supabase
            .from('recruitment_jobs')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapDbToJobPosting(data);
    },

    async deleteJobPosting(id: string): Promise<void> {
        const { error } = await supabase
            .from('recruitment_jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Candidates
    async getCandidates(orgId: string): Promise<Candidate[]> {
        const { data, error } = await supabase
            .from('recruitment_candidates')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapDbToCandidate);
    },

    async createCandidate(candidate: Partial<Candidate>): Promise<Candidate> {
        const dbCandidate = mapCandidateToDb(candidate);
        const { data, error } = await supabase
            .from('recruitment_candidates')
            .insert(dbCandidate)
            .select()
            .single();

        if (error) throw error;
        return mapDbToCandidate(data);
    },

    // Applications
    async getApplications(orgId: string, jobId?: string): Promise<JobApplication[]> {
        let query = supabase
            .from('recruitment_applications')
            .select('*, job:recruitment_jobs(*), candidate:recruitment_candidates(*)')
            .eq('org_id', orgId);

        if (jobId) {
            query = query.eq('job_id', jobId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data.map(mapDbToApplication);
    },

    async createApplication(application: Partial<JobApplication>): Promise<JobApplication> {
        const dbApp = mapApplicationToDb(application);
        const { data, error } = await supabase
            .from('recruitment_applications')
            .insert(dbApp)
            .select()
            .single();

        if (error) throw error;
        return mapDbToApplication(data);
    },

    async updateApplicationStatus(id: string, status: string): Promise<void> {
        const { error } = await supabase
            .from('recruitment_applications')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    },

    // Interviews
    async getInterviews(orgId: string): Promise<Interview[]> {
        const { data, error } = await supabase
            .from('recruitment_interviews')
            .select('*, application:recruitment_applications(*, candidate:recruitment_candidates(*), job:recruitment_jobs(*)), interviewer:employees(*)')
            .eq('org_id', orgId)
            .order('scheduled_at', { ascending: true });

        if (error) throw error;
        return data.map(mapDbToInterview);
    },

    async scheduleInterview(interview: Partial<Interview>): Promise<Interview> {
        const dbInterview = mapInterviewToDb(interview);
        const { data, error } = await supabase
            .from('recruitment_interviews')
            .insert(dbInterview)
            .select()
            .single();

        if (error) throw error;
        return mapDbToInterview(data);
    }
};

// Mappers

const mapDbToJobPosting = (row: any): JobPosting => ({
    id: row.id,
    orgId: row.org_id,
    title: row.title,
    departmentId: row.department_id,
    department: row.department, // Assuming shallow expansion or handled elsewhere
    description: row.description,
    requirements: row.requirements,
    type: row.type,
    location: row.location,
    salaryRangeMin: row.salary_range_min,
    salaryRangeMax: row.salary_range_max,
    currency: row.currency,
    status: row.status,
    postedDate: row.posted_date,
    closingDate: row.closing_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

const mapJobPostingToDb = (job: Partial<JobPosting>) => ({
    org_id: job.orgId,
    title: job.title,
    department_id: job.departmentId,
    description: job.description,
    requirements: job.requirements,
    type: job.type,
    location: job.location,
    salary_range_min: job.salaryRangeMin,
    salary_range_max: job.salaryRangeMax,
    currency: job.currency,
    status: job.status,
    posted_date: job.postedDate,
    closing_date: job.closingDate
});

const mapDbToCandidate = (row: any): Candidate => ({
    id: row.id,
    orgId: row.org_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    resumeUrl: row.resume_url,
    portfolioUrl: row.portfolio_url,
    linkedinUrl: row.linkedin_url,
    skills: row.skills,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

const mapCandidateToDb = (candidate: Partial<Candidate>) => ({
    org_id: candidate.orgId,
    first_name: candidate.firstName,
    last_name: candidate.lastName,
    email: candidate.email,
    phone: candidate.phone,
    resume_url: candidate.resumeUrl,
    portfolio_url: candidate.portfolioUrl,
    linkedin_url: candidate.linkedinUrl,
    skills: candidate.skills,
    source: candidate.source
});

const mapDbToApplication = (row: any): JobApplication => ({
    id: row.id,
    orgId: row.org_id,
    jobId: row.job_id,
    job: row.job ? mapDbToJobPosting(row.job) : undefined,
    candidateId: row.candidate_id,
    candidate: row.candidate ? mapDbToCandidate(row.candidate) : undefined,
    status: row.status,
    coverLetter: row.cover_letter,
    appliedDate: row.applied_date,
    rating: row.rating,
    notes: row.notes,
    updatedAt: row.updated_at
});

const mapApplicationToDb = (app: Partial<JobApplication>) => ({
    org_id: app.orgId,
    job_id: app.jobId,
    candidate_id: app.candidateId,
    status: app.status,
    cover_letter: app.coverLetter,
    applied_date: app.appliedDate,
    rating: app.rating,
    notes: app.notes
});

const mapDbToInterview = (row: any): Interview => ({
    id: row.id,
    orgId: row.org_id,
    applicationId: row.application_id,
    application: row.application ? mapDbToApplication(row.application) : undefined,
    interviewerId: row.interviewer_id,
    interviewer: row.interviewer, // Assuming employee expansion
    roundName: row.round_name,
    scheduledAt: row.scheduled_at,
    durationMinutes: row.duration_minutes,
    status: row.status,
    feedback: row.feedback,
    rating: row.rating,
    meetingLink: row.meeting_link,
    createdAt: row.created_at,
    updatedAt: row.updated_at
});

const mapInterviewToDb = (interview: Partial<Interview>) => ({
    org_id: interview.orgId,
    application_id: interview.applicationId,
    interviewer_id: interview.interviewerId,
    round_name: interview.roundName,
    scheduled_at: interview.scheduledAt,
    duration_minutes: interview.durationMinutes,
    status: interview.status,
    feedback: interview.feedback,
    rating: interview.rating,
    meeting_link: interview.meetingLink
});
