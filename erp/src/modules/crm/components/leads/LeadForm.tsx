
import { useState } from "react";
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
import type { Lead } from "@/modules/crm/types";

interface LeadFormProps {
    initialData?: Lead;
    onSubmit: (data: Partial<Lead>) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function LeadForm({ initialData, onSubmit, onCancel, loading }: LeadFormProps) {
    const [formData, setFormData] = useState<Partial<Lead>>(
        initialData || {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            companyName: "",
            source: "",
            status: "new",
            notes: "",
        }
    );

    const handleChange = (field: keyof Lead, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={e => handleChange("firstName", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={e => handleChange("lastName", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e => handleChange("email", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={e => handleChange("phone", e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                        id="companyName"
                        value={formData.companyName}
                        onChange={e => handleChange("companyName", e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                        value={formData.status}
                        onValueChange={val => handleChange("status", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="qualified">Qualified</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input
                    id="source"
                    placeholder="e.g. Website, Referral, LinkedIn"
                    value={formData.source}
                    onChange={e => handleChange("source", e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={e => handleChange("notes", e.target.value)}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading && <span className="animate-spin mr-2">⏳</span>}
                    {initialData ? "Save Changes" : "Create Lead"}
                </Button>
            </div>
        </form>
    );
}
