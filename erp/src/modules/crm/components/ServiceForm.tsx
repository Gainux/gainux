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
import type { ServiceCatalog } from "@/modules/crm/types";
import { useCurrency } from "@/hooks/useCurrency";

interface ServiceFormProps {
    initialData?: ServiceCatalog | null;
    onSubmit: (data: Omit<ServiceCatalog, 'id' | 'orgId' | 'createdAt' | 'updatedAt'>) => void;
    onCancel: () => void;
}

export function ServiceForm({ initialData, onSubmit, onCancel }: ServiceFormProps) {
    const { symbol } = useCurrency();
    const [name, setName] = useState(initialData?.name || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [category, setCategory] = useState(initialData?.category || "");
    const [price, setPrice] = useState(initialData?.price?.toString() || "");
    const [duration, setDuration] = useState(initialData?.duration?.toString() || "");
    const [status, setStatus] = useState<ServiceCatalog["status"]>(initialData?.status || "active");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            description: description || undefined,
            category: category || undefined,
            price: parseFloat(price) || 0,
            duration: duration ? parseInt(duration, 10) : undefined,
            status,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 relative">
            <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Engine Oil Change"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the service"
                    rows={3}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Maintenance, Repair"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(v: "active" | "inactive" | "draft") => setStatus(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price ({symbol})</Label>
                    <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="duration">Duration (Minutes)</Label>
                    <Input
                        id="duration"
                        type="number"
                        min="1"
                        step="1"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Optional"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? "Save Changes" : "Create Service"}
                </Button>
            </div>
        </form>
    );
}
