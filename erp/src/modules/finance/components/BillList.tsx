import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, ArrowRight } from "lucide-react";
import { billService } from "../services/billService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Bill } from "../types";

export function BillList() {
    const { profile } = useAuth();
    const orgId = profile?.org_id;
    const navigate = useNavigate();

    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (orgId) {
            fetchBills();
        }
    }, [orgId]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const data = await billService.getBills(orgId!);
            setBills(data);
        } catch (error) {
            console.error("Failed to fetch bills:", error);
            toast.error("Failed to load bills");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (!confirm("Are you sure you want to delete this bill?")) return;

        try {
            await billService.deleteBill(id);
            toast.success("Bill deleted");
            fetchBills();
        } catch (error: any) {
            toast.error("Failed to delete bill");
        }
    };

    const handleStatusUpdate = async (id: string, status: Bill['status'], e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await billService.updateBillStatus(id, status, orgId!);
            toast.success(`Bill marked as ${status}`);
            fetchBills();
        } catch (error: any) {
            toast.error("Failed to update status");
        }
    };

    const filteredBills = bills.filter(bill =>
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'default'; // dark/primary
            case 'open': return 'secondary'; // gray
            case 'overdue': return 'destructive'; // red
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 w-full md:max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search bills..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button onClick={() => navigate("/finance/payables/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bill
                </Button>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Bill #</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Issue Date</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Loading bills...
                                </TableCell>
                            </TableRow>
                        ) : filteredBills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No bills found. Create a new bill to track expenses.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBills.map((bill) => (
                                <TableRow key={bill.id} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-mono">
                                        {bill.billNumber}
                                        {bill.vendorInvoiceNumber && (
                                            <div className="text-xs text-muted-foreground">
                                                Ref: {bill.vendorInvoiceNumber}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{bill.vendor_id || '-'}</TableCell>
                                    <TableCell>{format(new Date(bill.issueDate), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {bill.total.toLocaleString('en-IN', { style: 'currency', currency: bill.currency || 'INR' })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(bill.status)} className="capitalize">
                                            {bill.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {bill.status === 'draft' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 text-xs"
                                                    onClick={(e) => handleStatusUpdate(bill.id, 'open', e)}
                                                >
                                                    Post <ArrowRight className="h-3 w-3 ml-1" />
                                                </Button>
                                            )}
                                            {bill.status === 'open' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-2 text-xs bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                                                    onClick={(e) => handleStatusUpdate(bill.id, 'paid', e)}
                                                >
                                                    Mark Paid
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDelete(bill.id, e)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
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

export default BillList;
