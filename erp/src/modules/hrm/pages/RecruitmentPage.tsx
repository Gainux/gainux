
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { recruitmentService } from "../services/recruitmentService";
import type { JobPosting, Candidate } from "../types";
import { toast } from "sonner";
import JobForm from "../components/recruitment/JobForm";
import CandidateList from "../components/recruitment/CandidateList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RecruitmentPage() {
    const { profile } = useAuth();
    const [activeTab, setActiveTab] = useState("jobs");
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    // Job Form State
    const [isJobFormOpen, setIsJobFormOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

    useEffect(() => {
        if (profile?.org_id) {
            loadData();
        }
    }, [profile?.org_id, activeTab]);

    const loadData = async () => {
        if (!profile?.org_id) return;
        setLoading(true);
        try {
            if (activeTab === "jobs") {
                const data = await recruitmentService.getJobPostings(profile.org_id);
                setJobs(data);
            } else if (activeTab === "candidates") {
                const data = await recruitmentService.getCandidates(profile.org_id);
                setCandidates(data);
            }
            // Load other data as needed
        } catch (error) {
            console.error("Failed to load recruitment data", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJob = () => {
        setEditingJob(null);
        setIsJobFormOpen(true);
    };

    const handleEditJob = (job: JobPosting) => {
        setEditingJob(job);
        setIsJobFormOpen(true);
    };

    const handleJobSaved = () => {
        setIsJobFormOpen(false);
        loadData();
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Recruitment</h2>
                    <p className="text-muted-foreground">Manage job postings, candidates, and hiring workflows.</p>
                </div>
                <div className="flex items-center space-x-2">
                    {activeTab === "jobs" && (
                        <Button onClick={handleCreateJob}>
                            <Plus className="mr-2 h-4 w-4" /> Post Job
                        </Button>
                    )}
                    {activeTab === "candidates" && (
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Add Candidate
                        </Button>
                    )}
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                    <TabsTrigger value="candidates">Candidates</TabsTrigger>
                    <TabsTrigger value="interviews">Interviews</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {jobs.map(job => (
                            <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditJob(job)}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{job.title}</CardTitle>
                                        <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                                            {job.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>{job.department?.name || 'No Department'}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {job.description}
                                    </p>
                                    <div className="mt-4 text-xs text-muted-foreground">
                                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {jobs.length === 0 && !loading && (
                            <div className="col-span-full text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                No job postings found. Create one to get started.
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="candidates" className="space-y-4">
                    <CandidateList candidates={candidates} refresh={loadData} />
                </TabsContent>

                <TabsContent value="interviews" className="space-y-4">
                    <div className="text-center p-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        Interview scheduling coming soon.
                    </div>
                </TabsContent>
            </Tabs>

            {isJobFormOpen && (
                <JobForm
                    open={isJobFormOpen}
                    onOpenChange={setIsJobFormOpen}
                    job={editingJob}
                    onSave={handleJobSaved}
                />
            )}
        </div>
    );
}
