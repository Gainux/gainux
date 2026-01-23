
export interface Vendor {
    id: string;
    org_id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: any;
    tax_id?: string;
    website?: string;
    created_at: string;
    updated_at: string;
}

export interface InventoryItem {
    id: string;
    org_id: string;
    name: string;
    sku?: string;
    description?: string;
    category?: string;
    unit: string;
    cost_price: number;
    selling_price: number;
    reorder_level: number;
    created_at: string;
    updated_at: string;
}

export interface Warehouse {
    id: string;
    org_id: string;
    name: string;
    location?: string;
    is_primary: boolean;
    created_at: string;
}

export interface InventoryStock {
    id: string;
    org_id: string;
    item_id: string;
    warehouse_id: string;
    quantity_on_hand: number;
    quantity_reserved: number;
    updated_at: string;
    item?: InventoryItem;
    warehouse?: Warehouse;
}

export interface PurchaseOrder {
    id: string;
    org_id: string;
    vendor_id?: string;
    vendor?: Vendor;
    order_number: string;
    status: 'draft' | 'sent' | 'partial' | 'received' | 'cancelled';
    order_date: string;
    expected_delivery_date?: string;
    total_amount: number;
    notes?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
    items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
    id: string;
    po_id: string;
    item_id: string;
    item?: InventoryItem;
    quantity: number;
    unit_price: number;
    total_price: number;
    received_quantity: number;
}

export interface RFQ {
    id: string;
    org_id: string;
    rfq_number: string;
    title?: string;
    status: 'draft' | 'open' | 'closed' | 'awarded';
    deadline?: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
    items?: RFQItem[];
}

export interface RFQItem {
    id: string;
    rfq_id: string;
    item_id: string;
    item?: InventoryItem;
    quantity: number;
    notes?: string;
}
