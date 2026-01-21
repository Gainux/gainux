import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { projectService } from "../services/projectService";
import type { Project, Task, TimesheetEntry } from "../types";

interface TimesheetFormProps {
    onSubmit: (data: Partial<TimesheetEntry>) => void;
    onCancel: () => void;
    projectId?: string;
    initialData?: TimesheetEntry | null;
}

export function TimesheetForm({ onSubmit, onCancel, projectId, initialData }: TimesheetFormProps) {
    const [formData, setFormData] = useState<Partial<TimesheetEntry>>({
        projectId: projectId || "",
        taskId: "",
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        description: "",
        ...initialData
    });

    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        const fetchProjects = async () => {
            const data = await projectService.getProjects();
            setProjects(data);
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                projectId: initialData.projectId,
                taskId: initialData.taskId,
                date: initialData.date,
                hours: initialData.hours, // Ensure number
                description: initialData.description
            });
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.projectId) {
            const fetchTasks = async () => {
                const data = await projectService.getProjectTasks(formData.projectId as string);
                setTasks(data);
            };
            fetchTasks();
        } else {
            setTasks([]);
        }
    }, [formData.projectId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value, taskId: "" })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                        {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="task">Task (Optional)</Label>
                <Select
                    value={formData.taskId || "none"}
                    onValueChange={(value) => setFormData({ ...formData, taskId: value === "none" ? undefined : value })}
                    disabled={!formData.projectId}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Task" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">General / No Task</SelectItem>
                        {tasks.map((t) => (
                            <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                        id="hours"
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        required
                        value={formData.hours}
                        onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="What did you work on?"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{initialData ? "Update Entry" : "Log Time"}</Button>
            </div>
        </form>
    );
}
