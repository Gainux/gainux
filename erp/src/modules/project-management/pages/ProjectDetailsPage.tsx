import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, ArrowLeft, Loader2, ListTodo, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { projectService } from "../services/projectService";
import type { Project, Task, TaskStatus } from "../types";
import TaskBoard from "../components/TaskBoard";
import { TaskForm } from "../components/TaskForm";
import { ProjectForm } from "../components/ProjectForm";
import { ProjectDashboard } from "../components/ProjectDashboard";
import { SprintForm } from "../components/SprintForm";
import { useAsyncQuery } from "@/hooks/useAsyncQuery";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";

export default function ProjectDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile, user } = useAuth();

    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [projectEditOpen, setProjectEditOpen] = useState(false);

    // Use the new async query hook with timeout protection
    const {
        data: projectData,
        loading,
        error,
        refetch
    } = useAsyncQuery(
        async () => {
            if (!id) throw new Error('No project ID provided');

            // Determine if we need to filter by employee ID
            let employeeId: string | undefined;
            if (profile?.role === 'employee' && user?.id) {
                const { data: employee } = await supabase
                    .from('employees')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();
                employeeId = employee?.id;
            }

            const [projData, taskData, allocData, sprintsData] = await Promise.all([
                projectService.getProjectById(id),
                projectService.getProjectTasks(id),
                projectService.getResourceAllocations(id),
                projectService.getSprints(id)
            ]);

            // Filter tasks if employee
            const filteredTasks = employeeId
                ? taskData.filter(t => t.assigneeId === employeeId)
                : taskData;

            return {
                project: projData,
                tasks: filteredTasks,
                allocations: allocData,
                sprints: sprintsData || []
            };
        },
        [id, profile, user],
        {
            timeout: 30000,
            redirectOnAuthError: true
        }
    );

    const project = projectData?.project || null;
    const tasks = projectData?.tasks || [];
    const allocations = projectData?.allocations || [];
    const sprints = projectData?.sprints || [];

    // Filter tasks for Active Board (Present in an active sprint OR no sprint if we simplicity)
    // Actually, "Board" usually shows Current Sprint.
    // If no active sprint, show what? Backlog tasks? Or a specialized "Backlog" view?
    // Let's say Board = Active Sprint Tasks. Backlog = No Sprint Tasks.
    // Find active sprint
    const activeSprint = sprints.find((s: any) => s.status === 'active');

    // Tasks for board: tasks in active sprint
    // If no active sprint, maybe show 'todo' tasks? 
    // Usually strict Scrum: Board is empty if no active sprint.
    // Let's be lenient: If no active sprint, show tasks with NO sprint (Kanban mode).
    // If active sprint exists, show ONLY that sprint's tasks.
    // If we split Backlog/Board, Board should probably show "no sprint" tasks if they are 'in_progress'?
    // Let's refine:
    // Backlog Tab: Tasks with NO sprint (and status = todo?).
    // Board Tab: Active Sprint Tasks OR All tasks if no sprint feature used?
    // Let's default to:
    // Board = activeSprint ? tasksInSprint : tasksInNoSprint (but not backlog/todo?)
    // Let's just pass ALL for now and let Board component handle filtering or just show what we filter here.

    // Let's go with:
    // Board shows Active Sprint tasks. If no active sprint, show nothing or suggestion to start sprint.
    // BUT we need a "Kanban" mode for non-Scrum projects.
    // Let's assume if sprints exist, use Scrum. If no sprints at all, use Kanban (all tasks).
    const isScrum = sprints.length > 0;
    const currentBoardTasks = isScrum
        ? (activeSprint ? tasks.filter(t => t.sprintId === activeSprint.id) : [])
        : tasks;

    // Backlog tasks: Tasks not in any sprint (or in future sprints?)
    // Usually Backlog = No Sprint assigned.
    const backlogTasks = tasks.filter(t => !t.sprintId);

    const handleCreateTask = async (data: Partial<Task>) => {
        if (!project) return;
        try {
            await projectService.createTask({ ...data, projectId: project.id });
            await refetch(); // Refetch to update UI
            setTaskDialogOpen(false);
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    const handleUpdateTask = async (data: Partial<Task>) => {
        if (!editingTask) return;
        try {
            await projectService.updateTask(editingTask.id, data);
            await refetch(); // Refetch to update UI
            setTaskDialogOpen(false);
            setEditingTask(null);
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
        try {
            await projectService.updateTask(taskId, { status: newStatus });
            await refetch(); // Refetch to ensure consistency
        } catch (error) {
            console.error("Failed to move task", error);
            await refetch(); // Revert on error
        }
    };

    const openEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskDialogOpen(true);
    };

    const handleUpdateProject = async (data: Partial<Project>) => {
        if (!project) return;
        try {
            await projectService.updateProject(project.id, data);
            await refetch(); // Refetch to update UI
            setProjectEditOpen(false);
        } catch (error) {
            console.error("Failed to update project", error);
        }
    };

    const handleCreateSprint = async (data: any) => {
        if (!project) return;
        try {
            await projectService.createSprint({ ...data, projectId: project.id });
            await refetch();
            setSprintDialogOpen(false);
        } catch (error) {
            console.error("Failed to create sprint", error);
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

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-md">
                    <div className="p-6 text-center space-y-4">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                        <div>
                            <h3 className="text-lg font-semibold">Error Loading Project</h3>
                            <p className="text-muted-foreground mt-2">{error.message}</p>
                        </div>
                        <div className="flex gap-2 justify-center">
                            <Button onClick={() => refetch()} variant="default">
                                Try Again
                            </Button>
                            <Button onClick={() => navigate("/projects")} variant="outline">
                                Back to Projects
                            </Button>
                        </div>
                    </div>
                </Card>
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
            <div className="border-b bg-background p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
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
                                    sprints={sprints}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col">
                <Tabs defaultValue="board" className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="board">
                                Board
                                {activeSprint && <Badge className="ml-2 h-5 px-1.5" variant="secondary">{activeSprint.name}</Badge>}
                            </TabsTrigger>
                            <TabsTrigger value="backlog">Backlog</TabsTrigger>
                            <TabsTrigger value="sprints">Sprints</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="overview" className="flex-1 overflow-auto">
                        <div className="space-y-6">
                            <ProjectDashboard projectId={project.id} />
                        </div>
                    </TabsContent>

                    <TabsContent value="board" className="flex-1 overflow-hidden h-full">
                        {isScrum && !activeSprint ? (
                            <div className="h-full flex items-center justify-center text-muted-foreground flex-col gap-4">
                                <p>No active sprint.</p>
                                <Button variant="outline" onClick={() => navigate("?tab=sprints")}>Go to Sprints</Button>
                            </div>
                        ) : (
                            <TaskBoard
                                tasks={currentBoardTasks}
                                onTaskMove={handleTaskMove}
                                onTaskEdit={openEditTask}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="backlog" className="flex-1 overflow-auto">
                        <div className="p-4 border rounded-lg bg-background">
                            <h3 className="font-semibold mb-4">Backlog ({backlogTasks.length})</h3>
                            <div className="space-y-2">
                                {backlogTasks.map(task => (
                                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">{task.priority}</Badge>
                                            <span className="font-medium">{task.title}</span>
                                            <span className="text-sm text-muted-foreground">{task.assignee?.firstName}</span>
                                        </div>
                                        <Button size="sm" variant="ghost" onClick={() => openEditTask(task)}>Edit</Button>
                                    </div>
                                ))}
                                {backlogTasks.length === 0 && <div className="text-center py-8 text-muted-foreground">No tasks in backlog</div>}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="sprints" className="flex-1 overflow-auto">
                        <div className="grid gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Sprints</h3>
                                <Button size="sm" onClick={() => setSprintDialogOpen(true)}>Create Sprint</Button>
                            </div>
                            {sprints.map((sprint: any) => (
                                <Card key={sprint.id}>
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{sprint.name}</h4>
                                            <div className="text-sm text-muted-foreground">
                                                {sprint.startDate} - {sprint.endDate} • {sprint.status}
                                            </div>
                                        </div>
                                        <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'}>{sprint.status}</Badge>
                                    </div>
                                </Card>
                            ))}
                            {sprints.length === 0 && (
                                <div className="text-center py-12 border rounded-lg border-dashed">
                                    <h3 className="font-medium">No Sprints</h3>
                                    <p className="text-muted-foreground mb-4">Create a sprint to organize tasks.</p>
                                    <Button onClick={() => setSprintDialogOpen(true)}>Create Sprint</Button>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
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

            <Dialog open={sprintDialogOpen} onOpenChange={setSprintDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Sprint</DialogTitle>
                    </DialogHeader>
                    <SprintForm
                        projectId={project.id}
                        onSubmit={handleCreateSprint}
                        onCancel={() => setSprintDialogOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
