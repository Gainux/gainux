import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ArrowLeft, Loader2, ListTodo, CheckCircle2, Clock } from "lucide-react";
import { projectService } from "../services/projectService";
import type { Project, Task, TaskStatus, ResourceAllocation } from "../types";
import TaskBoard from "../components/TaskBoard";
import { TaskForm } from "../components/TaskForm";
import { ProjectForm } from "../components/ProjectForm";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile, user } = useAuth(); // Get auth context

    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
    const [loading, setLoading] = useState(true);

    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const [projectEditOpen, setProjectEditOpen] = useState(false);

    const fetchProjectData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            // First, determine if we need to filter by employee ID
            let employeeId: string | undefined;
            if (profile?.role === 'employee' && user?.id) {
                const { data: employee } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                if (employee) {
                    employeeId = employee.id;
                }
            }

            const [projData, taskData, allocData] = await Promise.all([
                projectService.getProjectById(id),
                projectService.getProjectTasks(id),
                projectService.getResourceAllocations(id)
            ]);

            setProject(projData);

            // Filter tasks if employeeId is found
            if (employeeId) {
                const filteredTasks = taskData.filter(t => t.assigneeId === employeeId);
                setTasks(filteredTasks);
            } else {
                setTasks(taskData);
            }

            setAllocations(allocData);
        } catch (error) {
            console.error("Failed to fetch project details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const handleCreateTask = async (data: Partial<Task>) => {
        if (!project) return;
        try {
            const newTask = await projectService.createTask({ ...data, projectId: project.id });
            setTasks([newTask, ...tasks]);
            setTaskDialogOpen(false);
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    const handleUpdateTask = async (data: Partial<Task>) => {
        if (!editingTask) return;
        try {
            const updated = await projectService.updateTask(editingTask.id, data);
            setTasks(tasks.map(t => t.id === updated.id ? updated : t));
            setTaskDialogOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
        // Optimistic update handled in board, but we also save here
        try {
            await projectService.updateTask(taskId, { status: newStatus });
            // Update local state to ensure consistency if needed (though board might have done it)
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error("Failed to move task", error);
            fetchProjectData(); // Revert
        }
    };

    const openEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskDialogOpen(true);
    };

    const handleUpdateProject = async (data: Partial<Project>) => {
        if (!project) return;
        try {
            const updated = await projectService.updateProject(project.id, data);
            setProject(updated);
            setProjectEditOpen(false);
        } catch (error) {
            console.error("Failed to update project", error);
        }
    };

    // Derived unique members from allocations
    const projectMembers = Array.from(new Map(allocations.map(a => [a.employeeId, a.employee])).values()).filter(Boolean);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">Project not found</h2>
                <Button onClick={() => navigate("/projects")} className="mt-4">Back to Projects</Button>
            </div>
        );
    }

    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    return (
        <div className="flex-1 h-[calc(100vh-4rem)] bg-muted/10 flex flex-col">
            {/* Header */}
            <div className="border-b bg-background p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Badge variant="outline">{project.status}</Badge>
                                {project.client && <span>• Client: {project.client.name}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Project Members Avatars */}
                        <div className="flex -space-x-2 mr-4">
                            <TooltipProvider>
                                {projectMembers.map((member: any) => (
                                    <Tooltip key={member.id}>
                                        <TooltipTrigger asChild>
                                            <Avatar className="h-8 w-8 border-2 border-background">
                                                <AvatarImage src={member.avatarUrl} />
                                                <AvatarFallback>{member.firstName?.[0]}{member.lastName?.[0]}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{member.firstName} {member.lastName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </div>

                        <Button variant="outline" onClick={() => setProjectEditOpen(true)}>
                            Edit Project
                        </Button>
                        <Dialog open={taskDialogOpen} onOpenChange={(open) => {
                            setTaskDialogOpen(open);
                            if (!open) setEditingTask(null);
                        }}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" /> Add Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
                                    <DialogDescription>
                                        Create a task for your team.
                                    </DialogDescription>
                                </DialogHeader>
                                <TaskForm
                                    projectId={project.id}
                                    initialData={editingTask}
                                    onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                                    onCancel={() => {
                                        setTaskDialogOpen(false);
                                        setEditingTask(null);
                                    }}
                                    projectMembers={projectMembers}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <Card className="p-4 flex flex-row items-center justify-between pb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                            <div className="text-2xl font-bold">{tasks.length}</div>
                        </div>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </Card>
                    <Card className="p-4 flex flex-row items-center justify-between pb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </Card>
                    <Card className="p-4 flex flex-row items-center justify-between pb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Progress</p>
                            <div className="text-2xl font-bold">{progress}%</div>
                        </div>
                        <div className="h-4 w-4 rounded-full border-2 border-primary/20 border-t-primary" />
                    </Card>
                    <Card className="p-4 flex flex-row items-center justify-between pb-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Due Tasks</p>
                            <div className="text-2xl font-bold text-orange-600">
                                {tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}
                            </div>
                        </div>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </Card>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-hidden">
                <TaskBoard
                    tasks={tasks}
                    onTaskMove={handleTaskMove}
                    onTaskEdit={openEditTask}
                />
            </div>

            <Dialog open={projectEditOpen} onOpenChange={setProjectEditOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <ProjectForm
                        initialData={project}
                        onSubmit={handleUpdateProject}
                        onCancel={() => setProjectEditOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
