import { supabase } from "@/lib/supabase";
import type { SalesOrder } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToOrder = (data: any): SalesOrder => ({
    id: data.id,
    orgId: data.org_id,
    orderNumber: data.order_number,
    quoteId: data.quote_id,
    dealId: data.deal_id,
    companyId: data.company_id,
    company: data.companies ? {
        id: data.companies.id,
        orgId: data.org_id,
        name: data.companies.name,
        createdAt: '', updatedAt: ''
    } : undefined,
    status: data.status,
    totalAmount: data.total_amount,
    currency: data.currency,
    orderDate: data.order_date,
    deliveryDate: data.delivery_date,
    billingAddress: data.billing_address,
    shippingAddress: data.shipping_address,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    items: data.items ? data.items.map((i: any) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unit_price),
        total: Number(i.total)
    })) : [],
    createdAt: data.created_at,
    updatedAt: data.updated_at
});

export const salesOrderService = {
    getOrders: async (): Promise<SalesOrder[]> => {
        const { data, error } = await supabase
            .from('sales_orders')
            .select(`
                *,
                companies (id, name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapToOrder);
    },

    getOrderById: async (id: string): Promise<SalesOrder | undefined> => {
        const { data, error } = await supabase
            .from('sales_orders')
            .select(`
                *,
                companies (id, name),
                items:sales_order_items (*)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToOrder(data);
    },

    createOrder: async (order: Omit<SalesOrder, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<SalesOrder> => {
        const { data: profile } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase.from('profiles').select('org_id').eq('id', profile.user?.id).single();

        const orderNumber = `SO-${Date.now()}`; // Simple generation

        // 1. Create Order Header
        const { data: orderData, error: orderError } = await supabase
            .from('sales_orders')
            .insert({
                org_id: userProfile?.org_id,
                order_number: orderNumber,
                company_id: order.companyId,
                status: order.status,
                total_amount: order.totalAmount,
                currency: order.currency,
                order_date: order.orderDate,
                delivery_date: order.deliveryDate,
                quote_id: order.quoteId
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Items
        if (order.items.length > 0) {
            const { error: itemsError } = await supabase
                .from('sales_order_items')
                .insert(order.items.map(item => ({
                    order_id: orderData.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unitPrice
                })));

            if (itemsError) throw itemsError;
        }

        return mapToOrder({ ...orderData, items: order.items, companies: order.company });
    },

    updateOrder: async (id: string, updates: Partial<SalesOrder>): Promise<SalesOrder> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.deliveryDate) dbUpdates.delivery_date = updates.deliveryDate;

        const { data, error } = await supabase
            .from('sales_orders')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToOrder(data);
    }
};
