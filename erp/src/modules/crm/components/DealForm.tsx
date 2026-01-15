
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { Deal, Customer } from "@/modules/crm/types";
import { customerService } from "@/modules/crm/services/customerService";

interface DealFormProps {
    initialData?: Deal | null;
    onSubmit: (data: Partial<Deal>) => void;
    onCancel: () => void;
}

export function DealForm({ initialData, onSubmit, onCancel }: DealFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [company, setCompany] = useState(initialData?.company || "");
    const [value, setValue] = useState(initialData?.value?.toString() || "");
    const [stage, setStage] = useState<Deal["stage"]>(initialData?.stage || "new");
    const [expectedCloseDate, setExpectedCloseDate] = useState(initialData?.expectedCloseDate || "");
    const [customerId, setCustomerId] = useState(initialData?.customerId || "");
    const [customers, setCustomers] = useState<Customer[]>([]);

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
        onSubmit({
            title,
            company,
            value: parseFloat(value) || 0,
            stage,
            expectedCloseDate,
            customerId: customerId || undefined, // Send undefined if empty string
        });
    };

    const handleCustomerChange = (id: string) => {
        setCustomerId(id);
        // Optional: Auto-fill company name if customer is selected
        const selectedCustomer = customers.find(c => c.id === id);
        if (selectedCustomer && selectedCustomer.company) {
            setCompany(selectedCustomer.company);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Deal Title</Label>
                <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="e.g. Website Redesign"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="customer">Customer (Optional)</Label>
                <Select value={customerId} onValueChange={handleCustomerChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {customers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name} {c.company ? `(${c.company})` : ''}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                    placeholder="Client Company Name"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="value">Value (₹)</Label>
                    <Input
                        id="value"
                        type="number"
                        min="0"
                        step="0.01"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select value={stage} onValueChange={(value: any) => setStage(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="proposal">Proposal</SelectItem>
                            <SelectItem value="negotiation">Negotiation</SelectItem>
                            <SelectItem value="won">Won</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="date">Expected Close Date</Label>
                <Input
                    id="date"
                    type="date"
                    value={expectedCloseDate}
                    onChange={(e) => setExpectedCloseDate(e.target.value)}
                />
            </div>

            <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? "Save Changes" : "Create Deal"}
                </Button>
            </div>
        </form>
    );
}
