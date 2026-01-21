import { supabase } from "@/lib/supabase";
import type { AuditLog } from "../types";

export const auditService = {
    async logAction(
        orgId: string,
        userId: string,
        action: string,
        entity: string,
        entityId: string,
        details: any
    ) {
        // Find efficient way to capture IP/Agent if possible, otherwise rely on backend triggers or edge functions.
        // For client-side logging, we just send what we know.

        const { error } = await supabase
            .from('audit_logs')
            .insert({
                org_id: orgId,
                user_id: userId,
                action,
                entity,
                entity_id: entityId,
                details
            });

        if (error) console.error("Failed to write audit log:", error);
    },

    async getLogs(orgId: string, limit = 50): Promise<AuditLog[]> {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*, profiles(full_name, email)') // Join profile to get user name
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return data.map((log: any) => ({
            id: log.id,
            org_id: log.org_id,
            user_id: log.user_id,
            user_name: log.profiles?.full_name || log.profiles?.email || 'Unknown',
            action: log.action,
            entity: log.entity,
            entity_id: log.entity_id,
            details: log.details,
            created_at: log.created_at
        }));
    }
};
