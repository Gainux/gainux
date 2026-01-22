
import { useState, useEffect } from "react";
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { performanceService } from "../../services/performanceService";
import { employeeService } from "../../services/employeeService";
import type { PerformanceGoal, Employee } from "../../types";
import { toast } from "sonner";
import { format } from "date-fns";

export default function GoalListPage() {
    const { user, profile } = useAuth();
    const [goals, setGoals] = useState<PerformanceGoal[]>([]);
    const [employee, setEmployee] = useState<Employee | null>(null);

    // Dialog State
    const [isOpen, setIsOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        status: "not_started",
        progress: 0
    });

    useEffect(() => {
        loadData();
    }, [user, profile]);

    const loadData = async () => {
        if (!user?.id || !profile?.org_id) return;
        try {
            const emp = await employeeService.getEmployeeByUserId(user.id);
            setEmployee(emp);
            if (emp) {
                const data = await performanceService.getGoals(profile.org_id, emp.id);
                setGoals(data);
            }
        } catch (error) {
            console.error("Failed to load goals", error);
            toast.error("Failed to load goals");
        } finally {
            // setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingGoal(null);
        setFormData({
            title: "",
            description: "",
            priority: "medium",
            dueDate: "",
            status: "not_started",
            progress: 0
        });
        setIsOpen(true);
    };

    const handleOpenEdit = (goal: PerformanceGoal) => {
        setEditingGoal(goal);
        setFormData({
            title: goal.title,
            description: goal.description || "",
            priority: goal.priority,
            dueDate: goal.dueDate || "",
            status: goal.status,
            progress: goal.progress
        });
        setIsOpen(true);
    };

    const handleSubmit = async () => {
        if (!employee || !profile?.org_id) return;



        try {
            const dbPayload = {
                org_id: profile.org_id,
                employee_id: employee.id,
                title: formData.title,
                description: formData.description,
                priority: formData.priority as any,
                due_date: formData.dueDate || null,
                status: formData.status as any,
                progress: parseInt(String(formData.progress))
            };

            if (editingGoal) {
                await performanceService.updateGoal(editingGoal.id, dbPayload);
                toast.success("Goal updated successfully");
            } else {
                await performanceService.createGoal(dbPayload);
                toast.success("Goal created successfully");
            }

            setIsOpen(false);
            loadData();
        } catch (error) {
            console.error("Failed to save goal", error);
            toast.error("Failed to save goal");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this goal?")) return;
        try {
            await performanceService.deleteGoal(id);
            toast.success("Goal deleted");
            loadData();
        } catch (error) {
            toast.error("Failed to delete goal");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Goals</h2>
                    <p className="text-muted-foreground">Set and track your performance objectives.</p>
                </div>
                <Button onClick={handleOpenCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Goal
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => (
                    <Card key={goal.id} className="relative hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                    <Badge variant="outline" className={getPriorityColor(goal.priority)}>
                                        {goal.priority.toUpperCase()}
                                    </Badge>
                                    <CardTitle className="text-lg font-semibold leading-none pt-2">
                                        {goal.title}
                                    </CardTitle>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => handleOpenEdit(goal)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(goal.id)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                {goal.description || "No description provided."}
                            </p>

                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Progress</span>
                                    <span>{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Badge variant="secondary" className={getStatusColor(goal.status)}>
                                    {goal.status.replace('_', ' ').toUpperCase()}
                                </Badge>
                                {goal.dueDate && (
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Calendar className="mr-1 h-3.5 w-3.5" />
                                        {format(new Date(goal.dueDate), "MMM d, yyyy")}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                        <DialogDescription>
                            Define clear and measurable objectives.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Increase sales by 20%"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Details about this goal..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(val) => setFormData({ ...formData, priority: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="dueDate">Due Date</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="not_started">Not Started</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="progress">Progress (%)</Label>
                                <Input
                                    id="progress"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.progress}
                                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit}>{editingGoal ? 'Save Changes' : 'Create Goal'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
