import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { marketplaceService } from "../services/marketplaceService";
import type { MarketplaceOrder } from "../services/marketplaceService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function OrderListPage() {
    const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await marketplaceService.getOrders();
            setOrders(data);
        } catch (error) {
            console.error("Failed to load orders", error);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Marketplace Orders</h2>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-24">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer ID</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        No orders found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono text-xs">{order.id}</TableCell>
                                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-mono text-xs">{order.user_id}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {order.items?.map((item: any, idx: number) => (
                                                    <span key={idx} className="text-sm text-muted-foreground">
                                                        {item.product?.name || "Unknown Item"}
                                                    </span>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>${order.total_amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                                                {order.status}
                                            </Badge>
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
