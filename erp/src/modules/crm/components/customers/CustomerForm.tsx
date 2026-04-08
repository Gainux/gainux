import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Company } from "@/modules/crm/types";

interface CustomerFormProps {
    initialData?: Company | null;
    onSubmit: (data: Partial<Company>) => void;
    onCancel: () => void;
    loading?: boolean;
}

export function CustomerForm({ initialData, onSubmit, onCancel, loading }: CustomerFormProps) {
    const [name, setName] = useState(initialData?.name || "");
    const [email, setEmail] = useState(initialData?.email || "");
    const [phone, setPhone] = useState(initialData?.phone || "");
    const [address, setAddress] = useState(initialData?.address || "");
    const [website, setWebsite] = useState(initialData?.website || "");
    const [industry, setIndustry] = useState(initialData?.industry || "");

    // Extra fields to match UI but might need adding to Company type later if truly needed:
    // city, state, zip, country
    // For now, let's append them to address or ignore? 
    // The user screenshot showed them. Let's keep them and maybe append to address string or just ignore if schema doesn't support.
    // Given the task is to fix "company and email", let's prioritize those.
    // Address in DB is a single string. The UI splits it.
    // check crmService map: address maps to address.
    // I will concatenate them into address for now, or just provide the address field.
    // To match user expectation, I'll keep the address inputs but save them effectively.
    // Actually, let's keep it simple: Just name, email, phone, website, address (textarea/input).
    // But wait, the user showed a split address form.
    // If I simplify it to one Address field, it might regress UI.
    // Let's rely on the single 'address' field in types for now to ensure saving works.

    // Changing strategy: Since DB only has 'address' string, I will treat the main 'Address' input as the mapped field.
    // I will remove the extraneous 'City', 'State', etc. inputs unless I want to concat them.
    // Let's simplify and use one Address field to match the backend reality.
    // AND Remove the redundant 'Company' input.

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            name,
            email,
            phone,
            address,
            website,
            industry,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Technology, Retail"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full Address"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {initialData ? "Save Changes" : "Create Customer"}
                </Button>
            </div>
        </form >
    );
}
