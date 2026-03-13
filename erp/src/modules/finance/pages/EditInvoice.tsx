import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { invoiceService } from "../services/invoiceService";
import { crmService } from "@/modules/crm/services/crmService";
import { taxService } from "../services/taxService";
import type { Company } from "@/modules/crm/types";
import type { InvoiceItem, TaxRate } from "../types";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";

export default function EditInvoice() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { formatAmount } = useCurrency();
    const orgId = profile?.org_id;

    const [companies, setCompanies] = useState<Company[]>([]);
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [customerId, setCustomerId] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [applyGst, setApplyGst] = useState(true);
    const [taxRate, setTaxRate] = useState("0");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<Partial<InvoiceItem>[]>([
        { description: "", quantity: 1, unitPrice: 0, amount: 0 }
    ]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [companiesData, invoiceData, taxRatesData] = await Promise.all([
                crmService.getCompanies(),
                id ? invoiceService.getInvoiceById(id) : null,
                orgId ? taxService.getTaxRates(orgId) : Promise.resolve([])
            ]);

            setCompanies(companiesData);
            setTaxRates(taxRatesData);

            if (invoiceData) {
                setCustomerId(invoiceData.customerId || "");
                setIssueDate(invoiceData.issueDate);
                setDueDate(invoiceData.dueDate);
                setApplyGst(invoiceData.taxRate > 0);
                setTaxRate(invoiceData.taxRate.toString());
                setNotes(invoiceData.notes || "");
                setItems(invoiceData.items || [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
            }
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const updatedItems = [...items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: value
        };

        // Calculate amount
        if (field === 'quantity' || field === 'unitPrice') {
            const qty = field === 'quantity' ? parseFloat(value) || 0 : updatedItems[index].quantity || 0;
            const price = field === 'unitPrice' ? parseFloat(value) || 0 : updatedItems[index].unitPrice || 0;
            updatedItems[index].amount = qty * price;
        }

        setItems(updatedItems);
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const tax = applyGst ? subtotal * (parseFloat(taxRate) / 100) : 0;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!customerId) {
            alert("Please select a customer");
            return;
        }

        if (!id) return;

        try {
            setSaving(true);
            const { subtotal, tax, total } = calculateTotals();

            await invoiceService.updateInvoice(id, {
                customerId,
                issueDate,
                dueDate,
                subtotal,
                taxRate: applyGst ? parseFloat(taxRate) : 0,
                taxAmount: tax,
                total,
                notes,
            }, items as InvoiceItem[]);

            navigate(`/finance/invoices/${id}`);
        } catch (err: any) {
            console.error("Error updating invoice:", err);
            alert("Failed to update invoice: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const { subtotal, tax, total } = calculateTotals();

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(`/finance/invoices/${id}`)}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Edit Invoice</h2>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-6">
                        {/* Invoice Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Invoice Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer">Customer *</Label>
                                        <Select value={customerId} onValueChange={setCustomerId} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select customer" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {companies.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="issueDate">Issue Date *</Label>
                                        <Input
                                            id="issueDate"
                                            type="date"
                                            value={issueDate}
                                            onChange={(e) => setIssueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dueDate">Due Date *</Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-3">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="applyGst"
                                                checked={applyGst}
                                                onCheckedChange={(checked) => setApplyGst(checked as boolean)}
                                            />
                                            <Label htmlFor="applyGst" className="cursor-pointer">
                                                Apply GST
                                            </Label>
                                        </div>
                                        {applyGst && (
                                            <div className="space-y-2">
                                                <Label htmlFor="taxRate">GST Rate</Label>
                                                <Select
                                                    value={taxRate}
                                                    onValueChange={setTaxRate}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Tax Rate" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {taxRates.map(rate => (
                                                            <SelectItem key={rate.id} value={rate.rate.toString()}>
                                                                {rate.name} ({rate.rate}%)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Line Items */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Line Items</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Item
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {items.map((item, index) => (
                                        <div key={index} className="grid gap-4 md:grid-cols-12 items-end pb-4 border-b last:border-0">
                                            <div className="md:col-span-5 space-y-2">
                                                <Label>Description</Label>
                                                <Input
                                                    placeholder="Item description"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Quantity</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Unit Price</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unitPrice}
                                                    onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Amount</Label>
                                                <Input
                                                    value={item.amount?.toFixed(2) || '0.00'}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </div>
                                            <div className="md:col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={items.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Additional Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Payment terms, special instructions, etc."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal:</span>
                                    <span className="font-medium">{formatAmount(subtotal)}</span>
                                </div>
                                {applyGst && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">GST ({taxRate}%):</span>
                                        <span className="font-medium">{formatAmount(tax)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-border" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{formatAmount(total)}</span>
                                </div>

                                <div className="pt-4 space-y-2">
                                    <Button type="submit" className="w-full" disabled={saving}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/finance/invoices/${id}`)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}
