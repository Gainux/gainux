import { supabase } from '@/lib/supabase';
import type { RecruitJob, RecruitCandidate, RecruitApplication } from '../types';

export const recruitmentService = {
    // Jobs
    async getJobs(orgId: string): Promise<RecruitJob[]> {
        const { data, error } = await supabase
            .from('recruit_jobs')
            .select(`
                *,
                department:departments(name),
                designation:designations(title)
            `)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map joined data and count applications (manual count or separate query usually, but basic select for now)
        // For application count, we might need a separate query or use .select('*, applications:recruit_applications(count)')

        return data.map((row: any) => ({
            id: row.id,
            orgId: row.org_id,
            title: row.title,
            departmentId: row.department_id,
            designationId: row.designation_id,
            type: row.type,
            location: row.location,
            description: row.description,
            requirements: row.requirements,
            salaryRangeMin: row.salary_range_min,
            salaryRangeMax: row.salary_range_max,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            department: row.department,
            designation: row.designation
        }));
    },

    async createJob(job: Partial<RecruitJob>): Promise<RecruitJob> {
        const { data, error } = await supabase
            .from('recruit_jobs')
            .insert({
                org_id: job.orgId,
                title: job.title,
                department_id: job.departmentId,
                designation_id: job.designationId,
                type: job.type,
                location: job.location,
                description: job.description,
                requirements: job.requirements,
                salary_range_min: job.salaryRangeMin,
                salary_range_max: job.salaryRangeMax,
                status: job.status || 'draft'
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            orgId: data.org_id,
            departmentId: data.department_id,
            designationId: data.designation_id,
            salaryRangeMin: data.salary_range_min,
            salaryRangeMax: data.salary_range_max,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async updateJob(id: string, updates: Partial<RecruitJob>): Promise<void> {
        const { error } = await supabase
            .from('recruit_jobs')
            .update({
                title: updates.title,
                department_id: updates.departmentId,
                designation_id: updates.designationId,
                type: updates.type,
                location: updates.location,
                description: updates.description,
                requirements: updates.requirements,
                salary_range_min: updates.salaryRangeMin,
                salary_range_max: updates.salaryRangeMax,
                status: updates.status
            })
            .eq('id', id);

        if (error) throw error;
    },

    async deleteJob(id: string): Promise<void> {
        const { error } = await supabase
            .from('recruit_jobs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Candidates
    async getCandidates(orgId: string): Promise<RecruitCandidate[]> {
        const { data, error } = await supabase
            .from('recruit_candidates')
            .select('*')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            orgId: row.org_id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
            phone: row.phone,
            resumeUrl: row.resume_url,
            portfolioUrl: row.portfolio_url,
            source: row.source,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));
    },

    async createCandidate(candidate: Partial<RecruitCandidate>): Promise<RecruitCandidate> {
        const { data, error } = await supabase
            .from('recruit_candidates')
            .insert({
                org_id: candidate.orgId,
                first_name: candidate.firstName,
                last_name: candidate.lastName,
                email: candidate.email,
                phone: candidate.phone,
                resume_url: candidate.resumeUrl,
                portfolio_url: candidate.portfolioUrl,
                source: candidate.source
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            orgId: data.org_id,
            firstName: data.first_name,
            lastName: data.last_name,
            resumeUrl: data.resume_url,
            portfolioUrl: data.portfolio_url,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async deleteCandidate(id: string): Promise<void> {
        const { error } = await supabase
            .from('recruit_candidates')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    // Applications
    async getApplications(orgId: string, jobId?: string): Promise<RecruitApplication[]> {
        let query = supabase
            .from('recruit_applications')
            .select(`
                *,
                job:recruit_jobs(title),
                candidate:recruit_candidates(*)
            `)
            .eq('org_id', orgId);

        if (jobId) {
            query = query.eq('job_id', jobId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            orgId: row.org_id,
            jobId: row.job_id,
            candidateId: row.candidate_id,
            status: row.status,
            appliedAt: row.applied_at,
            notes: row.notes,
            rating: row.rating,
            updatedAt: row.updated_at,
            job: row.job,
            candidate: {
                ...row.candidate,
                firstName: row.candidate.first_name,
                lastName: row.candidate.last_name,
                resumeUrl: row.candidate.resume_url,
                portfolioUrl: row.candidate.portfolio_url,
                createdAt: row.candidate.created_at,
                updatedAt: row.candidate.updated_at
            }
        }));
    },

    async updateApplicationStatus(id: string, status: RecruitApplication['status']): Promise<void> {
        const { error } = await supabase
            .from('recruit_applications')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    },

    // Public Methods
    async getPublicJobs(orgId: string): Promise<RecruitJob[]> {
        const { data, error } = await supabase
            .from('recruit_jobs')
            .select(`
                *,
                department:departments(name),
                designation:designations(title)
            `)
            .eq('org_id', orgId)
            .eq('status', 'published')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((row: any) => ({
            id: row.id,
            orgId: row.org_id,
            title: row.title,
            departmentId: row.department_id,
            designationId: row.designation_id,
            type: row.type,
            location: row.location,
            description: row.description,
            requirements: row.requirements,
            salaryRangeMin: row.salary_range_min,
            salaryRangeMax: row.salary_range_max,
            status: row.status,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            department: row.department,
            designation: row.designation
        }));
    },

    async getPublicJobById(jobId: string): Promise<RecruitJob | null> {
        const { data, error } = await supabase
            .from('recruit_jobs')
            .select(`
                *,
                department:departments(name),
                designation:designations(title)
            `)
            .eq('id', jobId)
            .eq('status', 'published')
            .single();

        if (error) return null;

        return {
            id: data.id,
            orgId: data.org_id,
            title: data.title,
            departmentId: data.department_id,
            designationId: data.designation_id,
            type: data.type,
            location: data.location,
            description: data.description,
            requirements: data.requirements,
            salaryRangeMin: data.salary_range_min,
            salaryRangeMax: data.salary_range_max,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            department: data.department,
            designation: data.designation
        };
    },

    async applyForJob(jobId: string, orgId: string, candidateData: any): Promise<void> {
        // Generate IDs client-side to avoid needing SELECT permissions on the inserted row
        // (This helps bypass strict RLS read policies for authenticated users applying to other orgs)
        const candidateId = crypto.randomUUID();
        const applicationId = crypto.randomUUID();

        // 1. Create Candidate
        const { error: candidateError } = await supabase
            .from('recruit_candidates')
            .insert({
                id: candidateId,
                org_id: orgId,
                first_name: candidateData.firstName,
                last_name: candidateData.lastName,
                email: candidateData.email,
                phone: candidateData.phone,
                resume_url: candidateData.resumeUrl,
                source: 'Website'
            });

        if (candidateError) throw candidateError;

        // 2. Create Application
        const { error: appError } = await supabase
            .from('recruit_applications')
            .insert({
                id: applicationId,
                org_id: orgId,
                job_id: jobId,
                candidate_id: candidateId,
                status: 'applied'
            });

        if (appError) throw appError;
    },

    async createApplication(application: Partial<RecruitApplication>): Promise<RecruitApplication> {
        const { data, error } = await supabase
            .from('recruit_applications')
            .insert({
                org_id: application.orgId,
                job_id: application.jobId,
                candidate_id: application.candidateId,
                status: application.status || 'applied',
                notes: application.notes,
                rating: application.rating
            })
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            orgId: data.org_id,
            jobId: data.job_id,
            candidateId: data.candidate_id,
            appliedAt: data.applied_at,
            updatedAt: data.updated_at
        }
    }
};
