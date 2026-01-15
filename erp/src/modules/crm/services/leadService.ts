import { supabase } from "@/lib/supabase";
import type { Lead } from "../types";

export const leadService = {
    async getLeads() {
        const { data, error } = await supabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        // Map snake_case to camelCase
        return data.map((lead: any) => ({
            ...lead,
            lastContacted: lead.last_contacted,
        })) as Lead[];
    },

    async createLead(lead: Partial<Lead>) {
        const { data, error } = await supabase
            .from("leads")
            .insert([
                {
                    name: lead.name,
                    title: lead.title,
                    company: lead.company,
                    email: lead.email,
                    phone: lead.phone,
                    status: lead.status || 'new',
                    source: lead.source,
                    last_contacted: lead.lastContacted,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            lastContacted: data.last_contacted
        } as Lead;
    },

    async updateLead(id: string, updates: Partial<Lead>) {
        // Prepare updates, mapping keys if necessary
        const dbUpdates: any = { ...updates };
        if (updates.lastContacted) {
            dbUpdates.last_contacted = updates.lastContacted;
            delete dbUpdates.lastContacted;
        }

        const { data, error } = await supabase
            .from("leads")
            .update(dbUpdates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            lastContacted: data.last_contacted
        } as Lead;
    },

    async deleteLead(id: string) {
        const { error } = await supabase.from("leads").delete().eq("id", id);
        if (error) throw error;
    }
};
