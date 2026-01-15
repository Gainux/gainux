import { supabase } from "@/lib/supabase";
import type { Deal } from "../types";

export const dealService = {
    async getDeals() {
        const { data, error } = await supabase
            .from("deals")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return data.map((deal: any) => ({
            ...deal,
            expectedCloseDate: deal.expected_close_date,
            formattedValue: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(deal.value || 0),
            customerId: deal.customer_id,
            requirements: deal.requirements || []
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
                    company: deal.company,
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
        // formattedValue is derived, don't send to DB
        if ('formattedValue' in dbUpdates) delete dbUpdates.formattedValue;


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
            requirements: deal.requirements || []
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
