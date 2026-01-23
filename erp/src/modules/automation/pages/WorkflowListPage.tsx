import { useState, useEffect } from "react";
import { Plus, Play, Pause, MoreVertical, Edit, Trash, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { workflowService } from "../services/workflowService";
import type { Workflow } from "../types";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function WorkflowListPage() {
    const navigate = useNavigate();
    const [workflows, setWorkflows] = useState<Workflow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWorkflows();
    }, []);

    const loadWorkflows = async () => {
        try {
            setLoading(true);
            const data = await workflowService.getWorkflows();
            setWorkflows(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load workflows");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await workflowService.updateWorkflow(id, { isActive: !currentStatus });
            setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isActive: !currentStatus } : w));
            toast.success(`Workflow ${!currentStatus ? 'activated' : 'paused'}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this workflow?")) return;
        try {
            await workflowService.deleteWorkflow(id);
            setWorkflows(prev => prev.filter(w => w.id !== id));
            toast.success("Workflow deleted");
        } catch (error) {
            toast.error("Failed to delete workflow");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Workflow Automation</h2>
                    <p className="text-muted-foreground">Automate repetitive tasks with custom rules and triggers.</p>
                </div>
                <Button onClick={() => navigate("/automation/workflows/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Create Workflow
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                {loading ? (
                    <div>Loading workflows...</div>
                ) : workflows.length === 0 ? (
                    <div className="text-center py-10 border rounded-md border-dashed">
                        <Zap className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-lg font-medium">No workflows found</p>
                        <p className="text-sm text-muted-foreground mb-4">Create your first automation to save time.</p>
                        <Button onClick={() => navigate("/automation/workflows/new")}>Create Workflow</Button>
                    </div>
                ) : (
                    workflows.map((workflow) => (
                        <Card key={workflow.id} className="flex flex-row items-center justify-between p-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${workflow.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    <Zap className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        {workflow.name}
                                        {!workflow.isActive && <Badge variant="secondary">Paused</Badge>}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                        <Badge variant="outline">{workflow.trigger.replace('_', ' ').toUpperCase()}</Badge>
                                        <span>• {workflow.actions.length} Actions</span>
                                        <span>• Ran {workflow.runCount} times</span>
                                    </div>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => navigate(`/automation/workflows/${workflow.id}`)}>
                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(workflow.id, workflow.isActive)}>
                                        {workflow.isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                        {workflow.isActive ? 'Pause' : 'Activate'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(workflow.id)}>
                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
