
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { recruitmentService } from "../../services/recruitmentService";
import { employeeService } from "../../services/employeeService";
import type { JobPosting, Department } from "../../types";
import { toast } from "sonner";

interface JobFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job: JobPosting | null;
    onSave: () => void;
}

export default function JobForm({ open, onOpenChange, job, onSave }: JobFormProps) {
    const { profile } = useAuth();
    const [departments, setDepartments] = useState<Department[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        departmentId: "",
        type: "full_time",
        status: "draft",
        location: "Remote",
        description: "",
        requirements: ""
    });

    useEffect(() => {
        if (open && profile?.org_id) {
            loadDepartments();
            if (job) {
                setFormData({
                    title: job.title,
                    departmentId: job.departmentId || "",
                    type: job.type,
                    status: job.status,
                    location: job.location || "Remote",
                    description: job.description || "",
                    requirements: job.requirements?.join("\n") || ""
                });
            } else {
                setFormData({
                    title: "",
                    departmentId: "",
                    type: "full_time",
                    status: "draft",
                    location: "Remote",
                    description: "",
                    requirements: ""
                });
            }
        }
    }, [open, job, profile]);

    const loadDepartments = async () => {
        if (!profile?.org_id) return;
        try {
            const data = await employeeService.getDepartments(profile.org_id);
            setDepartments(data);
        } catch (error) {
            console.error("Failed to load departments", error);
        }
    };

    const handleSubmit = async () => {
        if (!profile?.org_id) return;

        try {
            const payload = {
                orgId: profile.org_id,
                title: formData.title,
                departmentId: formData.departmentId || null,
                type: formData.type as any,
                status: formData.status as any,
                location: formData.location,
                description: formData.description,
                requirements: formData.requirements.split('\n').filter(r => r.trim() !== '')
            };

            if (job) {
                await recruitmentService.updateJobPosting(job.id, payload);
                toast.success("Job posting updated");
            } else {
                await recruitmentService.createJobPosting(payload);
                toast.success("Job posting created");
            }
            onSave();
        } catch (error) {
            console.error("Failed to save job", error);
            toast.error("Failed to save job posting");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{job ? 'Edit Job Posting' : 'Create New Job Posting'}</DialogTitle>
                    <DialogDescription>
                        Details about the open position.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Job Title</Label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Senior Frontend Engineer"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Department</Label>
                            <Select
                                value={formData.departmentId}
                                onValueChange={(val) => setFormData({ ...formData, departmentId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map(dept => (
                                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Employment Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full_time">Full Time</SelectItem>
                                    <SelectItem value="part_time">Part Time</SelectItem>
                                    <SelectItem value="contract">Contract</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Remote, New York, London"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                            className="min-h-[150px]"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Job role, responsibilities, etc."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Requirements (One per line)</Label>
                        <Textarea
                            className="min-h-[100px]"
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            placeholder="- 5+ years of experience..."
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit}>{job ? 'Save Changes' : 'Create Job'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
