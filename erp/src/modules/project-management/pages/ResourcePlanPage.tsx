import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { projectService } from "../services/projectService";
import { Loader2, Plus, Users } from "lucide-react";
import type { ResourceAllocation, Project, Task } from "../types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AllocationForm } from "../components/AllocationForm";

export default function ResourcePlanPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [editingAllocation, setEditingAllocation] = useState<ResourceAllocation | undefined>(undefined);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (selectedProjectId) {
            loadData(selectedProjectId);
        } else {
            setAllocations([]);
            setTasks([]);
        }
    }, [selectedProjectId]);

    const loadProjects = async () => {
        try {
            const data = await projectService.getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    };

    const loadData = async (projectId: string) => {
        setLoading(true);
        try {
            const [allocData, taskData] = await Promise.all([
                projectService.getResourceAllocations(projectId),
                projectService.getProjectTasks(projectId)
            ]);
            setAllocations(allocData);
            setTasks(taskData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAllocate = async (data: Partial<ResourceAllocation>) => {
        try {
            if (editingAllocation) {
                await projectService.updateResourceAllocation(editingAllocation.id, data);
            } else {
                await projectService.createResourceAllocation(data);
            }
            setIsDialogOpen(false);
            setEditingAllocation(undefined);
            if (selectedProjectId) loadData(selectedProjectId);
        } catch (error) {
            console.error("Failed to allocate resource", error);
        }
    };

    const handleDeleteAllocation = async (id: string) => {
        if (!confirm("Are you sure you want to remove this allocation?")) return;
        try {
            await projectService.deleteResourceAllocation(id);
            if (selectedProjectId) loadData(selectedProjectId);
        } catch (error) {
            console.error("Failed to delete allocation", error);
        }
    };

    const openEditDialog = (allocation: ResourceAllocation) => {
        setEditingAllocation(allocation);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingAllocation(undefined);
        setIsDialogOpen(true);
    };

    const calculateAllocation = (employeeId: string) => {
        if (tasks.length === 0) return 0;
        const employeeTasks = tasks.filter(t => t.assigneeId === employeeId).length;
        return Math.round((employeeTasks / tasks.length) * 100);
    };

    return (
        <div className="flex-1 h-[calc(100vh-4rem)] p-8 pt-6 flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Resource Plan</h2>
                    <p className="text-muted-foreground">Manage team allocations across projects.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-[300px]">
                        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project..." />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedProjectId && (
                        <Dialog open={isDialogOpen} onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) setEditingAllocation(undefined);
                        }}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateDialog}>
                                    <Plus className="mr-2 h-4 w-4" /> Allocate Resource
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingAllocation ? 'Edit Allocation' : 'Allocate Resource'}</DialogTitle>
                                    <DialogDescription>
                                        {editingAllocation ? 'Update team member allocation details.' : 'Assign a team member to this project.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <AllocationForm
                                    projectId={selectedProjectId}
                                    initialData={editingAllocation}
                                    onSubmit={handleAllocate}
                                    onCancel={() => setIsDialogOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {selectedProjectId
                            ? `Allocations for ${projects.find(p => p.id === selectedProjectId)?.name}`
                            : "Resource Overview"
                        }
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!selectedProjectId ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground space-y-4">
                            <Users className="h-12 w-12 opacity-20" />
                            <p>Select a project from the dropdown above to view or manage resource allocations.</p>
                        </div>
                    ) : loading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : allocations.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground space-y-4 transition-all">
                            <p>No resources allocated to this project yet.</p>
                            <Button variant="outline" onClick={openCreateDialog}>
                                Allocate first team member
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead className="text-right">Allocation (Based on Tasks)</TableHead>
                                    <TableHead className="w-[100px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allocations.map((allocation) => {
                                    const dynamicPercentage = calculateAllocation(allocation.employeeId);
                                    return (
                                        <TableRow key={allocation.id}>
                                            <TableCell className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={allocation.employee?.avatarUrl} />
                                                    <AvatarFallback>
                                                        {allocation.employee?.firstName?.[0]}
                                                        {allocation.employee?.lastName?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {allocation.employee?.firstName} {allocation.employee?.lastName}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>Member</TableCell>
                                            <TableCell>{allocation.startDate}</TableCell>
                                            <TableCell>{allocation.endDate}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold">{dynamicPercentage}%</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {tasks.filter(t => t.assigneeId === allocation.employeeId).length} / {tasks.length} tasks
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(allocation)}>
                                                        Edit
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteAllocation(allocation.id)}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
