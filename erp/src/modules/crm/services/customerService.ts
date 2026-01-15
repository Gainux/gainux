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
        const { data, error } = await supabase
            .from("customers")
            .insert([
                {
                    name: customer.name,
                    company: customer.company,
                    email: customer.email,
                    status: customer.status || 'active',
                    total_revenue: customer.totalRevenue || '$0.00',
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
