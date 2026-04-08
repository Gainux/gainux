import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";
import type { SystemUser } from "../types";

// Get env vars for temp client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const mapToSystemUser = (data: any): SystemUser => ({
    id: data.id,
    auth_id: data.auth_id || data.id,
    email: data.email,
    full_name: data.full_name || (data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || data.last_name || null),
    role: data.role,
    avatar_url: data.avatar_url,
    status: data.status,
    org_id: data.org_id,
    created_at: data.created_at,
    updated_at: data.updated_at
});

export const userService = {
    async getUsers(orgId?: string) {
        let query = supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (orgId) {
            query = query.eq('org_id', orgId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.map(mapToSystemUser);
    },

    async getUserById(id: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapToSystemUser(data);
    },

    async updateUserRole(id: string, role: string) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToSystemUser(data);
    },

    async updateUserStatus(id: string, status: string) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToSystemUser(data);
    },

    async createUser(user: Partial<SystemUser> & { password?: string }) {
        if (!user.email || !user.password) {
            throw new Error("Email and password are required");
        }

        const email = user.email.trim();
        const password = user.password;

        // 1. Create user in Auth using a temporary client to avoid logging out the admin
        // We use a separate client with memory storage so it doesn't affect localStorage
        const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false, // Don't persist this session
                autoRefreshToken: false,
                detectSessionInUrl: false
            }
        });

        const { data: authData, error: authError } = await tempClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: user.full_name,
                    avatar_url: user.avatar_url
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user");

        const authUserId = authData.user.id;

        // 2. Create Profile (or link it if schema ensures it)
        // Since we decoupled ID, we can insert with both IDs to be sure
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                auth_id: authUserId, // Link to the new auth user
                email,
                full_name: user.full_name,
                role: user.role || 'user',
                status: user.status || 'active',
                org_id: user.org_id // Ensure org_id is passed
            })
            .select()
            .single();

        if (error) {
            // Handle race condition if profile was auto-created by trigger (if trigger exists)
            // But with our manual flow, this is usually fine.
            throw error;
        }

        return mapToSystemUser(data);
    },

    async updateUser(id: string, updates: Partial<SystemUser>) {
        // Filter out undefined values
        const cleanUpdates: any = {};
        if (updates.full_name !== undefined) cleanUpdates.full_name = updates.full_name;
        if (updates.role !== undefined) cleanUpdates.role = updates.role;
        if (updates.status !== undefined) cleanUpdates.status = updates.status;

        const { data, error } = await supabase
            .from('profiles')
            .update(cleanUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapToSystemUser(data);
    },

    async deleteUser(id: string) {
        const { error } = await supabase
            .from('profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
