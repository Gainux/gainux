import { supabase } from "@/lib/supabase";
import type { Deal } from "../types";

export const dealService = {
    async getDeals(orgId?: string) {
        let query = supabase
            .from("deals")
            .select(`
                *,
                company:companies(*),
                contact:contacts(*)
            `)
            .order("created_at", { ascending: false });

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return data.map((deal: any) => ({
            ...deal,
            expectedCloseDate: deal.expected_close_date,
            formattedValue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value || 0),
            customerId: deal.customer_id,
            companyId: deal.company_id,
            contactId: deal.contact_id,
            requirements: deal.requirements || [],
            createdAt: deal.created_at,
            updatedAt: deal.updated_at
        })) as Deal[];
    },

    async createDeal(deal: Partial<Deal>) {
        const { data, error } = await supabase
            .from("deals")
            .insert([
                {
                    title: deal.title,
                    value: deal.value,
                    stage: deal.stage || 'new',
                    company_id: deal.companyId,
                    contact_id: deal.contactId,
                    expected_close_date: deal.expectedCloseDate,
                    probability: deal.probability,
                    customer_id: deal.customerId,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            expectedCloseDate: data.expected_close_date,
            formattedValue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.value || 0),
            customerId: data.customer_id
        } as Deal;
    },

    async updateDeal(id: string, updates: Partial<Deal>) {
        // Prepare updates, mapping keys if necessary
        const dbUpdates: any = { ...updates };
        if (updates.expectedCloseDate) {
            dbUpdates.expected_close_date = updates.expectedCloseDate;
            delete dbUpdates.expectedCloseDate;
        }
        if (updates.customerId !== undefined) {
            dbUpdates.customer_id = updates.customerId;
            delete dbUpdates.customerId;
        }
        if (updates.companyId !== undefined) {
            dbUpdates.company_id = updates.companyId;
            delete dbUpdates.companyId;
        }
        if (updates.contactId !== undefined) {
            dbUpdates.contact_id = updates.contactId;
            delete dbUpdates.contactId;
        }
        // formattedValue is derived, don't send to DB
        if ('formattedValue' in dbUpdates) delete dbUpdates.formattedValue;
        if ('company' in dbUpdates) delete dbUpdates.company; // Relations not updateable directly
        if ('contact' in dbUpdates) delete dbUpdates.contact;


        const { data, error } = await supabase
            .from("deals")
            .update(dbUpdates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            expectedCloseDate: data.expected_close_date,
            formattedValue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.value || 0),
            customerId: data.customer_id
        } as Deal;
    },

    async updateDealStage(id: string, stage: string) {
        const { data, error } = await supabase
            .from("deals")
            .update({ stage })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getDealsByCustomer(customerId: string) {
        const { data, error } = await supabase
            .from("deals")
            .select("*")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data.map((deal: any) => ({
            ...deal,
            expectedCloseDate: deal.expected_close_date,
            formattedValue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value || 0),
            customerId: deal.customer_id,
            companyId: deal.company_id,
            contactId: deal.contact_id,
            requirements: deal.requirements || [],
            createdAt: deal.created_at,
            updatedAt: deal.updated_at
        })) as Deal[];
    },

    async updateRequirements(dealId: string, requirements: any[]) {
        const { data, error } = await supabase
            .from("deals")
            .update({ requirements })
            .eq("id", dealId)
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            expectedCloseDate: data.expected_close_date,
            formattedValue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.value || 0),
            customerId: data.customer_id,
            requirements: data.requirements || []
        } as Deal;
    }
};
