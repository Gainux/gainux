import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobListPage from "./JobListPage";
import CandidateListPage from "./CandidateListPage";
import PipelineBoard from "./PipelineBoard";

export default function RecruitmentPage() {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Recruitment</h2>
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
                <TabsContent value="pipeline" className="space-y-4 h-[calc(100vh-220px)]">
                    <PipelineBoard />
                </TabsContent>
            </Tabs>
        </div>
    );
}
