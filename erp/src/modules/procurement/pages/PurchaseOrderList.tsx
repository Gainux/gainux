
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FileText, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { procurementService } from "../services/procurementService";
import type { PurchaseOrder } from "../types";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function PurchaseOrderList() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile?.org_id) loadOrders();
    }, [profile?.org_id]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await procurementService.getPurchaseOrders(profile?.org_id || '');
            setOrders(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load purchase orders");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft': return <Badge variant="secondary">Draft</Badge>;
            case 'sent': return <Badge className="bg-blue-500">Sent</Badge>;
            case 'partial': return <Badge className="bg-yellow-500">Partial</Badge>;
            case 'received': return <Badge className="bg-green-500">Received</Badge>;
            case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Orders</h2>
                <Button onClick={() => navigate("/procurement/purchase-orders/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Create PO
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>PO Number</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total Amount</TableHead>
                                <TableHead className="text-right">Expected Delivery</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No purchase orders found</TableCell>
                                </TableRow>
                            ) : (
                                orders.map(po => (
                                    <TableRow key={po.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/procurement/purchase-orders/${po.id}`)}>
                                        <TableCell className="font-mono font-medium">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                {po.order_number}
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(po.order_date), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell>{po.vendor?.name || 'Unknown Vendor'}</TableCell>
                                        <TableCell>{getStatusBadge(po.status)}</TableCell>
                                        <TableCell className="text-right font-medium">${po.total_amount.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">
                                            {po.expected_delivery_date ? format(new Date(po.expected_delivery_date), 'MMM dd, yyyy') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm"><ChevronRight className="h-4 w-4" /></Button>
                                        </TableCell>
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
