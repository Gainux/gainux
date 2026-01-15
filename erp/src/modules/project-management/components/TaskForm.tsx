import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { supabase } from "@/lib/supabase";
import type { Task } from "../types";

interface TaskFormProps {
    onSubmit: (data: Partial<Task>) => void;
    onCancel: () => void;
    initialData?: Task | null;
    projectId: string; // Required to scope assignee search if needed, usually we fetch all employees for now
}

export function TaskForm({ onSubmit, onCancel, initialData, projectId }: TaskFormProps) {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: "",
        description: "",
        assigneeId: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        projectId: projectId, // Ensure projectId is set
        ...initialData
    });

    const [employees, setEmployees] = useState<any[]>([]); // Using any for simplicity just for id/name

    useEffect(() => {
        const fetchEmployees = async () => {
            const { data } = await supabase.from('employees').select('id, first_name, last_name');
            if (data) setEmployees(data);
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                description: initialData.description || "",
                assigneeId: initialData.assigneeId || "",
                dueDate: initialData.dueDate || ""
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            assigneeId: formData.assigneeId === "none" ? null : formData.assigneeId
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select
                        value={formData.assigneeId || "none"}
                        onValueChange={(value) => setFormData({ ...formData, assigneeId: value === "none" ? null : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Unassigned</SelectItem>
                            {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                        value={formData.priority || "medium"}
                        onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                    id="due_date"
                    type="date"
                    value={formData.dueDate || ""}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? "Update Task" : "Create Task"}
                </Button>
            </div>
        </form>
    );
}
