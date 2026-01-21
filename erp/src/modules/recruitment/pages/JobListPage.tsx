import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { recruitmentService } from "../services/recruitmentService";
import type { RecruitJob } from "../types";
import { useAuth } from "@/context/AuthContext";
import { CreateJobDialog } from "../components/CreateJobDialog";

export default function JobListPage() {
    const { profile } = useAuth();
    const [jobs, setJobs] = useState<RecruitJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const [selectedJob, setSelectedJob] = useState<RecruitJob | null>(null);

    const loadJobs = async () => {
        if (!profile?.org_id) return;
        try {
            setLoading(true);
            const data = await recruitmentService.getJobs(profile.org_id);
            setJobs(data);
        } catch (error) {
            console.error("Failed to load jobs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, [profile?.org_id]);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
                <Button onClick={() => {
                    setSelectedJob(null);
                    setIsCreateOpen(true);
                }}>
                    <Plus className="h-4 w-4 mr-2" /> Post Job
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Job Postings</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading jobs...</div>
                    ) : filteredJobs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No job postings found. Create one to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Posted On</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell>
                                            <div className="font-medium">{job.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {job.designation?.title}
                                            </div>
                                        </TableCell>
                                        <TableCell>{job.department?.name || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {job.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {job.location}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={job.status === 'published' ? 'default' : 'secondary'}>
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <Briefcase className="h-3 w-3 mr-1" />
                                                {format(new Date(job.createdAt), 'MMM d, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    setIsCreateOpen(true);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <CreateJobDialog
                open={isCreateOpen}
                onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) setSelectedJob(null);
                }}
                onSuccess={loadJobs}
                job={selectedJob}
            />
        </div>
    );
}
