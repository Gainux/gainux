import { supabase } from "@/lib/supabase";
import type { InventoryItem, Warehouse, InventoryStock, PurchaseOrder, PurchaseOrderItem, RFQ, RFQItem } from "../types";

export const procurementService = {
    // --- Inventory Items ---
    async getInventoryItems(orgId: string) {
        const { data, error } = await supabase
            .from("inventory_items")
            .select("*")
            .eq("org_id", orgId)
            .order("name");
        if (error) throw error;
        return data as InventoryItem[];
    },

    async createInventoryItem(item: Partial<InventoryItem>) {
        const { data, error } = await supabase
            .from("inventory_items")
            .insert([item])
            .select()
            .single();
        if (error) throw error;
        return data as InventoryItem;
    },

    async updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
        const { data, error } = await supabase
            .from("inventory_items")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as InventoryItem;
    },

    async deleteInventoryItem(id: string) {
        const { error } = await supabase.from("inventory_items").delete().eq("id", id);
        if (error) throw error;
    },

    // --- Warehouses ---
    async getWarehouses(orgId: string) {
        const { data, error } = await supabase
            .from("warehouses")
            .select("*")
            .eq("org_id", orgId)
            .order("is_primary", { ascending: false }); // Primary first
        if (error) throw error;
        return data as Warehouse[];
    },

    async createWarehouse(wh: Partial<Warehouse>) {
        const { data, error } = await supabase.from("warehouses").insert([wh]).select().single();
        if (error) throw error;
        return data as Warehouse;
    },

    // --- Stock ---
    async getStockLevels(orgId: string) {
        const { data, error } = await supabase
            .from("inventory_stock")
            .select(`
                *,
                item:inventory_items(name, sku, unit),
                warehouse:warehouses(name)
            `)
            .eq("org_id", orgId);
        if (error) throw error;
        return data as InventoryStock[];
    },

    async updateStock(itemId: string, warehouseId: string, quantityChange: number, orgId: string) {
        // 1. Check if stock record exists
        const { data: currentStock, error: fetchError } = await supabase
            .from("inventory_stock")
            .select("*")
            .eq("item_id", itemId)
            .eq("warehouse_id", warehouseId)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (currentStock) {
            // 2. Update existing
            const newQuantity = (Number(currentStock.quantity_on_hand) || 0) + quantityChange;
            const { data, error } = await supabase
                .from("inventory_stock")
                .update({
                    quantity_on_hand: newQuantity,
                    updated_at: new Date().toISOString()
                })
                .eq("id", currentStock.id)
                .select()
                .single();

            if (error) throw error;
            return data as InventoryStock;
        } else {
            // 3. Insert new
            const { data, error } = await supabase
                .from("inventory_stock")
                .insert([{
                    org_id: orgId,
                    item_id: itemId,
                    warehouse_id: warehouseId,
                    quantity_on_hand: quantityChange
                }])
                .select()
                .single();

            if (error) throw error;
            return data as InventoryStock;
        }
    },

    // --- Purchase Orders ---
    async getPurchaseOrders(orgId: string) {
        const { data, error } = await supabase
            .from("purchase_orders")
            .select(`
                *,
                vendor:vendors(name)
            `)
            .eq("org_id", orgId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data as PurchaseOrder[];
    },

    async getPurchaseOrder(id: string) {
        const { data, error } = await supabase
            .from("purchase_orders")
            .select(`
                *,
                vendor:vendors(*),
                items:purchase_order_items(
                    *,
                    item:inventory_items(*)
                )
            `)
            .eq("id", id)
            .single();
        if (error) throw error;
        return data as PurchaseOrder;
    },

    async createPurchaseOrder(po: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) {
        // 1. Create PO Header
        const { data: poData, error: poError } = await supabase
            .from("purchase_orders")
            .insert([po])
            .select()
            .single();

        if (poError) throw poError;

        // 2. Create PO Items
        if (items.length > 0) {
            const itemsWithPoId = items.map(item => ({
                po_id: poData.id,
                item_id: item.item_id,
                quantity: item.quantity,
                unit_price: item.unit_price
            }));

            const { error: itemsError } = await supabase
                .from("purchase_order_items")
                .insert(itemsWithPoId);

            if (itemsError) throw itemsError;
        }

        return poData as PurchaseOrder;
    },

    async updatePurchaseOrderStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from("purchase_orders")
            .update({ status })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as PurchaseOrder;
    },

    // --- RFQs ---
    async getRFQs(orgId: string) {
        const { data, error } = await supabase
            .from("rfqs")
            .select("*")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data as RFQ[];
    },

    async getRFQ(id: string) {
        const { data, error } = await supabase
            .from("rfqs")
            .select(`
                *,
                items:rfq_items(
                    *,
                    item:inventory_items(*)
                )
            `)
            .eq("id", id)
            .single();
        if (error) throw error;
        return data as RFQ;
    },

    async createRFQ(rfq: Partial<RFQ>, items: Partial<RFQItem>[]) {
        // 1. Create RFQ Header
        const { data: rfqData, error: rfqError } = await supabase
            .from("rfqs")
            .insert([rfq])
            .select()
            .single();

        if (rfqError) throw rfqError;

        // 2. Create RFQ Items
        if (items.length > 0) {
            const itemsWithRfqId = items.map(item => ({
                rfq_id: rfqData.id,
                item_id: item.item_id,
                quantity: item.quantity,
                notes: item.notes
            }));

            const { error: itemsError } = await supabase
                .from("rfq_items")
                .insert(itemsWithRfqId);

            if (itemsError) throw itemsError;
        }

        return rfqData as RFQ;
    },

    async updateRFQStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from("rfqs")
            .update({ status })
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as RFQ;
    }
};
