"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context"
import { ordersService } from "@/features/orders/orders.service"
import { Product } from "@/types"
import { format } from "date-fns"

export default function MyDownloadsPage() {
    const { user } = useAuth()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchDownloads() {
            if (user) {
                try {
                    const data = await ordersService.getPurchasedProducts(user.id)
                    setProducts(data)
                } catch (error) {
                    console.error("Failed to load downloads", error)
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchDownloads()
    }, [user])

    if (loading) return <div>Loading downloads...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Downloads</h1>

            {products.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">You haven't purchased any software yet.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {products.map((item) => (
                        <Card key={item.id}>
                            <CardHeader>
                                <CardTitle>{item.name}</CardTitle>
                                <CardDescription>
                                    Version {item.version || "1.0.0"}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    {/* Mock file size since we don't store it yet */}
                                    File Size: 50 MB
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    onClick={() => item.download_url ? window.open(item.download_url, '_blank') : alert("Download not available yet.")}
                                    disabled={!item.download_url}
                                >
                                    Download
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

