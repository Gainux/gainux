import { notFound } from "next/navigation"
import { productsService } from "@/features/products/products.service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export const revalidate = 0;

interface ProductPageProps {
    params: Promise<{
        slug: string
    }>
}

export async function generateMetadata({ params }: ProductPageProps) {
    const { slug } = await params
    const product = await productsService.getProductBySlug(slug)

    if (!product) {
        return {
            title: 'Product Not Found | Gainux Marketplace',
        }
    }

    return {
        title: `${product.name} | Gainux Marketplace`,
        description: product.short_description || product.description,
    }
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params
    const product = await productsService.getProductBySlug(slug)

    if (!product) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Breadcrumb Placeholder */}
            <div className="mb-6 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-primary">Home</Link> / <Link href="/products" className="hover:text-primary">Products</Link> / <span className="text-foreground">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Left Column: Images */}
                <div className="space-y-4">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-muted-foreground">No Image Available</span>
                        )}
                    </div>
                    {/* Thumbnail Gallery Implementation Pending */}
                    <div className="grid grid-cols-4 gap-4">
                        {product.images?.map((img, i) => (
                            <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-primary">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Info */}
                <div className="space-y-6">
                    <div>
                        {product.category && <Badge className="mb-2">{product.category.name}</Badge>}
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{product.name}</h1>
                        <p className="text-lg text-muted-foreground mt-2">{product.short_description}</p>
                    </div>

                    <div className="text-3xl font-bold text-gray-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency || 'USD' }).format(product.price)}
                    </div>

                    <div className="flex gap-4">
                        <Button size="lg" className="w-full md:w-auto">Add to Cart</Button>
                        <Button size="lg" variant="outline" className="w-full md:w-auto">Live Demo</Button>
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">Version:</span>
                            <span>{product.version}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">Released:</span>
                            <span>{new Date(product.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold w-24">License:</span>
                            <span>Commercial / Single Site</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="features" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-auto">
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="description">Description</TabsTrigger>
                    <TabsTrigger value="requirements">System Requirements</TabsTrigger>
                </TabsList>
                <TabsContent value="features" className="mt-6 border rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {product.features?.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </TabsContent>
                <TabsContent value="description" className="mt-6 border rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Detailed Description</h3>
                    <p className="leading-relaxed text-gray-600">
                        {product.description}
                    </p>
                </TabsContent>
                <TabsContent value="requirements" className="mt-6 border rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">System Requirements</h3>
                    <p className="text-gray-500 italic">Requirements not specified for this product.</p>
                </TabsContent>
            </Tabs>

            {/* Related Products Section */}
            <section className="mt-24">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight">You might also like</h2>
                    <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
                        View All
                    </Link>
                </div>
                {/* Using MOCK_PRODUCTS via service for Related Products (skipping self) */}
                <RelatedProductsList currentSlug={product.slug} />
            </section>
        </div>
    )
}

async function RelatedProductsList({ currentSlug }: { currentSlug: string }) {
    const allProducts = await productsService.getProducts();
    const related = allProducts.filter(p => p.slug !== currentSlug).slice(0, 3);

    if (related.length === 0) return null;

    // We can reuse ProductCard here
    const { ProductCard } = await import("@/features/products/components/ProductCard");

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map(p => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    )
}
