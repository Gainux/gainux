import { supabase } from "@/lib/supabase";
import type { Vendor } from "../types";

export const vendorService = {
    async getVendors(orgId: string) {
        const { data, error } = await supabase
            .from("vendors")
            .select("*")
            .eq("org_id", orgId)
            .order("name");

        if (error) throw error;
        return data as Vendor[];
    },

    async createVendor(vendor: Partial<Vendor>) {
        const { data, error } = await supabase
            .from("vendors")
            .insert([vendor])
            .select()
            .single();

        if (error) throw error;
        return data as Vendor;
    },

    async updateVendor(id: string, updates: Partial<Vendor>) {
        const { data, error } = await supabase
            .from("vendors")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data as Vendor;
    },

    async deleteVendor(id: string) {
        const { error } = await supabase
            .from("vendors")
            .delete()
            .eq("id", id);

        if (error) throw error;
    }
};
