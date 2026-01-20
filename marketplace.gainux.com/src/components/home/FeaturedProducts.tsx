import { ProductCard } from "@/features/products/components/ProductCard"
import { Product } from "@/types"
import { productsService } from "@/features/products/products.service"

// Mock data for initial display if DB is empty
const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Gainux CRM Pro",
        slug: "gainux-crm-pro",
        description: "A comprehensive Customer Relationship Management system designed for high-growth teams. Manage leads, deals, and contacts efficiently.",
        short_description: "Manage leads, deals, and contacts efficiently.",
        price: 49.00,
        currency: "USD",
        version: "2.0.0",
        category_id: "biz-tools",
        features: ["Lead Management", "Email Integration", "Analytics Dashboard"],
        category: { id: "biz-tools", name: "Business Tools", slug: "business-tools", created_at: "" },
        images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"], // Placeholder
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Inventory Master",
        slug: "inventory-master",
        description: "Track stock across multiple warehouses with real-time updates and automated reorder alerts.",
        short_description: "Real-time multi-warehouse inventory tracking.",
        price: 29.00,
        currency: "USD",
        version: "1.5.0",
        category_id: "logistics",
        features: ["Multi-warehouse", "Barcode Scanning", "Reporting"],
        category: { id: "logistics", name: "Logistics", slug: "logistics", created_at: "" },
        images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    {
        id: "3",
        name: "TaskFlow Ultimate",
        slug: "taskflow-ultimate",
        description: "Boost team collaboration with this intuitive project management tool. Kanban boards, Gantt charts, and time tracking included.",
        short_description: "Intuitive project management and collaboration.",
        price: 19.00,
        currency: "USD",
        version: "3.1.0",
        category_id: "productivity",
        features: ["Kanban", "Time Tracking", "Team Chat"],
        category: { id: "productivity", name: "Productivity", slug: "productivity", created_at: "" },
        images: ["https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }
]

export async function FeaturedProducts() {
    // Try fetching from DB, fallback to mock if empty
    let products = await productsService.getProducts();

    if (!products || products.length === 0) {
        products = MOCK_PRODUCTS;
    }

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Featured Software</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500">
                        Explore our handpicked selection of powerful tools to drive your business forward.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}
