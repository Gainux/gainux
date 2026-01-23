
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { procurementService } from "../services/procurementService";
import type { InventoryItem } from "../types";
import { toast } from "sonner";

export default function InventoryPage() {
    const { profile } = useAuth();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
        name: "",
        sku: "",
        category: "",
        unit: "pcs",
        cost_price: 0,
        selling_price: 0,
        reorder_level: 10
    });

    useEffect(() => {
        if (profile?.org_id) loadItems();
    }, [profile?.org_id]);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await procurementService.getInventoryItems(profile!.org_id);
            setItems(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load inventory");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.org_id) return;
        setSubmitting(true);
        try {
            await procurementService.createInventoryItem({
                ...newItem,
                org_id: profile.org_id
            });
            toast.success("Item created");
            setIsAddOpen(false);
            setNewItem({ name: "", sku: "", category: "", unit: "pcs", cost_price: 0, selling_price: 0, reorder_level: 10 });
            loadItems();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create item");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Inventory Items</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[525px]">
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Add New Inventory Item</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Name</Label>
                                        <Input value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>SKU</Label>
                                        <Input value={newItem.sku} onChange={e => setNewItem({ ...newItem, sku: e.target.value })} placeholder="AUTO-GEN if empty" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Category</Label>
                                        <Input value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Unit (e.g., pcs, kg)</Label>
                                        <Input value={newItem.unit} onChange={e => setNewItem({ ...newItem, unit: e.target.value })} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Cost Price</Label>
                                        <Input type="number" value={newItem.cost_price} onChange={e => setNewItem({ ...newItem, cost_price: parseFloat(e.target.value) })} min={0} step="0.01" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Selling Price</Label>
                                        <Input type="number" value={newItem.selling_price} onChange={e => setNewItem({ ...newItem, selling_price: parseFloat(e.target.value) })} min={0} step="0.01" />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Reorder Level</Label>
                                        <Input type="number" value={newItem.reorder_level} onChange={e => setNewItem({ ...newItem, reorder_level: parseInt(e.target.value) })} min={0} />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Item
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm h-8"
                />
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Unit</TableHead>
                                <TableHead className="text-right">Cost</TableHead>
                                <TableHead className="text-right">Selling</TableHead>
                                <TableHead className="text-center">Reorder Level</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No items found</TableCell>
                                </TableRow>
                            ) : (
                                filteredItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-xs">{item.sku || '-'}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-muted-foreground" />
                                                {item.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>{item.category || '-'}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell className="text-right">${item.cost_price?.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${item.selling_price?.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">{item.reorder_level}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
