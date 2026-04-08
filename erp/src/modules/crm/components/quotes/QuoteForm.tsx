
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Quote, QuoteItem, Company, Contact, Deal } from "@/modules/crm/types";
import { crmService } from "@/modules/crm/services/crmService";
import { Plus, Trash2 } from "lucide-react";

interface QuoteFormProps {
    initialData?: Quote | null;
    onSubmit: (data: Partial<Quote>) => void;
    onCancel: () => void;
}

export function QuoteForm({ initialData, onSubmit, onCancel }: QuoteFormProps) {
    const [dealId, setDealId] = useState(initialData?.dealId || "");
    const [companyId, setCompanyId] = useState(initialData?.companyId || "");
    const [contactId, setContactId] = useState(initialData?.contactId || "");
    const [status, setStatus] = useState<Quote["status"]>(initialData?.status || "draft");
    const [issueDate, setIssueDate] = useState(initialData?.issueDate || new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState(initialData?.validUntil || "");
    const [notes, setNotes] = useState(initialData?.notes || "");
    const [items, setItems] = useState<QuoteItem[]>(initialData?.items || []);
    const [scopeOfWork, setScopeOfWork] = useState(initialData?.scopeOfWork || "");
    const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || "");
    const [terms, setTerms] = useState(initialData?.terms || "");
    const [taxRate, setTaxRate] = useState(initialData?.taxRate || 0);

    // Lists for dropdowns
    const [deals, setDeals] = useState<Deal[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [dealsData, companiesData, contactsData] = await Promise.all([
                    crmService.getDeals(),
                    crmService.getCompanies(),
                    crmService.getContacts()
                ]);
                setDeals(dealsData);
                setCompanies(companiesData);
                setContacts(contactsData);
            } catch (error) {
                console.error("Failed to fetch options", error);
            }
        };
        fetchOptions();
    }, []);

    const handleAddItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof QuoteItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        // Recalculate total for the item
        if (field === "quantity" || field === "unitPrice") {
            const qty = field === "quantity" ? parseFloat(value) : newItems[index].quantity;
            const price = field === "unitPrice" ? parseFloat(value) : newItems[index].unitPrice;
            newItems[index].total = (qty || 0) * (price || 0);
        }

        setItems(newItems);
    };

    const calculateTotalAmount = () => {
        return items.reduce((sum, item) => sum + (item.total || 0), 0);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            dealId: dealId || undefined,
            companyId: companyId || undefined,
            contactId: contactId || undefined,
            status,
            issueDate,
            validUntil,
            notes,
            items,
            totalAmount: calculateTotalAmount(), // Note: Tax calculation should ideally happen here or in backend
            currency: "USD",
            scopeOfWork,
            paymentTerms,
            terms,
            taxRate
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="items">Line Items</TabsTrigger>
                    <TabsTrigger value="scope">Scope of Work</TabsTrigger>
                    <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="deal">Deal (Optional)</Label>
                            <Select value={dealId} onValueChange={setDealId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a deal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {deals.map(deal => (
                                        <SelectItem key={deal.id} value={deal.id}>{deal.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Select value={companyId} onValueChange={setCompanyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contact">Contact</Label>
                            <Select value={contactId} onValueChange={setContactId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select contact" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="issueDate">Issue Date</Label>
                            <Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="validUntil">Valid Until</Label>
                            <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-4 pt-4">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label>Line Items</Label>
                            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                <Plus className="h-4 w-4 mr-2" /> Add Item
                            </Button>
                        </div>
                        {items.map((item, index) => (
                            <div key={index} className="flex gap-2 items-end border p-2 rounded-md">
                                <div className="flex-1 space-y-1">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        value={item.description}
                                        onChange={e => handleItemChange(index, "description", e.target.value)}
                                        placeholder="Item description"
                                    />
                                </div>
                                <div className="w-20 space-y-1">
                                    <Label className="text-xs">Qty</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={e => handleItemChange(index, "quantity", e.target.value)}
                                    />
                                </div>
                                <div className="w-24 space-y-1">
                                    <Label className="text-xs">Price</Label>
                                    <Input
                                        type="number"
                                        min="0" step="0.01"
                                        value={item.unitPrice}
                                        onChange={e => handleItemChange(index, "unitPrice", e.target.value)}
                                    />
                                </div>
                                <div className="w-24 space-y-1">
                                    <Label className="text-xs">Total</Label>
                                    <div className="h-10 flex items-center px-3 border rounded-md bg-muted text-sm">
                                        {item.total.toFixed(2)}
                                    </div>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        ))}
                        <div className="flex justify-end items-center gap-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <Label>Tax Rate (%)</Label>
                                <Input
                                    type="number"
                                    className="w-20"
                                    value={taxRate}
                                    onChange={e => setTaxRate(Number(e.target.value))}
                                />
                            </div>
                            <div className="text-lg font-bold">
                                Total: ${calculateTotalAmount().toFixed(2)}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="scope" className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="scope">Scope of Work</Label>
                        <Textarea
                            id="scope"
                            className="min-h-[300px]"
                            value={scopeOfWork}
                            onChange={e => setScopeOfWork(e.target.value)}
                            placeholder="Detailed description of the project scope, deliverables, and timeline..."
                        />
                    </div>
                </TabsContent>

                <TabsContent value="terms" className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Textarea
                            id="paymentTerms"
                            className="min-h-[100px]"
                            value={paymentTerms}
                            onChange={e => setPaymentTerms(e.target.value)}
                            placeholder="e.g. 50% Upfront, 50% on Delivery..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="terms">Terms & Conditions</Label>
                        <Textarea
                            id="terms"
                            className="min-h-[150px]"
                            value={terms}
                            onChange={e => setTerms(e.target.value)}
                            placeholder="Standard terms, licensing, IP rights, etc."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Internal Notes</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Private notes for the team..."
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    {initialData ? "Save Changes" : "Create Quote"}
                </Button>
            </div>
        </form>
    );
}
