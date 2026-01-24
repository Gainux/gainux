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

import type { Task } from "../types";

interface TaskFormProps {
    onSubmit: (data: Partial<Task>) => void;
    onCancel: () => void;
    initialData?: Task | null;
    projectId: string;
    projectMembers?: any[]; // Array of employees
    sprints?: any[]; // Array of sprints
}

export function TaskForm({ onSubmit, onCancel, initialData, projectId, projectMembers = [], sprints = [] }: TaskFormProps) {
    const [formData, setFormData] = useState<Partial<Task>>({
        title: "",
        description: "",
        assigneeId: "",
        sprintId: "",
        status: "todo",
        priority: "medium",
        dueDate: "",
        projectId: projectId,
        ...initialData
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                description: initialData.description || "",
                assigneeId: initialData.assigneeId || "",
                sprintId: initialData.sprintId || "",
                dueDate: initialData.dueDate || ""
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            assigneeId: formData.assigneeId === "none" ? null : formData.assigneeId,
            sprintId: formData.sprintId === "none" ? null : formData.sprintId
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
                            {projectMembers.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="sprint">Sprint</Label>
                    <Select
                        value={formData.sprintId || "none"}
                        onValueChange={(value) => setFormData({ ...formData, sprintId: value === "none" ? null : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Backlog" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Backlog (No Sprint)</SelectItem>
                            {sprints.map((sprint) => (
                                <SelectItem key={sprint.id} value={sprint.id}>
                                    {sprint.name} ({sprint.status})
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
