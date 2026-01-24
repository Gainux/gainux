import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pdfService } from "../services/pdfService";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { salesOrderService } from "../services/salesOrderService";
import type { SalesOrder } from "../types";
import { useCurrency } from "@/hooks/useCurrency";
import { format } from "date-fns";

export default function SalesOrderListPage() {
    const navigate = useNavigate();
    const { formatAmount } = useCurrency();
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await salesOrderService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusVariant = (status: SalesOrder['status']) => {
        switch (status) {
            case 'confirmed': return 'default'; // dark/primary
            case 'delivered': return 'secondary'; // green-ish usually
            case 'cancelled': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Sales Orders</h2>
                    <p className="text-muted-foreground">Manage customer orders and fulfillment.</p>
                </div>
                <Button onClick={() => navigate("/crm/orders/new")}>
                    <Plus className="mr-2 h-4 w-4" /> Create Order
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search orders..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order #</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                </TableRow>
                            ) : filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No orders found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/crm/orders/${order.id}`)}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            {order.orderNumber}
                                        </TableCell>
                                        <TableCell>{order.company?.name || 'Grand Unknown'}</TableCell>
                                        <TableCell>{format(new Date(order.orderDate), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(order.status)}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {formatAmount(order.totalAmount)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        pdfService.generateSalesOrderPDF(order);
                                                    }}
                                                    title="Download PDF"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm">View</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
