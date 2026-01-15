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
import { customerService } from "../../crm/services/customerService";
import type { Customer } from "../../crm/types";
import type { Project } from "../types";

interface ProjectFormProps {
    onSubmit: (data: Partial<Project>) => void;
    onCancel: () => void;
    initialData?: Project | null;
}

export function ProjectForm({ onSubmit, onCancel, initialData }: ProjectFormProps) {
    const [formData, setFormData] = useState<Partial<Project> & { budget: string | number }>({
        name: "",
        description: "",
        clientId: "", // Initialize as empty string
        status: "planning",
        startDate: "",
        endDate: "",
        budget: 0,
        ...initialData
    });

    const [customers, setCustomers] = useState<Customer[]>([]);


    useEffect(() => {
        // Correct issues with null values from initialData which might cause uncontrolled input warnings
        if (initialData) {
            setFormData({
                ...initialData,
                description: initialData.description || "",
                clientId: initialData.clientId || "",
                startDate: initialData.startDate || "",
                endDate: initialData.endDate || "",
                budget: initialData.budget || 0
            });
        }
    }, [initialData]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const data = await customerService.getCustomers();
                setCustomers(data);
            } catch (error) {
                console.error("Failed to fetch customers", error);
            }
        };
        fetchCustomers();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert empty strings back to null/undefined if necessary, or just submit
        // Note: Number(budget) handled in service or here.
        onSubmit({
            ...formData,
            budget: Number(formData.budget),
            clientId: formData.clientId === "none" ? null : formData.clientId
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    <Label htmlFor="client">Client</Label>
                    <Select
                        value={formData.clientId || "none"}
                        onValueChange={(value) => setFormData({ ...formData, clientId: value === "none" ? null : value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Client" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                    {customer.name} {customer.company ? `(${customer.company})` : ""}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status || "planning"}
                        onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="planning">Planning</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate || ""}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate || ""}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => {
                        const value = e.target.value;
                        setFormData({ ...formData, budget: value === "" ? 0 : Number(value) });
                    }}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? "Update Project" : "Create Project"}
                </Button>
            </div>
        </form>
    );
}
