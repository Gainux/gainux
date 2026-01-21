import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { recruitmentService } from "../services/recruitmentService";
import type { RecruitJob } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Briefcase, Clock, ArrowRight, Search, Building2 } from "lucide-react";
import { format } from "date-fns";

export default function PublicJobBoard() {
    const { orgId } = useParams();
    const [jobs, setJobs] = useState<RecruitJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (orgId) {
            loadJobs();
        }
    }, [orgId]);

    const loadJobs = async () => {
        if (!orgId) return;
        try {
            setLoading(true);
            setError("");
            const data = await recruitmentService.getPublicJobs(orgId);
            setJobs(data);
        } catch (err: any) {
            if (err.name === 'AbortError' || err.message?.includes('aborted')) {
                console.log('Fetch aborted');
                return;
            }
            console.error(err);
            setError("Failed to load job postings. Please check the URL or try again later.");
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.department?.name && job.department.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse">Loading career opportunities...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Jobs</h2>
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <section className="relative -mt-8 py-20 px-4 mb-12 bg-gradient-to-br from-indigo-900 via-violet-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl text-center text-white">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md px-4 py-1.5 mb-4">
                        We're Hiring
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                        Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Team</span>
                    </h1>
                    <p className="text-lg md:text-xl text-indigo-100/90 leading-relaxed max-w-xl mx-auto">
                        Help us build the future of enterprise software. We're looking for passionate individuals to join our mission.
                    </p>

                    {/* Search Box */}
                    <div className="relative max-w-lg mx-auto mt-8 transform transition-all hover:scale-105 duration-300">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground">
                            <Search className="h-5 w-5" />
                        </div>
                        <Input
                            placeholder="Search by role, department, or location..."
                            className="pl-12 h-14 rounded-full bg-white/95 backdrop-blur border-0 shadow-lg text-gray-900 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-indigo-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Job List */}
            <div className="max-w-5xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Open Positions <span className="text-sm font-normal text-muted-foreground ml-2">({filteredJobs.length})</span>
                    </h2>
                </div>

                <div className="grid gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 mb-14 bg-white rounded-2xl border border-dashed text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <Search className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                We couldn't find any positions matching "{searchTerm}". Try adjusting your search keywords.
                            </p>
                            <Button
                                variant="link"
                                className="mt-4 text-indigo-600"
                                onClick={() => setSearchTerm("")}
                            >
                                Clear Search
                            </Button>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <Card key={job.id} className="group overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-xl">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row md:items-center p-6 md:p-8 gap-6">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0">
                                                    {job.type}
                                                </Badge>
                                                {job.createdAt && (
                                                    <Badge variant="outline" className="text-xs text-muted-foreground border-gray-200">
                                                        New
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1.5 transition-colors hover:text-gray-900">
                                                    <Briefcase className="h-4 w-4 text-indigo-500/70" />
                                                    {job.department?.name}
                                                </span>
                                                <span className="flex items-center gap-1.5 transition-colors hover:text-gray-900">
                                                    <MapPin className="h-4 w-4 text-pink-500/70" />
                                                    {job.location}
                                                </span>
                                                <span className="flex items-center gap-1.5 transition-colors hover:text-gray-900">
                                                    <Clock className="h-4 w-4 text-blue-500/70" />
                                                    Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center">
                                            <Button asChild className="w-full md:w-auto bg-gray-900 hover:bg-indigo-600 text-white rounded-lg px-6 h-11 transition-colors shadow-lg shadow-gray-900/10 hover:shadow-indigo-600/20 group-hover:scale-105 duration-200">
                                                <Link to={`/careers/${orgId}/jobs/${job.id}`}>
                                                    View Details <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                    {/* Progress bar effect on hover */}
                                    <div className="h-0.5 w-0 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-500 ease-out"></div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
