import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { recruitmentService } from "../services/recruitmentService";
import type { RecruitJob } from "../types";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Clock, ArrowLeft, Send, CheckCircle2, Building2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const formSchema = z.object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    resumeUrl: z.string().url("Please provide a valid URL to your resume/portfolio").optional().or(z.literal("")),
    coverLetter: z.string().optional(),
});

export default function PublicJobDetails() {
    const { orgId, jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState<RecruitJob | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            resumeUrl: "",
            coverLetter: "",
        },
    });

    useEffect(() => {
        if (jobId) {
            loadJob();
        }
    }, [jobId]);

    const loadJob = async () => {
        if (!jobId) return;
        try {
            setLoading(true);
            const data = await recruitmentService.getPublicJobById(jobId);
            setJob(data);
        } catch (err: any) {
            if (err.name === 'AbortError' || err.message?.includes('aborted')) return;
            console.error(err);
            toast.error("Failed to load job details");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!orgId || !jobId) return;
        try {
            setSubmitting(true);
            await recruitmentService.applyForJob(jobId, orgId, values);
            setSuccess(true);
            toast.success("Application submitted successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit application. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground animate-pulse">Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Job Not Found</h2>
                <Button variant="outline" onClick={() => navigate(`/careers/${orgId}`)}>
                    Back to Jobs
                </Button>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm animate-in zoom-in duration-300">
                    <Send className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Application Sent!</h2>
                    <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                        Thank you for applying to the <span className="font-semibold text-gray-900">{job.title}</span> position.
                    </p>
                </div>
                <div className="bg-slate-50 border rounded-xl p-6 text-sm text-left max-w-sm mx-auto space-y-3">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-muted-foreground">We have received your application details.</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-muted-foreground">Our team will review your resume shortly.</span>
                    </div>
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <span className="text-muted-foreground">You will be contacted via email for next steps.</span>
                    </div>
                </div>
                <div className="pt-8">
                    <Button variant="outline" className="min-w-[140px]" onClick={() => navigate(`/careers/${orgId}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header / Hero Section */}
            <div className="bg-white border-b relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
                    <svg width="400" height="400" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#4F46E5" d="M42.7,-62.9C50.9,-52.8,50.1,-34.4,51.7,-19.2C53.4,-4,57.4,8,54.6,19.1C51.8,30.3,42.1,40.6,31.3,46.9C20.5,53.2,8.6,55.6,-1.8,58.1C-12.2,60.6,-21.1,63.2,-31.2,59.3C-41.3,55.4,-52.6,45.1,-61,32.7C-69.4,20.3,-74.9,5.8,-71.4,-7.2C-67.9,-20.2,-55.4,-31.7,-43.5,-40.8C-31.7,-49.9,-20.5,-56.6,-7.3,-56.6C5.9,-56.6,26.7,-59.1,42.7,-62.9Z" transform="translate(100 100)" />
                    </svg>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
                    <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-indigo-600 transition-colors" onClick={() => navigate(`/careers/${orgId}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Jobs
                    </Button>

                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 text-sm font-medium rounded-full transition-colors">
                                {job.type}
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1 border-gray-200 text-gray-600 text-sm font-medium rounded-full">
                                {job.department?.name}
                            </Badge>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-4xl">
                            {job.title}
                        </h1>

                        <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground pt-2">
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                                <Building2 className="h-4 w-4 text-indigo-500" />
                                <span className="text-gray-700">{job.department?.name} Department</span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                                <MapPin className="h-4 w-4 text-pink-500" />
                                <span className="text-gray-700">{job.location}</span>
                            </span>
                            <span className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-100">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span className="text-gray-700">Posted {format(new Date(job.createdAt), 'MMMM d, yyyy')}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Job Content (Left) */}
                    <div className="lg:col-span-2 space-y-10">
                        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                About the Role
                            </h3>
                            <div className="prose prose-slate max-w-none text-gray-600 prose-p:text-gray-600 prose-li:text-gray-600 prose-headings:text-gray-900 leading-relaxed whitespace-pre-line">
                                {job.description || "No description provided."}
                            </div>
                        </section>

                        {job.requirements && (
                            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                                    Requirements
                                </h3>
                                <div className="prose prose-slate max-w-none text-gray-600 prose-p:text-gray-600 prose-li:text-gray-600 prose-headings:text-gray-900 leading-relaxed whitespace-pre-line">
                                    {job.requirements}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Application Sidebar (Right) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <Card className="border-0 shadow-2xl shadow-indigo-500/10 ring-1 ring-gray-100 overflow-hidden bg-white/80 backdrop-blur-sm">
                                <div className="bg-slate-900 p-6 text-white relative overflow-hidden">
                                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>
                                    <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

                                    <h3 className="text-xl font-bold relative z-10">Apply Now</h3>
                                    <p className="text-slate-300 text-sm mt-1 relative z-10">
                                        Join our team and help us build the future.
                                    </p>
                                </div>

                                <CardContent className="p-6 md:p-8">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="firstName"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</FormLabel>
                                                            <FormControl>
                                                                <Input className="h-10 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 transition-all rounded-lg" placeholder="John" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="lastName"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-1.5">
                                                            <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</FormLabel>
                                                            <FormControl>
                                                                <Input className="h-10 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 transition-all rounded-lg" placeholder="Doe" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" className="h-10 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 transition-all rounded-lg" placeholder="john@company.com" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="phone"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input className="h-10 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 transition-all rounded-lg" placeholder="+1 234 567 890" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="resumeUrl"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Resume / Portfolio URL</FormLabel>
                                                        <FormControl>
                                                            <Input className="h-10 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 transition-all rounded-lg" placeholder="https://linkedin.com/in/..." {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="coverLetter"
                                                render={({ field }) => (
                                                    <FormItem className="space-y-1.5">
                                                        <FormLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cover Letter</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Tell us why you're a great fit..."
                                                                className="min-h-[120px] resize-none bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-indigo-500 transition-all rounded-lg"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="pt-4">
                                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5" disabled={submitting}>
                                                    {submitting ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                            Sending...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-2">
                                                            Submit Application <Send className="w-4 h-4" />
                                                        </span>
                                                    )}
                                                </Button>
                                                <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed px-4">
                                                    By clicking Submit, you agree to our Terms of Service and Privacy Policy.
                                                </p>
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
