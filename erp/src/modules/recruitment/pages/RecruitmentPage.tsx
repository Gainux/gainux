import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobListPage from "./JobListPage";
import CandidateListPage from "./CandidateListPage";
// import PipelineBoard from "./PipelineBoard"; // Coming soon

export default function RecruitmentPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Recruitment</h2>
            </div>
            <Tabs defaultValue="jobs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                    <TabsTrigger value="candidates">Candidates</TabsTrigger>
                    <TabsTrigger value="pipeline">Application Pipeline</TabsTrigger>
                </TabsList>
                <TabsContent value="jobs" className="space-y-4">
                    <JobListPage />
                </TabsContent>
                <TabsContent value="candidates" className="space-y-4">
                    <CandidateListPage />
                </TabsContent>
                <TabsContent value="pipeline" className="space-y-4">
                    <div className="flex items-center justify-center p-8 border rounded-lg bg-muted/10 border-dashed">
                        <p className="text-muted-foreground">Kanban board coming soon</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
