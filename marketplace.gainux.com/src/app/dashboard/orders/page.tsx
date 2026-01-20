"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context"
import { ordersService, Order } from "@/features/orders/orders.service"
import { format } from "date-fns"

export default function MyOrdersPage() {
    const { user } = useAuth()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchOrders() {
            if (user) {
                try {
                    const data = await ordersService.getUserOrders(user.id)
                    setOrders(data)
                } catch (error) {
                    console.error("Failed to load orders", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchOrders()
    }, [user])

    if (loading) return <div>Loading orders...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium text-xs font-mono">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {order.items?.map((item, idx) => (
                                                <span key={idx} className="text-sm">
                                                    {item.product?.name || "Unknown Product"}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total_amount)}</TableCell>
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
        </div>
    )
}

