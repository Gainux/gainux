
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Trash, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { procurementService } from "../services/procurementService";
import { vendorService } from "../services/vendorService";
import type { PurchaseOrder, Vendor, InventoryItem, PurchaseOrderItem } from "../types";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";

export default function PurchaseOrderDetails() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isNew = !id || id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [submitting, setSubmitting] = useState(false);

    // Data
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

    // Form State
    const [po, setPo] = useState<Partial<PurchaseOrder>>({
        order_number: `PO-${Date.now().toString().slice(-6)}`, // Temporary auto-gen
        order_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        total_amount: 0,
        notes: ""
    });

    const [items, setItems] = useState<Partial<PurchaseOrderItem>[]>([]);

    useEffect(() => {
        if (profile?.org_id) {
            loadMetaData();
            if (!isNew) loadPO();
        }
    }, [profile?.org_id, id]);

    const loadMetaData = async () => {
        try {
            const [vendorsData, itemsData] = await Promise.all([
                vendorService.getVendors(profile?.org_id || ''),
                procurementService.getInventoryItems(profile?.org_id || '')
            ]);
            setVendors(vendorsData);
            setInventoryItems(itemsData);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load metadata");
        }
    };

    const loadPO = async () => {
        try {
            setLoading(true);
            const data = await procurementService.getPurchaseOrder(id!);
            setPo(data);
            if (data.items) setItems(data.items);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load PO");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { item_id: "", quantity: 1, unit_price: 0, total_price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
        calculateTotal(newItems);
    };

    const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index] };

        if (field === 'item_id') {
            const selectedInventoryItem = inventoryItems.find(i => i.id === value);
            if (selectedInventoryItem) {
                item.item_id = value;
                item.unit_price = selectedInventoryItem.cost_price; // Default to cost price
                item.item = selectedInventoryItem; // Store ref for UI
            }
        } else {
            (item as any)[field] = value;
        }

        // Recalculate line total
        item.total_price = (item.quantity || 0) * (item.unit_price || 0);
        newItems[index] = item;
        setItems(newItems);
        calculateTotal(newItems);
    };

    const calculateTotal = (currentItems: Partial<PurchaseOrderItem>[]) => {
        const total = currentItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
        setPo(prev => ({ ...prev, total_amount: total }));
    };

    const handleSave = async () => {
        if (!profile?.org_id) return;
        if (!po.vendor_id) return toast.error("Please select a vendor");
        if (items.length === 0) return toast.error("Please add at least one item");

        // Validate Items
        for (const item of items) {
            if (!item.item_id) return toast.error("Please select an inventory item for all rows");
            if (!item.quantity || item.quantity <= 0) return toast.error("Quantity must be greater than 0");
            if (item.unit_price === undefined || item.unit_price < 0) return toast.error("Unit price cannot be negative");
        }

        setSubmitting(true);
        try {
            if (isNew) {
                await procurementService.createPurchaseOrder({
                    ...po,
                    org_id: profile.org_id
                }, items);
                toast.success("PO Created");
                navigate("/procurement/purchase-orders");
            } else {
                // Update logic (simplified: currently recreate or just status update? 
                // For now, implementing create only as per plan. Edit is complex with item sync)
                toast.info("Update logic requires implementation plan update");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save PO");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/procurement/purchase-orders")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{isNew ? "Create Purchase Order" : `PO: ${po.order_number}`}</h2>
                    <p className="text-muted-foreground">{isNew ? "Draft a new order for a vendor" : `Created on ${format(new Date(po.created_at || new Date()), 'MMM dd, yyyy')}`}</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline" onClick={() => navigate("/procurement/purchase-orders")}>Cancel</Button>
                    {isNew && <Button onClick={handleSave} disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Order
                    </Button>}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Select Vendor</Label>
                                <Select
                                    value={po.vendor_id}
                                    onValueChange={val => setPo({ ...po, vendor_id: val })}
                                    disabled={!isNew}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose Vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendors.map(v => (
                                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Order Date</Label>
                                <Input
                                    type={isNew ? "date" : "text"}
                                    value={isNew ? po.order_date : (po.order_date ? format(new Date(po.order_date), 'MMM dd, yyyy') : '')}
                                    onChange={e => setPo({ ...po, order_date: e.target.value })}
                                    disabled={!isNew}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Expected Delivery</Label>
                                <Input
                                    type={isNew ? "date" : "text"}
                                    value={isNew ? (po.expected_delivery_date || '') : (po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'MMM dd, yyyy') : '')}
                                    onChange={e => setPo({ ...po, expected_delivery_date: e.target.value })}
                                    disabled={!isNew}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>PO Number</Label>
                                <Input value={po.order_number} disabled />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={po.notes || ''}
                                onChange={e => setPo({ ...po, notes: e.target.value })}
                                disabled={!isNew}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Order Items</CardTitle>
                        {isNew && <Button size="sm" variant="secondary" onClick={handleAddItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>}
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Item</TableHead>
                                    <TableHead className="w-[15%]">Quantity</TableHead>
                                    <TableHead className="w-[15%]">Unit Price</TableHead>
                                    <TableHead className="w-[15%] text-right">Total</TableHead>
                                    {isNew && <TableHead className="w-[5%]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {isNew ? (
                                                <Select
                                                    value={item.item_id}
                                                    onValueChange={val => handleItemChange(index, 'item_id', val)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Item" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {inventoryItems.map(i => (
                                                            <SelectItem key={i.id} value={i.id}>{i.name} ({i.sku})</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <span>{item.item?.name || 'Unknown Item'}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity || ''}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value);
                                                    handleItemChange(index, 'quantity', isNaN(val) ? 0 : val);
                                                }}
                                                disabled={!isNew}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price || ''}
                                                onChange={e => {
                                                    const val = parseFloat(e.target.value);
                                                    handleItemChange(index, 'unit_price', isNaN(val) ? 0 : val);
                                                }}
                                                disabled={!isNew}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ${(item.total_price || 0).toFixed(2)}
                                        </TableCell>
                                        {isNew && (
                                            <TableCell>
                                                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleRemoveItem(index)}>
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end pt-4">
                            <div className="text-xl font-bold">Total: ${po.total_amount?.toFixed(2)}</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

