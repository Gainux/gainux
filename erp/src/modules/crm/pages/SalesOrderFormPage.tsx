import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { crmService } from "../services/crmService";
import { salesOrderService } from "../services/salesOrderService";
import type { Company, SalesOrderItem } from "../types";
import { toast } from "sonner";
import { ArrowLeft, Trash, Plus } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
export default function SalesOrderFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currency, formatAmount } = useCurrency();
    const isEdit = !!id; // Derived from id

    const [searchParams] = useSearchParams();
    const quoteId = searchParams.get('quoteId');

    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState<Company[]>([]);

    // Form State
    const [companyId, setCompanyId] = useState("");
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<SalesOrderItem[]>([
        { description: "", quantity: 1, unitPrice: 0, total: 0 }
    ]);

    useEffect(() => {
        loadData();
    }, [id, quoteId]);

    const loadData = async () => {
        try {
            const companyData = await crmService.getCompanies();
            setCompanies(companyData);

            if (isEdit && id) {
                // Load existing order logic here
            } else if (quoteId) {
                const quotes = await crmService.getQuotes(); // In real app, getItem(id) is better
                const quote = quotes.find(q => q.id === quoteId);
                if (quote) {
                    if (quote.companyId) setCompanyId(quote.companyId);
                    if (quote.items?.length) {
                        setItems(quote.items.map(i => ({
                            description: i.description,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            total: i.total
                        })));
                    }
                    toast.success("Loaded details from Quote");
                }
            }
        } catch (_error) {
            toast.error("Failed to load initial data");
        }
    };

    const updateItem = (index: number, field: keyof SalesOrderItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Recalculate total
        if (field === 'quantity' || field === 'unitPrice') {
            item.total = Number(item.quantity) * Number(item.unitPrice);
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + item.total, 0);
    };

    const handleSubmit = async () => {
        if (!companyId) return toast.error("Please select a customer");
        if (items.some(i => !i.description)) return toast.error("Please fill in item descriptions");

        try {
            setLoading(true);
            await salesOrderService.createOrder({
                orgId: "", // Service handles override
                companyId,
                orderDate,
                status: 'draft',
                currency: currency,
                totalAmount: calculateTotal(),
                items,
                quoteId: quoteId || undefined,
                dealId: undefined
            });
            toast.success("Sales Order created!");
            navigate("/crm/orders");
        } catch (error) {
            console.error(error);
            toast.error("Failed to create order");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/crm/orders")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Create Sales Order</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Customer</Label>
                            <Select value={companyId} onValueChange={setCompanyId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Order Date</Label>
                            <Input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total Amount</span>
                            <span>{formatAmount(calculateTotal())}</span>
                        </div>
                        <Button className="w-full mt-4" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Saving..." : "Create Order"}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Line Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-4 items-end border-b pb-4">
                            <div className="flex-1 space-y-2">
                                <Label>Description</Label>
                                <Input
                                    value={item.description}
                                    onChange={e => updateItem(index, 'description', e.target.value)}
                                    placeholder="Product or Service name"
                                />
                            </div>
                            <div className="w-24 space-y-2">
                                <Label>Qty</Label>
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => updateItem(index, 'quantity', Number(e.target.value))}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Unit Price</Label>
                                <Input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={e => updateItem(index, 'unitPrice', Number(e.target.value))}
                                />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Total</Label>
                                <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                                    {item.total.toFixed(2)}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                                <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
