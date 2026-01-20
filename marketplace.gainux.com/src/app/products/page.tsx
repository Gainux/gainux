import { ProductCard } from "@/features/products/components/ProductCard"
import { ProductFilters } from "@/features/products/components/ProductFilters"
import { ProductSearch } from "@/features/products/components/ProductSearch"
import { productsService } from "@/features/products/products.service"

export const revalidate = 0; // Ensure dynamic data fetching

export default async function ProductsPage() {
    const products = await productsService.getProducts();
    const categories = await productsService.getCategories();

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">All Software</h1>
                    <p className="mt-2 text-sm text-gray-600">Browse our extensive collection of premium tools</p>
                </div>
                <ProductSearch />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar */}
                <div className="hidden lg:block lg:col-span-1">
                    <ProductFilters categories={categories} />
                </div>

                {/* Product Grid */}
                <main className="lg:col-span-3">
                    {products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-lg text-gray-500">No products found.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
