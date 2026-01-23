
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { procurementService } from "../services/procurementService";
import { useAuth } from "@/context/AuthContext";
import type { InventoryItem, RFQ } from "../types";

interface RFQItemRow {
    item_id: string;
    quantity: number;
    notes: string;
}

export default function RFQDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isNew = id === 'new' || !id;

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // RFQ Data
    const [rfqNumber, setRfqNumber] = useState("");
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<RFQ['status']>('draft');
    const [deadline, setDeadline] = useState("");

    // Items
    const [items, setItems] = useState<RFQItemRow[]>([]);
    const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);

    useEffect(() => {
        if (profile?.org_id) {
            loadInventoryItems();
            if (!isNew && id) {
                loadRFQ(id);
            } else {
                generateRFQNumber();
            }
        }
    }, [id, profile?.org_id]);

    const loadInventoryItems = async () => {
        try {
            const data = await procurementService.getInventoryItems(profile?.org_id || '');
            setAvailableItems(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inventory items");
        }
    };

    const generateRFQNumber = () => {
        const date = new Date();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        setRfqNumber(`RFQ-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}-${random}`);
    };

    const loadRFQ = async (rfqId: string) => {
        try {
            setLoading(true);
            const data = await procurementService.getRFQ(rfqId);
            if (data) {
                setRfqNumber(data.rfq_number);
                setTitle(data.title || "");
                setStatus(data.status);
                setDeadline(data.deadline || "");

                if (data.items) {
                    setItems(data.items.map(i => ({
                        item_id: i.item_id,
                        quantity: i.quantity,
                        notes: i.notes || ""
                    })));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load RFQ details");
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { item_id: "", quantity: 1, notes: "" }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof RFQItemRow, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            toast.error("Please enter a title");
            return;
        }

        if (items.length === 0) {
            toast.error("Please add at least one item");
            return;
        }

        if (items.some(i => !i.item_id || i.quantity <= 0)) {
            toast.error("Please ensure all items have a product selected and valid quantity");
            return;
        }

        try {
            setSaving(true);
            const rfqData: Partial<RFQ> = {
                org_id: profile?.org_id || '',
                rfq_number: rfqNumber,
                title,
                status,
                deadline: deadline || undefined
            };

            if (isNew) {
                await procurementService.createRFQ(rfqData, items);
                toast.success("RFQ created successfully");
                navigate("/procurement/rfq");
            } else {
                // Update implementation would go here (complex due to items diffing)
                // For now just update status/header
                if (id) {
                    await procurementService.updateRFQStatus(id, status);
                    toast.success("RFQ updated (Items update not implemented in this view)");
                    navigate("/procurement/rfq");
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to save RFQ");
        } finally {
            setSaving(false);
        }
    };

    /*const canEdit = isNew || status === 'draft';*/
    /* Allow editing for now to simplify testing */
    const canEdit = true;

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/procurement/rfq")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isNew ? "Create Request for Quotation" : `RFQ: ${rfqNumber}`}
                    </h2>
                </div>
                <Button onClick={handleSave} disabled={saving || !canEdit}>
                    {saving ? <span className="animate-spin mr-2">⏳</span> : <Save className="mr-2 h-4 w-4" />}
                    Save RFQ
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-5 space-y-4">
                    {/* Header Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>RFQ Number</Label>
                                <Input value={rfqNumber} disabled readOnly />
                            </div>
                            <div className="space-y-2">
                                <Label>Title / Reference</Label>
                                <Input
                                    placeholder="e.g. Monthly Raw Materials"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    disabled={!canEdit}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={status}
                                    onValueChange={(v: any) => setStatus(v)}
                                    disabled={!canEdit}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                        <SelectItem value="awarded">Awarded</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline</Label>
                                {canEdit ? (
                                    <Input
                                        type="date"
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                    />
                                ) : (
                                    <Input
                                        value={deadline ? format(new Date(deadline), 'MMM dd, yyyy') : '-'}
                                        readOnly
                                        disabled
                                        className="bg-transparent text-foreground disabled:opacity-100 disabled:text-gray-400"
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Items Needed</CardTitle>
                            {canEdit && (
                                <Button size="sm" variant="outline" onClick={handleAddItem}>
                                    <Plus className="h-4 w-4 mr-2" /> Add Item
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40%]">Item</TableHead>
                                        <TableHead className="w-[20%]">Quantity</TableHead>
                                        <TableHead>Notes</TableHead>
                                        {canEdit && <TableHead className="w-[50px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                No items added.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Select
                                                        value={item.item_id}
                                                        onValueChange={(val) => handleItemChange(index, 'item_id', val)}
                                                        disabled={!canEdit}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select item" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {availableItems.map(i => (
                                                                <SelectItem key={i.id} value={i.id}>
                                                                    {i.name} ({i.unit})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        disabled={!canEdit}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        placeholder="Specs, grade, etc."
                                                        value={item.notes}
                                                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                                                        disabled={!canEdit}
                                                    />
                                                </TableCell>
                                                {canEdit && (
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-700"
                                                            onClick={() => handleRemoveItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-2 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Help</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>
                                Create an RFQ to solicit bids from vendors.
                            </p>
                            <p>
                                1. Add items you need.
                            </p>
                            <p>
                                2. Set a deadline.
                            </p>
                            <p>
                                3. Once created, you can print/export this RFQ to send to suppliers.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
