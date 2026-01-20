"use client"

import { useCartStore } from "@/features/cart/store"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"

export function CartSheet() {
    const { items, removeItem, totalPrice } = useCartStore()
    const [mounted, setMounted] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    // Hydration fix for zustand persist
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Shopping Cart ({items.length})</SheetTitle>
                </SheetHeader>

                {items.length > 0 ? (
                    <>
                        <ScrollArea className="flex-1 -mx-6 px-6">
                            <div className="space-y-6 py-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="h-20 w-20 rounded-md border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                            {item.images && item.images.length > 0 ? (
                                                <img
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No Img</span>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div className="flex justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold">{item.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{item.category?.name}</p>
                                                </div>
                                                <p className="font-semibold">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || 'USD' }).format(item.price)}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm">Qty: {item.quantity}</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive h-auto p-0 hover:bg-transparent"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="space-y-4 pt-6">
                            <Separator />
                            <div className="flex items-center justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalPrice())}</span>
                            </div>
                            <Button className="w-full" size="lg" asChild onClick={() => setIsOpen(false)}>
                                <Link href="/checkout">Proceed to Checkout</Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold">Your cart is empty</h3>
                            <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
                        </div>
                        <Button asChild variant="outline" onClick={() => setIsOpen(false)}>
                            <Link href="/products">Browse Software</Link>
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
