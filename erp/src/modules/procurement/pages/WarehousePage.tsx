
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MapPin, Building } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { procurementService } from "../services/procurementService";
import type { Warehouse } from "../types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function WarehousePage() {
    const { profile } = useAuth();
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [newWarehouse, setNewWarehouse] = useState<Partial<Warehouse>>({
        name: "",
        location: "",
        is_primary: false
    });

    useEffect(() => {
        if (profile?.org_id) loadWarehouses();
    }, [profile?.org_id]);

    const loadWarehouses = async () => {
        try {
            setLoading(true);
            const data = await procurementService.getWarehouses(profile!.org_id);
            setWarehouses(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load warehouses");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.org_id) return;
        setSubmitting(true);
        try {
            await procurementService.createWarehouse({
                ...newWarehouse,
                org_id: profile.org_id
            });
            toast.success("Warehouse created");
            setIsAddOpen(false);
            setNewWarehouse({ name: "", location: "", is_primary: false });
            loadWarehouses();
        } catch (error) {
            console.error(error);
            toast.error("Failed to create warehouse");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Warehouses</h2>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Warehouse</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Add New Warehouse</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Warehouse Name</Label>
                                    <Input value={newWarehouse.name} onChange={e => setNewWarehouse({ ...newWarehouse, name: e.target.value })} required placeholder="Main Warehouse" />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Location / Address</Label>
                                    <Input value={newWarehouse.location} onChange={e => setNewWarehouse({ ...newWarehouse, location: e.target.value })} placeholder="123 Storage Lane" />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_primary"
                                        checked={newWarehouse.is_primary}
                                        onCheckedChange={(c) => setNewWarehouse({ ...newWarehouse, is_primary: c as boolean })}
                                    />
                                    <Label htmlFor="is_primary">Set as Primary Warehouse</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Warehouse
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {warehouses.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-muted-foreground border rounded-md">
                            No warehouses found. Create one to start storing inventory.
                        </div>
                    ) : (
                        warehouses.map(wh => (
                            <div key={wh.id} className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm flex flex-col gap-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary rounded-full">
                                            <Building className="h-5 w-5 text-secondary-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{wh.name}</h3>
                                            <div className="flex items-center text-sm text-muted-foreground gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {wh.location || "No location set"}
                                            </div>
                                        </div>
                                    </div>
                                    {wh.is_primary && <Badge>Primary</Badge>}
                                </div>
                                <div className="text-sm text-muted-foreground pt-2 border-t mt-auto">
                                    Created on {new Date(wh.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
