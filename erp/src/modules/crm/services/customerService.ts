import { supabase } from "@/lib/supabase";
import type { Customer } from "../types";

export const customerService = {
    async getCustomers() {
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data as Customer[];
    },

    async createCustomer(customer: Partial<Customer>) {
        const { data: auth } = await supabase.auth.getUser();
        const { data: userProfile } = await supabase
            .from("profiles")
            .select("org_id")
            .eq("id", auth.user?.id)
            .single();

        if (!userProfile?.org_id) throw new Error("User organization not found");

        const { data, error } = await supabase
            .from("customers")
            .insert([
                {
                    org_id: userProfile.org_id,
                    name: customer.name || '',
                    email: customer.email,
                    status: customer.status || 'active',
                    total_revenue: customer.totalRevenue || 0,
                    last_order_date: customer.lastOrderDate,
                    phone: customer.phone,
                    address: customer.address,
                    city: customer.city,
                    state: customer.state,
                    zip: customer.zip,
                    country: customer.country,
                    website: customer.website,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        // Map back snake_case to camelCase for the frontend
        return {
            ...data,
            totalRevenue: data.total_revenue,
            lastOrderDate: data.last_order_date,
        } as Customer;
    },

    async updateCustomer(id: string, updates: Partial<Customer>) {
        // Prepare updates, mapping keys if necessary
        const dbUpdates: any = { ...updates };
        if (updates.totalRevenue) {
            dbUpdates.total_revenue = updates.totalRevenue;
            delete dbUpdates.totalRevenue;
        }
        if (updates.lastOrderDate) {
            dbUpdates.last_order_date = updates.lastOrderDate;
            delete dbUpdates.lastOrderDate;
        }

        const { data, error } = await supabase
            .from("customers")
            .update(dbUpdates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return {
            ...data,
            totalRevenue: data.total_revenue,
            lastOrderDate: data.last_order_date,
        } as Customer;
    },

    async deleteCustomer(id: string) {
        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", id);

        if (error) throw error;
    },
    async getCustomerById(id: string) {
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return {
            ...data,
            totalRevenue: data.total_revenue,
            lastOrderDate: data.last_order_date,
        } as Customer;
    },
};
