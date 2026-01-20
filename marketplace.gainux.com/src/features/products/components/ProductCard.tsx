"use client" // Make component client-side for interactivity

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Product } from "@/types"
import { Badge } from "@/components/ui/badge"
import { useCartStore } from "@/features/cart/store"
import { toast } from "sonner" // Assuming sonner is installed or we use simple alert for now

interface ProductCardProps {
    product: Product
}

export function ProductCard({ product }: ProductCardProps) {
    const addItem = useCartStore((state) => state.addItem)

    const handleAddToCart = () => {
        addItem(product)
        toast.success(`${product.name} added to cart!`)
    }

    return (
        <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
            <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
                {/* Placeholder for product image if not available or loop through images */}
                {product.images && product.images.length > 0 ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <span className="text-muted-foreground">No Image</span>
                )}
                {product.category && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                        {product.category.name}
                    </Badge>
                )}
            </div>
            <CardHeader>
                <CardTitle className="line-clamp-1">
                    <Link href={`/products/${product.slug}`} className="hover:underline">
                        {product.name}
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.short_description || product.description}
                </p>
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-lg font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price)}
                    </span>
                </div>
            </CardContent>
            <CardFooter className="gap-2">
                <Button className="w-full" onClick={handleAddToCart}>Add to Cart</Button>
            </CardFooter>
        </Card>
    )
}
