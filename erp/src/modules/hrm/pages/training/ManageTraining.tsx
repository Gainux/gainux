import { useState, useEffect } from "react";

import {
    Plus,
    Search,
    FileText,
    Video,
    MoreHorizontal,
    Pencil,
    Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { trainingService } from "../../services/trainingService";
import { employeeService } from "../../services/employeeService";
import type { Training, Department, Designation } from "../../types";

export default function ManageTraining() {
    const { profile } = useAuth();
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Training>>({
        title: "",
        description: "",
        contentType: "document",
        contentUrl: "",
        targetDepartmentId: "all", // "all" represents null in DB
        targetDesignationId: "all"
    });

    useEffect(() => {
        loadData();
    }, [profile?.org_id]);

    const loadData = async () => {
        if (!profile?.org_id) return;
        try {
            const [trainingData, deptData, desigData] = await Promise.all([
                trainingService.getTrainings(profile.org_id),
                employeeService.getDepartments(profile.org_id),
                employeeService.getDesignations(profile.org_id)
            ]);
            setTrainings(trainingData);
            setDepartments(deptData);
            setDesignations(desigData);
        } catch (error) {
            console.error("Failed to load training data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async () => {
        if (!profile?.org_id) return;
        setSubmitting(true);
        try {
            const payload = {
                orgId: profile.org_id,
                title: formData.title || "",
                description: formData.description,
                contentType: formData.contentType as any,
                contentUrl: formData.contentUrl,
                targetDepartmentId: formData.targetDepartmentId === "all" ? undefined : formData.targetDepartmentId,
                targetDesignationId: formData.targetDesignationId === "all" ? undefined : formData.targetDesignationId,
                createdBy: profile.id
            };

            if (editingId) {
                await trainingService.updateTraining(editingId, payload);
            } else {
                await trainingService.createTraining(payload);
            }

            setIsCreateOpen(false);
            setEditingId(null);
            resetForm();
            loadData(); // Refresh list
        } catch (error) {
            console.error("Failed to save training", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        try {
            await trainingService.deleteTraining(id);
            setTrainings(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete training", error);
        }
    };

    const handleEdit = (training: Training) => {
        setEditingId(training.id);
        setFormData({
            title: training.title,
            description: training.description || "",
            contentType: training.contentType,
            contentUrl: training.contentUrl || "",
            targetDepartmentId: training.targetDepartmentId || "all",
            targetDesignationId: training.targetDesignationId || "all"
        });
        setIsCreateOpen(true);
    };

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            contentType: "document",
            contentUrl: "",
            targetDepartmentId: "all",
            targetDesignationId: "all"
        });
        setEditingId(null);
    };

    const filteredTrainings = trainings.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Training Library</h3>
                    <p className="text-sm text-muted-foreground">Manage learning resources and assignments.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={(open) => {
                    setIsCreateOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingId ? "Edit Resource" : "Add Training Resource"}</DialogTitle>
                            <DialogDescription>
                                {editingId ? "Update existing learning material." : "Create a new learning material for your employees."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Security Awareness"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief overview of the content..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={formData.contentType}
                                        onValueChange={(val: any) => setFormData({ ...formData, contentType: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="document">Document</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="article">Article</SelectItem>
                                            <SelectItem value="quiz">Quiz</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="url">Content URL</Label>
                                    <Input
                                        id="url"
                                        value={formData.contentUrl}
                                        onChange={(e) => setFormData({ ...formData, contentUrl: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Target Audience</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        value={formData.targetDepartmentId || "all"}
                                        onValueChange={(val) => setFormData({ ...formData, targetDepartmentId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={formData.targetDesignationId || "all"}
                                        onValueChange={(val) => setFormData({ ...formData, targetDesignationId: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Designations</SelectItem>
                                            {designations.map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateOrUpdate} disabled={submitting}>
                                {submitting ? "Saving..." : (editingId ? "Update Resource" : "Create Resource")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search trainings..."
                    className="max-w-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="p-4 font-medium">Title</th>
                            <th className="p-4 font-medium">Type</th>
                            <th className="p-4 font-medium">Target</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTrainings.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                    No trainings found.
                                </td>
                            </tr>
                        ) : (
                            filteredTrainings.map((t) => (
                                <tr key={t.id} className="border-t hover:bg-muted/50">
                                    <td className="p-4">
                                        <div className="font-medium">{t.title}</div>
                                        <div className="text-xs text-muted-foreground truncate max-w-[300px]">{t.description}</div>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant="outline" className="capitalize">
                                            {t.contentType === 'video' ? <Video className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                                            {t.contentType}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs bg-secondary px-2 py-0.5 rounded w-fit">
                                                {t.targetDepartment?.name || "All Depts"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {t.targetDesignation?.title || "All Roles"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(t)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(t.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
