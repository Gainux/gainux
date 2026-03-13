import { supabase } from '@/lib/supabase';
import type { ServiceCatalog } from '../types';

export const serviceCatalogService = {
    async getServices(orgId: string): Promise<ServiceCatalog[]> {
        const { data, error } = await supabase
            .from('company_services')
            .select('*')
            .eq('org_id', orgId)
            .order('name');

        if (error) throw error;

        return data.map(item => ({
            id: item.id,
            orgId: item.org_id,
            name: item.name,
            description: item.description,
            category: item.category,
            price: item.price,
            duration: item.duration,
            status: item.status,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }));
    },

    async getService(id: string): Promise<ServiceCatalog | null> {
        const { data, error } = await supabase
            .from('company_services')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return {
            id: data.id,
            orgId: data.org_id,
            name: data.name,
            description: data.description,
            category: data.category,
            price: data.price,
            duration: data.duration,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async createService(serviceData: Omit<ServiceCatalog, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceCatalog> {
        const { data, error } = await supabase
            .from('company_services')
            .insert({
                org_id: serviceData.orgId,
                name: serviceData.name,
                description: serviceData.description,
                category: serviceData.category,
                price: serviceData.price,
                duration: serviceData.duration,
                status: serviceData.status,
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            orgId: data.org_id,
            name: data.name,
            description: data.description,
            category: data.category,
            price: data.price,
            duration: data.duration,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async updateService(id: string, updates: Partial<ServiceCatalog>): Promise<ServiceCatalog> {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.price !== undefined) dbUpdates.price = updates.price;
        if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        dbUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('company_services')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            orgId: data.org_id,
            name: data.name,
            description: data.description,
            category: data.category,
            price: data.price,
            duration: data.duration,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    async deleteService(id: string): Promise<void> {
        const { error } = await supabase
            .from('company_services')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
