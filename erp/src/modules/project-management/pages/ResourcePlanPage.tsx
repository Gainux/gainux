import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { projectService } from "../services/projectService";
import { Loader2, Plus, Users, AlertTriangle } from "lucide-react";
import type { ResourceAllocation, Project } from "../types";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/context/AuthContext";

export default function ResourcePlanPage() {
    const { isAdmin } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);

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
            const allocData = await projectService.getResourceAllocations(projectId);
            setAllocations(allocData);
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



    // Calculate total allocation across ALL projects for overallocation warning
    const [employeeAllAllocations, setEmployeeAllAllocations] = useState<Record<string, number>>({});

    useEffect(() => {
        const calculateTotalAllocations = async () => {
            if (allocations.length === 0) return;

            const totals: Record<string, number> = {};

            // For each unique employee, fetch their allocations across all projects
            const uniqueEmployeeIds = Array.from(new Set(allocations.map(a => a.employeeId)));

            for (const empId of uniqueEmployeeIds) {
                const { data } = await supabase
                    .from('resource_allocations')
                    .select('allocation_percentage')
                    .eq('employee_id', empId);

                if (data) {
                    totals[empId] = data.reduce((sum, item) => sum + (item.allocation_percentage || 0), 0);
                }
            }

            setEmployeeAllAllocations(totals);
        };

        calculateTotalAllocations();
    }, [allocations]);

    // Admin-only access restriction
    if (!isAdmin) {
        return (
            <div className="flex-1 h-[calc(100vh-4rem)] p-4 md:p-8 md:pt-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Admin Access Required</h3>
                            <p className="text-muted-foreground">
                                Resource planning and allocation management is restricted to administrators.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex-1 h-[calc(100vh-4rem)] p-4 md:p-8 pt-6 flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Resource Plan</h2>
                    <p className="text-muted-foreground">Manage team allocations across projects.</p>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                    <div className="w-full md:w-[300px]">
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
                        <div className="overflow-x-auto">
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
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">{allocation.allocationPercentage}%</span>
                                                            {employeeAllAllocations[allocation.employeeId] > 100 && (
                                                                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Overallocated
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {employeeAllAllocations[allocation.employeeId] > 0 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Total: {employeeAllAllocations[allocation.employeeId]}% across all projects
                                                            </span>
                                                        )}
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
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
