import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Building2, Phone, Mail, MapPin } from "lucide-react";
import { vendorService } from "../services/vendorService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { Vendor } from "../types";

export function VendorList() {
    const { profile } = useAuth();
    const orgId = profile?.org_id;

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Create Vendor State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newVendor, setNewVendor] = useState<Partial<Vendor>>({
        name: "",
        email: "",
        phone: "",
        tax_id: "",
        address: {},
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (orgId) {
            fetchVendors();
        }
    }, [orgId]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const data = await vendorService.getVendors(orgId!);
            setVendors(data);
        } catch (error) {
            console.error("Failed to fetch vendors:", error);
            toast.error("Failed to load vendors");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateVendor = async () => {
        if (!orgId) return;
        if (!newVendor.name) {
            toast.error("Vendor name is required");
            return;
        }

        try {
            setIsSubmitting(true);
            await vendorService.createVendor({
                ...newVendor,
                org_id: orgId
            });
            toast.success("Vendor created successfully");
            setIsCreateOpen(false);
            setNewVendor({ name: "", email: "", phone: "", tax_id: "", address: {} });
            fetchVendors();
        } catch (error: any) {
            console.error("Failed to create vendor:", error);
            toast.error("Failed to create vendor: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search vendors..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Vendor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Vendor</DialogTitle>
                            <DialogDescription>
                                Add a supplier or service provider to your records.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name *
                                </Label>
                                <Input
                                    id="name"
                                    value={newVendor.name}
                                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="Business Name"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newVendor.email}
                                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                    className="col-span-3"
                                    placeholder="contact@vendor.com"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    value={newVendor.phone}
                                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                    className="col-span-3"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="taxId" className="text-right">
                                    Tax ID
                                </Label>
                                <Input
                                    id="taxId"
                                    value={newVendor.tax_id}
                                    onChange={(e) => setNewVendor({ ...newVendor, tax_id: e.target.value })}
                                    className="col-span-3"
                                    placeholder="GSTIN / VAT / EIN"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateVendor} disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create Vendor"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Tax ID</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Loading vendors...
                                </TableCell>
                            </TableRow>
                        ) : filteredVendors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No vendors found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVendors.map((vendor) => (
                                <TableRow key={vendor.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-muted-foreground" />
                                            {vendor.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            {vendor.email && (
                                                <span className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" /> {vendor.email}
                                                </span>
                                            )}
                                            {vendor.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" /> {vendor.phone}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{vendor.tax_id || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                            Active
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

export default VendorList;
