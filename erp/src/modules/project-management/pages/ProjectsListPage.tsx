import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Calendar, DollarSign, Users } from "lucide-react";
import { projectService } from "../services/projectService";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { Project } from "../types";
import { ProjectForm } from "../components/ProjectForm";
import { useCurrency } from "@/hooks/useCurrency";

export default function ProjectsListPage() {
    const { profile, user } = useAuth();
    const { formatAmount } = useCurrency();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [createOpen, setCreateOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            let employeeId: string | undefined;

            if (profile?.role === 'employee' && user?.id) {
                // We need the employee ID (from employees table), not the auth ID
                const { data: employee } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (employee) {
                    employeeId = employee.id;
                }
            }

            const data = await projectService.getProjects(employeeId);
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (profile) {
            fetchProjects();
        }
    }, [profile]);

    const handleCreate = async (data: Partial<Project>) => {
        try {
            const newProject = await projectService.createProject(data);
            setProjects([newProject, ...projects]);
            setCreateOpen(false);
        } catch (error) {
            console.error("Failed to create project", error);
        }
    };

    const handleUpdate = async (data: Partial<Project>) => {
        if (!editingProject) return;
        try {
            const updated = await projectService.updateProject(editingProject.id, data);
            setProjects(projects.map(p => p.id === updated.id ? updated : p));
            setEditOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error("Failed to update project", error);
        }
    };

    const openEdit = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation(); // Prevent navigation
        setEditingProject(project);
        setEditOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'default'; // primary
            case 'completed': return 'success'; // green-ish usually, or secondary
            case 'planning': return 'secondary';
            case 'on_hold': return 'warning'; // yellow-ish
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 h-[calc(100vh-4rem)] p-4 md:p-8 pt-6 flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">
                        Manage your projects, track progress, and assign tasks.
                    </p>
                </div>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                            <DialogDescription>
                                Add a new project to your workspace.
                            </DialogDescription>
                        </DialogHeader>
                        <ProjectForm
                            onSubmit={handleCreate}
                            onCancel={() => setCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {projects.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No projects found. Create one to get started.
                    </div>
                ) : (
                    projects.map((project) => (
                        <Card
                            key={project.id}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => navigate(`/projects/${project.id}`)}
                        >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-semibold">
                                    {project.name}
                                </CardTitle>
                                <Badge variant={getStatusColor(project.status) as any}>
                                    {project.status.replace('_', ' ')}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                                    {project.description || "No description provided."}
                                </p>
                                <div className="space-y-2 text-sm">
                                    {project.client && (
                                        <div className="flex items-center text-muted-foreground">
                                            <Users className="mr-2 h-4 w-4" />
                                            {project.client.name}
                                        </div>
                                    )}
                                    <div className="flex items-center text-muted-foreground">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        {project.startDate || "N/A"} - {project.endDate || "N/A"}
                                    </div>
                                    {profile?.role !== 'employee' && (
                                        <div className="flex items-center text-muted-foreground">
                                            <DollarSign className="mr-2 h-4 w-4" />
                                            {formatAmount(project.budget)}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => openEdit(e, project)}
                                >
                                    Edit
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <ProjectForm
                        initialData={editingProject}
                        onSubmit={handleUpdate}
                        onCancel={() => {
                            setEditingProject(null);
                            setEditOpen(false);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
