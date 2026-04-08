import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { invoiceService } from "../services/invoiceService";
import { crmService } from "@/modules/crm/services/crmService";
import { taxService } from "../services/taxService";
import type { Company } from "@/modules/crm/types";
import type { InvoiceItem, TaxRate } from "../types";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/context/AuthContext";

export default function CreateInvoice() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { formatAmount } = useCurrency();
    const orgId = profile?.org_id;

    const [companies, setCompanies] = useState<Company[]>([]);
    const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
    const [customerId, setCustomerId] = useState("");
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState("");
    const [applyGst, setApplyGst] = useState(true);
    const [taxRate, setTaxRate] = useState("0");
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState<Partial<InvoiceItem>[]>([
        { description: "", quantity: 1, unitPrice: 0, amount: 0 }
    ]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (orgId) {
            fetchData();
        }
    }, [orgId]);

    const fetchData = async () => {
        if (!orgId) return;
        try {
            const [companiesData, taxRatesData] = await Promise.all([
                crmService.getCompanies(),
                taxService.getTaxRates(orgId)
            ]);
            setCompanies(companiesData);
            setTaxRates(taxRatesData);

            // Set default tax rate if available (e.g., first one or one marked as default)
            if (taxRatesData.length > 0) {
                setTaxRate(taxRatesData[0].rate.toString());
            }
        } catch (err) {
            console.error("Error fetching data:", err);
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

        if (items.length === 0 || !items[0].description) {
            alert("Please add at least one line item");
            return;
        }

        try {
            setLoading(true);
            const { subtotal, tax, total } = calculateTotals();

            if (!orgId) {
                alert("Organization ID not found");
                return;
            }

            await invoiceService.createInvoice({
                orgId,
                customerId,
                issueDate,
                dueDate,
                status: 'draft',
                subtotal,
                taxRate: applyGst ? parseFloat(taxRate) : 0,
                taxAmount: tax,
                total,
                currency: 'INR',
                notes,
            }, items as InvoiceItem[]);

            navigate("/finance/invoices");
        } catch (err: any) {
            console.error("Error creating invoice:", err);
            alert("Failed to create invoice: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const { subtotal, tax, total } = calculateTotals();

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/finance/invoices")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl md:text-3xl font-bold tracking-tight">Create Invoice</h2>
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
                                                Apply Tax
                                            </Label>
                                        </div>
                                        {applyGst && (
                                            <div className="space-y-2">
                                                <Label htmlFor="taxRate">Tax Rate</Label>
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
                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Creating..." : "Create Invoice"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate("/finance/invoices")}
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
