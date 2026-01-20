"use client"

import { useAuth } from "@/features/auth/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Download } from "lucide-react"
import { useEffect, useState } from "react"
import { ordersService } from "@/features/orders/orders.service"

export default function DashboardPage() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ totalOrders: 0, activeDownloads: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadStats() {
            if (user) {
                try {
                    const data = await ordersService.getStats(user.id)
                    setStats(data)
                } catch (error) {
                    console.error("Failed to load dashboard stats", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        loadStats()
    }, [user])

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">
                Here's what's happening with your account today.
            </p>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.totalOrders}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime orders
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Downloads</CardTitle>
                        <Download className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.activeDownloads}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Available for download
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

