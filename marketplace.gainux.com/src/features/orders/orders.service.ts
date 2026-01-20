import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

export interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    price: number;
    product?: Product; // Joined product details
}

export const ordersService = {
    async getUserOrders(userId: string): Promise<Order[]> {
        const { data, error } = await supabase
            .from('marketplace_orders')
            .select(`
                *,
                items:marketplace_order_items (
                    *,
                    product:products (*)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }

        return data || [];
    },

    async getPurchasedProducts(userId: string): Promise<Product[]> {
        // Fetch all successful orders and valid products
        const { data, error } = await supabase
            .from('marketplace_orders')
            .select(`
                items:marketplace_order_items (
                    product:products (*)
                )
            `)
            .eq('user_id', userId)
            .eq('status', 'completed'); // Only show downloads for completed orders

        if (error) {
            console.error('Error fetching downloads:', error);
            return [];
        }

        // Flatten the structure: orders -> items -> product
        const products: Product[] = [];
        data?.forEach((order: any) => {
            order.items?.forEach((item: any) => {
                if (item.product) {
                    // Check for duplicates if needed, or allow multiple purchases
                    products.push(item.product as Product);
                }
            });
        });

        // Dedup by ID if you only want unique downloads
        const uniqueProducts = Array.from(new Map(products.map(p => [p.id, p])).values());

        return uniqueProducts;
    },

    async getStats(userId: string) {
        const orders = await this.getUserOrders(userId);
        const products = await this.getPurchasedProducts(userId);

        return {
            totalOrders: orders.length,
            activeDownloads: products.length
        };
    }
}
