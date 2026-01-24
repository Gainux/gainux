import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SprintFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
    projectId: string;
    initialData?: any;
}

export function SprintForm({ onSubmit, onCancel, projectId, initialData }: SprintFormProps) {
    const [formData, setFormData] = useState({
        projectId,
        name: "",
        startDate: "",
        endDate: "",
        goal: "",
        status: "planned"
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                projectId
            });
        } else {
            // Default to 2 week sprint starting tomorrow?
            // Keep empty for now
        }
    }, [initialData, projectId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Sprint Name</Label>
                <Input
                    id="name"
                    placeholder="Sprint 1"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="goal">Sprint Goal</Label>
                <Textarea
                    id="goal"
                    placeholder="What do you want to achieve?"
                    value={formData.goal || ""}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{initialData ? "Update Sprint" : "Create Sprint"}</Button>
            </div>
        </form>
    );
}
