import { supabase } from "@/lib/supabase";

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    version: string;
    download_url?: string;
    created_at: string;
    image_url?: string;
}

export interface MarketplaceOrder {
    id: string;
    user_id: string;
    total_amount: number;
    status: string;
    created_at: string;
    items?: MarketplaceOrderItem[];
}

export interface MarketplaceOrderItem {
    id: string;
    product_id: string;
    price: number;
    product?: Product;
}

export const marketplaceService = {
    async getProducts(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async getProduct(id: string): Promise<Product | null> {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    async createProduct(product: Partial<Product>): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .insert(product)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .update(product)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteProduct(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getOrders(): Promise<MarketplaceOrder[]> {
        const { data, error } = await supabase
            .from('marketplace_orders')
            .select(`
                *,
                items:marketplace_order_items (
                    *,
                    product:products (name)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }
};
