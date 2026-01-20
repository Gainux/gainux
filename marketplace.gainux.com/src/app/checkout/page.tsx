"use client"

import { useCartStore } from "@/features/cart/store"
import { useAuth } from "@/features/auth/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCartStore()
    const { user } = useAuth()
    const router = useRouter()
    const [isProcessing, setIsProcessing] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center space-y-4">
                <h1 className="text-3xl font-bold">Your cart is empty</h1>
                <p className="text-muted-foreground">Add some software to your cart to proceed.</p>
                <Button asChild>
                    <Link href="/products">Browse Software</Link>
                </Button>
            </div>
        )
    }

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error("Please sign in to complete your purchase")
            router.push("/auth/login?redirect=/checkout")
            return
        }

        setIsProcessing(true)

        try {
            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('marketplace_orders')
                .insert({
                    user_id: user.id,
                    total_amount: totalPrice(),
                    status: 'completed', // Assuming immediate success for mock payment
                    payment_intent_id: 'mock_payment_id_' + Date.now()
                })
                .select()
                .single();

            if (orderError) {
                console.error('Order creation failed:', orderError);
                throw new Error('Failed to create order');
            }

            // 2. Create Order Items
            // Note: We need valid UUIDs for product_id. If items are from old mock data (ids "1", "2"), this might fail foreign key constraints 
            // if the DB uses UUIDs. However, we'll try to insert. If product_id is not found, it might error.
            // Ideally we should validate items against DB first.
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('marketplace_order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('Order items creation failed:', itemsError);
                // Ideally rollback order here, but for now just throw
                throw new Error('Failed to create order items');
            }

            // Simulate payment processing delay if needed for UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            clearCart()
            router.push("/checkout/success")
            toast.success("Order placed successfully!")

        } catch (error: any) {
            console.error("Checkout error:", error)
            toast.error(error.message || "Something went wrong during checkout. Please try again.")
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Billing */}
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Information</CardTitle>
                            <CardDescription>Enter your details to completes the transaction.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">First name</Label>
                                        <Input id="firstName" placeholder="John" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Last name</Label>
                                        <Input id="lastName" placeholder="Doe" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="john@example.com" defaultValue={user?.email || ""} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="card">Card Details (Mock)</Label>
                                    <Input id="card" placeholder="0000 0000 0000 0000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="expiry">Expiry</Label>
                                        <Input id="expiry" placeholder="MM/YY" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cvc">CVC</Label>
                                        <Input id="cvc" placeholder="123" />
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Order Summary */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span>{item.name} x {item.quantity}</span>
                                    <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || 'USD' }).format(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPrice())}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" form="checkout-form" className="w-full" size="lg" disabled={isProcessing}>
                                {isProcessing ? "Processing..." : `Pay ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPrice())}`}
                            </Button>
                        </CardFooter>
                    </Card>

                    <p className="text-xs text-center text-muted-foreground">
                        By clicking Pay, you agree to our Terms of Service and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
