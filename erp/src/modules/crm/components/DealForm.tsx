
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
import { crmService } from "@/modules/crm/services/crmService";
import type { Deal, Contact, Company } from "@/modules/crm/types";

interface DealFormProps {
    initialData?: Deal | null;
    onSubmit: (data: Partial<Deal>) => void;
    onCancel: () => void;
}

export function DealForm({ initialData, onSubmit, onCancel }: DealFormProps) {
    const [title, setTitle] = useState(initialData?.title || "");
    const [companyId, setCompanyId] = useState(initialData?.companyId || "");
    const [value, setValue] = useState(initialData?.value?.toString() || "");
    const [stage, setStage] = useState<Deal["stage"]>((initialData?.stage as Deal["stage"]) || "lead");
    const [expectedCloseDate, setExpectedCloseDate] = useState(initialData?.expectedCloseDate || "");
    const [contactId, setContactId] = useState(initialData?.contactId || "");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingContacts(true);
                const [contactsData, companiesData] = await Promise.all([
                    crmService.getContacts(),
                    crmService.getCompanies()
                ]);
                setContacts(contactsData);
                setCompanies(companiesData);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoadingContacts(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title,
            value: parseFloat(value) || 0,
            stage,
            expectedCloseDate,
            contactId: contactId || undefined,
            companyId: companyId || undefined,
        });
    };

    const handleContactChange = (id: string) => {
        setContactId(id);
        const selectedContact = contacts.find(c => c.id === id);
        if (selectedContact && selectedContact.companyId) {
            setCompanyId(selectedContact.companyId);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... title input ... */}
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
                <Label htmlFor="contact">Contact (Optional)</Label>
                <Select
                    value={contactId}
                    onValueChange={handleContactChange}
                    disabled={loadingContacts}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={loadingContacts ? "Loading contacts..." : "Select a contact"} />
                    </SelectTrigger>
                    <SelectContent>
                        {contacts.length === 0 ? (
                            <SelectItem value="none" disabled>No contacts found</SelectItem>
                        ) : (
                            contacts.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.firstName} {c.lastName} {c.company ? `(${c.company.name})` : ''}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="company">Company (Customer)</Label>
                <Select value={companyId} onValueChange={setCompanyId}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                        {companies.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
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
