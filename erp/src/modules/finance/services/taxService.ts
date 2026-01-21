import { supabase } from "@/lib/supabase";
import type { TaxRate } from "../types";

export const taxService = {
    async getTaxRates(orgId: string) {
        const { data, error } = await supabase
            .from("tax_rates")
            .select("*")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data.map(mapDbToTaxRate);
    },

    async getTaxRateById(id: string) {
        const { data, error } = await supabase
            .from("tax_rates")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return mapDbToTaxRate(data);
    },

    async createTaxRate(taxRate: Partial<TaxRate>) {
        const dbData = mapTaxRateToDb(taxRate);
        const { data, error } = await supabase
            .from("tax_rates")
            .insert([dbData])
            .select()
            .single();

        if (error) throw error;

        return mapDbToTaxRate(data);
    },

    async updateTaxRate(id: string, taxRate: Partial<TaxRate>) {
        const dbData = mapTaxRateToDb(taxRate);
        const { data, error } = await supabase
            .from("tax_rates")
            .update(dbData)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return mapDbToTaxRate(data);
    },

    async deleteTaxRate(id: string) {
        const { error } = await supabase
            .from("tax_rates")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },

    async getTaxReport(orgId: string, startDate?: string, endDate?: string) {
        // 1. Get Tax Collected (from Invoices - Sales)
        let salesQuery = supabase
            .from("invoices")
            .select("subtotal, tax_amount, total")
            .eq("org_id", orgId)
            .neq("status", "draft")
            .neq("status", "cancelled");

        if (startDate) salesQuery = salesQuery.gte("issue_date", startDate);
        if (endDate) salesQuery = salesQuery.lte("issue_date", endDate);

        const { data: sales, error: salesError } = await salesQuery;
        if (salesError) throw salesError;

        // 2. Get Tax Paid (from Bills - Purchases)
        let purchaseQuery = supabase
            .from("bills")
            .select("subtotal, tax_amount, total_amount")
            .eq("org_id", orgId)
            .neq("status", "draft")
            .neq("status", "void");

        if (startDate) purchaseQuery = purchaseQuery.gte("issue_date", startDate);
        if (endDate) purchaseQuery = purchaseQuery.lte("issue_date", endDate);

        const { data: purchases, error: purchaseError } = await purchaseQuery;
        if (purchaseError) throw purchaseError;

        // 3. Aggregate
        const totalSales = sales.reduce((sum, inv) => sum + (inv.subtotal || 0), 0);
        const totalTaxCollected = sales.reduce((sum, inv) => sum + (inv.tax_amount || 0), 0);

        const totalPurchases = purchases.reduce((sum, bill) => sum + (bill.subtotal || 0), 0);
        const totalTaxPaid = purchases.reduce((sum, bill) => sum + (bill.tax_amount || 0), 0);

        return {
            totalSales,
            totalTaxCollected,
            totalPurchases,
            totalTaxPaid,
            netTaxPayable: totalTaxCollected - totalTaxPaid
        };
    }
};

const mapDbToTaxRate = (data: any): TaxRate => ({
    id: data.id,
    org_id: data.org_id,
    name: data.name,
    code: data.code,
    rate: Number(data.rate),
    type: data.type,
    description: data.description,
    glAccountId: data.gl_account_id,
    isActive: data.is_active,
    created_at: data.created_at,
    updated_at: data.updated_at
});

const mapTaxRateToDb = (data: Partial<TaxRate>): any => {
    const dbData: any = {};
    if (data.org_id !== undefined) dbData.org_id = data.org_id;
    if (data.name !== undefined) dbData.name = data.name;
    if (data.code !== undefined) dbData.code = data.code;
    if (data.rate !== undefined) dbData.rate = data.rate;
    if (data.type !== undefined) dbData.type = data.type;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.glAccountId !== undefined) dbData.gl_account_id = data.glAccountId;
    if (data.isActive !== undefined) dbData.is_active = data.isActive;
    return dbData;
};
