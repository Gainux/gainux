import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { recruitmentService } from "../services/recruitmentService";
import { employeeService } from "@/modules/hrm/services/employeeService";
import type { RecruitJob } from "../types";

const formSchema = z.object({
    title: z.string().min(2, "Title is required"),
    departmentId: z.string().min(1, "Department is required"),
    designationId: z.string().min(1, "Designation is required"),
    type: z.enum(["full-time", "part-time", "contract", "intern"]),
    location: z.string().min(2, "Location is required"),
    description: z.string().optional(),
    requirements: z.string().optional(),
    status: z.enum(["draft", "published", "closed"]).default("draft"),
});

interface CreateJobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    job?: RecruitJob | null;
}

export function CreateJobDialog({ open, onOpenChange, onSuccess, job }: CreateJobDialogProps) {
    const { profile } = useAuth();
    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);


    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            type: "full-time",
            location: "On-site",
            status: "draft",
            description: "",
            requirements: "",
        },
    });

    useEffect(() => {
        if (open && profile?.org_id) {
            loadMetaData();
            if (job) {
                form.reset({
                    title: job.title,
                    departmentId: job.departmentId,
                    designationId: job.designationId,
                    type: job.type as any,
                    location: job.location,
                    description: job.description || "",
                    requirements: job.requirements || "",
                    status: job.status as any,
                });
            } else {
                form.reset({
                    title: "",
                    type: "full-time",
                    location: "On-site",
                    status: "draft",
                    description: "",
                    requirements: "",
                });
            }
        }
    }, [open, profile?.org_id, job]);

    const loadMetaData = async () => {
        if (!profile?.org_id) return;
        const [deps, desigs] = await Promise.all([
            employeeService.getDepartments(profile.org_id),
            employeeService.getDesignations(profile.org_id)
        ]);
        setDepartments(deps);
        setDesignations(desigs);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!profile?.org_id) return;
        try {
            if (job) {
                // Update existing job
                await recruitmentService.updateJob(job.id, {
                    ...values,
                });
                toast.success("Job updated successfully");
            } else {
                // Create new job
                await recruitmentService.createJob({
                    ...values,
                    orgId: profile.org_id,
                });
                toast.success("Job posted successfully");
            }

            onSuccess();
            onOpenChange(false);
            if (!job) form.reset();
        } catch (error) {
            console.error(error);
            toast.error(job ? "Failed to update job" : "Failed to post job");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{job ? "Edit Job" : "Post New Job"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control as any}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Senior Developer" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {departments.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="designationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Designation</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Designation" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {designations.map((d) => (
                                                    <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employment Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="full-time">Full Time</SelectItem>
                                                <SelectItem value="part-time">Part Time</SelectItem>
                                                <SelectItem value="contract">Contract</SelectItem>
                                                <SelectItem value="intern">Internship</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control as any}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Job description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control as any}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Post Job</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
