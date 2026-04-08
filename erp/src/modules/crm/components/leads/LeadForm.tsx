
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
import type { Lead, LeadCategory, LeadLocation } from "@/modules/crm/types";
import { crmService } from "@/modules/crm/services/crmService";

interface LeadFormProps {
    initialData?: Lead;
    onSubmit: (data: Partial<Lead>) => void;
    onCancel: () => void;
    loading?: boolean;
    defaultCategoryId?: string;
    defaultLocationId?: string;
}

export function LeadForm({ initialData, onSubmit, onCancel, loading, defaultCategoryId, defaultLocationId }: LeadFormProps) {
    const [formData, setFormData] = useState<Partial<Lead>>(
        initialData || {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            companyName: "",
            source: "",
            status: "do_cold_call",
            notes: "",
            categoryId: defaultCategoryId,
            locationId: defaultLocationId,
        }
    );

    const [categories, setCategories] = useState<LeadCategory[]>([]);
    const [locations, setLocations] = useState<LeadLocation[]>([]);

    useEffect(() => {
        crmService.getLeadCategories().then(setCategories).catch(() => {});
        crmService.getLeadLocations().then(setLocations).catch(() => {});
    }, []);

    const filteredLocations = locations.filter(l => l.categoryId === formData.categoryId);

    const handleChange = (field: keyof Lead, value: any) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            // Clear location when category changes
            if (field === 'categoryId') next.locationId = undefined;
            return next;
        });
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
                            <SelectItem value="do_cold_call">Do Cold Call</SelectItem>
                            <SelectItem value="collecting_requirements">Collecting Requirements</SelectItem>
                            <SelectItem value="not_interested">Not Interested</SelectItem>
                            <SelectItem value="preparing_proposal">Preparing Proposal</SelectItem>
                            <SelectItem value="waiting_for_proposal_response">Waiting for Proposal Response</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="waiting_for_advance_amount">Waiting for Advance Amount</SelectItem>
                            <SelectItem value="work_ongoing">Work Ongoing</SelectItem>
                            <SelectItem value="do_completion_call">Do Completion Call</SelectItem>
                            <SelectItem value="waiting_for_full_payment">Waiting for Full Payment</SelectItem>
                            <SelectItem value="complete">Complete</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Category & Location */}
            {categories.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select
                            value={formData.categoryId ?? "__none__"}
                            onValueChange={val => handleChange("categoryId", val === "__none__" ? undefined : val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <span className="flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full" style={{ background: cat.color }} />
                                            {cat.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Location</Label>
                        <Select
                            value={formData.locationId ?? "__none__"}
                            onValueChange={val => handleChange("locationId", val === "__none__" ? undefined : val)}
                            disabled={!formData.categoryId || filteredLocations.length === 0}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={!formData.categoryId ? "Select category first" : "None"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">None</SelectItem>
                                {filteredLocations.map(loc => (
                                    <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

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
