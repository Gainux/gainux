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

    async createOrganization(org: Partial<Organization>, user?: { id: string, email: string, full_name?: string }) {
        // 1. Ensure Profile Exists (if user provided)
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .maybeSingle();

            if (!profile) {
                console.log("Creating missing profile for user before org creation...");
                // Insert profile so RPC can update it or just to ensure it exists
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: user.id,
                    auth_id: user.id,
                    email: user.email,
                    full_name: user.full_name || '',
                    role: 'admin', // Default to admin for new org creator
                    status: 'active',
                    created_at: new Date().toISOString()
                });

                if (profileError) {
                    // Ignore duplicate key errors (race condition with trigger)
                    if (profileError.code !== '23505') {
                        console.error("Error creating profile:", profileError);
                        throw profileError;
                    }
                }
            }
        }

        // Use RPC to safely handle RLS and atomic profile update
        const { data: newOrg, error } = await supabase.rpc('create_new_organization', {
            org_name: org.name,
            org_currency: org.currency || 'USD'
        });

        if (error) throw error;

        // Update with subscription details if provided
        // We do this separately because the RPC might not accept these new columns yet
        if (org.subscription_plan) {
            await companyService.updateOrganization(newOrg.id, {
                subscription_plan: org.subscription_plan,
                subscription_status: org.subscription_status || 'active',
                subscription_expiry: org.subscription_expiry,
                razorpay_subscription_id: org.razorpay_subscription_id,
                settings: org.settings
            });

            // Return updated object locally
            return {
                ...newOrg,
                subscription_plan: org.subscription_plan,
                subscription_status: org.subscription_status || 'active'
            } as Organization;
        }

        return newOrg as Organization;
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
