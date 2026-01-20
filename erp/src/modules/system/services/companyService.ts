import { supabase } from "@/lib/supabase";
import type { Organization, Branch } from "../types";

export const companyService = {
    // Organization
    async getOrganization(id: string) {
        const { data, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Organization;
    },

    async updateOrganization(id: string, updates: Partial<Organization>) {
        const { data, error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Organization;
    },

    async createOrganization(org: Partial<Organization>) {
        // Use RPC to safely handle RLS and atomic profile update
        const { data, error } = await supabase.rpc('create_new_organization', {
            org_name: org.name,
            org_currency: org.currency || 'USD'
        });

        if (error) throw error;
        return data as Organization;
    },

    // Branches
    async getBranches(orgId: string) {
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .eq('org_id', orgId)
            .order('is_main', { ascending: false }); // Main branch first

        if (error) throw error;
        return data as Branch[];
    },

    async createBranch(branch: Omit<Branch, "id" | "created_at" | "updated_at">) {
        // Only take fields that match DB columns
        const { data, error } = await supabase
            .from('branches')
            .insert(branch)
            .select()
            .single();

        if (error) throw error;
        return data as Branch;
    },

    async updateBranch(id: string, updates: Partial<Branch>) {
        const { data, error } = await supabase
            .from('branches')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Branch;
    },

    async deleteBranch(id: string) {
        const { error } = await supabase
            .from('branches')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    async linkUserToOrg(userId: string, orgId: string, role: string) {
        return await supabase
            .from('profiles')
            .update({ org_id: orgId, role, is_super_admin: true })
            .eq('id', userId);
    }
};
