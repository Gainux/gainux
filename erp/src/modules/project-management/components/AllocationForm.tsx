import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { ResourceAllocation } from "../types";

interface AllocationFormProps {
    projectId: string; // Pre-selected project
    initialData?: ResourceAllocation;
    onSubmit: (data: Partial<ResourceAllocation>) => void;
    onCancel: () => void;
}

export function AllocationForm({ projectId, initialData, onSubmit, onCancel }: AllocationFormProps) {
    const [employees, setEmployees] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        employeeId: initialData?.employeeId || "",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
        allocationPercentage: initialData?.allocationPercentage || 100
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            const { data } = await supabase.from('employees').select('id, first_name, last_name');
            if (data) setEmployees(data);
        };
        fetchEmployees();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            projectId,
            employeeId: formData.employeeId,
            startDate: formData.startDate,
            endDate: formData.endDate,
            allocationPercentage: Number(formData.allocationPercentage)
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <Select
                    value={formData.employeeId}
                    onValueChange={(value) => setFormData({ ...formData, employeeId: value })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Employee" />
                    </SelectTrigger>
                    <SelectContent>
                        {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">{initialData ? 'Update' : 'Allocate'}</Button>
            </div>
        </form>
    );
}
