import { supabase } from "@/lib/supabase";

export interface OrganizationSettings {
    id: string;
    organizationName: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstin?: string;
    darkMode: boolean;
    primaryColor: string;
    emailNotifications: boolean;
    notifyInvoiceDue: boolean;
    notifyDealWon: boolean;
    notifyNewLead: boolean;
}

export const settingsService = {
    async getSettings(): Promise<OrganizationSettings> {
        const { data, error } = await supabase
            .from("organization_settings")
            .select("*")
            .single();

        if (error) {
            // If no settings exist, return defaults
            if (error.code === 'PGRST116') {
                return {
                    id: '',
                    organizationName: 'Gainux',
                    darkMode: false,
                    primaryColor: 'blue',
                    emailNotifications: true,
                    notifyInvoiceDue: true,
                    notifyDealWon: true,
                    notifyNewLead: false,
                };
            }
            throw error;
        }

        return {
            id: data.id,
            organizationName: data.organization_name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            gstin: data.gstin,
            darkMode: data.dark_mode,
            primaryColor: data.primary_color,
            emailNotifications: data.email_notifications,
            notifyInvoiceDue: data.notify_invoice_due,
            notifyDealWon: data.notify_deal_won,
            notifyNewLead: data.notify_new_lead,
        };
    },

    async updateSettings(settings: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
        const dbSettings: any = {};

        if (settings.organizationName !== undefined) dbSettings.organization_name = settings.organizationName;
        if (settings.email !== undefined) dbSettings.email = settings.email;
        if (settings.phone !== undefined) dbSettings.phone = settings.phone;
        if (settings.address !== undefined) dbSettings.address = settings.address;
        if (settings.city !== undefined) dbSettings.city = settings.city;
        if (settings.state !== undefined) dbSettings.state = settings.state;
        if (settings.pincode !== undefined) dbSettings.pincode = settings.pincode;
        if (settings.gstin !== undefined) dbSettings.gstin = settings.gstin;
        if (settings.darkMode !== undefined) dbSettings.dark_mode = settings.darkMode;
        if (settings.primaryColor !== undefined) dbSettings.primary_color = settings.primaryColor;
        if (settings.emailNotifications !== undefined) dbSettings.email_notifications = settings.emailNotifications;
        if (settings.notifyInvoiceDue !== undefined) dbSettings.notify_invoice_due = settings.notifyInvoiceDue;
        if (settings.notifyDealWon !== undefined) dbSettings.notify_deal_won = settings.notifyDealWon;
        if (settings.notifyNewLead !== undefined) dbSettings.notify_new_lead = settings.notifyNewLead;

        // Get existing settings to update
        const existing = await this.getSettings();

        if (existing.id) {
            // Update existing
            const { data, error } = await supabase
                .from("organization_settings")
                .update(dbSettings)
                .eq("id", existing.id)
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                organizationName: data.organization_name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                gstin: data.gstin,
                darkMode: data.dark_mode,
                primaryColor: data.primary_color,
                emailNotifications: data.email_notifications,
                notifyInvoiceDue: data.notify_invoice_due,
                notifyDealWon: data.notify_deal_won,
                notifyNewLead: data.notify_new_lead,
            };
        } else {
            // Create new
            const { data, error } = await supabase
                .from("organization_settings")
                .insert([dbSettings])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                organizationName: data.organization_name,
                email: data.email,
                phone: data.phone,
                address: data.address,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                gstin: data.gstin,
                darkMode: data.dark_mode,
                primaryColor: data.primary_color,
                emailNotifications: data.email_notifications,
                notifyInvoiceDue: data.notify_invoice_due,
                notifyDealWon: data.notify_deal_won,
                notifyNewLead: data.notify_new_lead,
            };
        }
    }
};
