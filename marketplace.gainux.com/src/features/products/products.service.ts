import { supabase } from "@/lib/supabase";
import { Product, Category } from "@/types";

// Keep Mock for fallback
const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Gainux CRM Pro",
        slug: "gainux-crm-pro",
        description: "A comprehensive Customer Relationship Management system designed for high-growth teams. Manage leads, deals, and contacts efficiently with our intuitive interface and powerful automation tools.",
        short_description: "Manage leads, deals, and contacts efficiently.",
        price: 49.00,
        currency: "USD",
        version: "2.0.0",
        category_id: "biz-tools",
        features: ["Lead Management", "Email Integration", "Analytics Dashboard", "Automated Workflows"],
        category: { id: "biz-tools", name: "Business Tools", slug: "business-tools", created_at: "" },
        images: ["https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    // ... (rest of mock data hidden for brevity, can keep if needed)
];

// Helper to map DB result to Product type
const mapDbProductToProduct = (dbProduct: any): Product => {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description,
        short_description: dbProduct.description.substring(0, 100) + "...", // generate if missing
        price: dbProduct.price,
        currency: "USD",
        version: dbProduct.version,
        category_id: dbProduct.category, // using category name as ID for now or map it
        features: dbProduct.features || [],
        // Construct detailed category object
        category: {
            id: dbProduct.category,
            name: dbProduct.category,
            slug: dbProduct.category.toLowerCase().replace(/\s+/g, '-'),
            created_at: ""
        },
        images: dbProduct.image_url ? [dbProduct.image_url] : [],
        created_at: dbProduct.created_at,
        updated_at: dbProduct.created_at,
        download_url: dbProduct.download_url,
    };
};

export const productsService = {
    async getProducts(): Promise<Product[]> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) {
                console.error('Error fetching products:', error);
                // Fallback to mock if table is empty or doesn't exist yet
                return MOCK_PRODUCTS;
            }

            if (!data || data.length === 0) {
                return MOCK_PRODUCTS;
            }

            return data.map(mapDbProductToProduct);
        } catch (e) {
            console.error('Exception in getProducts:', e);
            return MOCK_PRODUCTS;
        }
    },

    async getProductBySlug(slug: string): Promise<Product | null> {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('slug', slug)
                .single();

            if (error) {
                return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
            }

            if (!data) return null;

            return mapDbProductToProduct(data);
        } catch (e) {
            return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
        }
    },

    async getCategories(): Promise<Category[]> {
        // Since we don't have a separate categories table in the new schema,
        // we can distinct select from products or just return mock categories for now.
        // For robustness, let's extract them from the products we fetch.
        const products = await this.getProducts();
        const uniqueCategories = new Map<string, Category>();

        products.forEach(p => {
            if (p.category) {
                uniqueCategories.set(p.category.id, p.category);
            }
        });

        return Array.from(uniqueCategories.values());
    }
}
