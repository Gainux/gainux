
import { supabase } from "@/lib/supabase";
import type { Patient, ClinicalEncounter, Prescription, PrescriptionItem } from "../types";

export const healthcareService = {
    // --- Patients ---
    async getPatients(orgId: string) {
        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .eq("org_id", orgId)
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data as Patient[];
    },

    async getPatient(id: string) {
        const { data, error } = await supabase
            .from("patients")
            .select("*")
            .eq("id", id)
            .single();
        if (error) throw error;
        return data as Patient;
    },

    async createPatient(patient: Partial<Patient>) {
        const { data, error } = await supabase
            .from("patients")
            .insert([patient])
            .select()
            .single();
        if (error) throw error;
        return data as Patient;
    },

    async updatePatient(id: string, updates: Partial<Patient>) {
        const { data, error } = await supabase
            .from("patients")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as Patient;
    },

    // --- Encounters ---
    async getEncounters(orgId: string) {
        const { data, error } = await supabase
            .from("clinical_encounters")
            .select(`
                *,
                patient:patients(first_name, last_name)
            `)
            .eq("org_id", orgId)
            .order("encounter_date", { ascending: false });
        if (error) throw error;
        return data as ClinicalEncounter[];
    },

    async getEncounter(id: string) {
        const { data, error } = await supabase
            .from("clinical_encounters")
            .select(`
                *,
                patient:patients(*)
            `)
            .eq("id", id)
            .single();
        if (error) throw error;
        return data as ClinicalEncounter;
    },

    async createEncounter(encounter: Partial<ClinicalEncounter>) {
        const { data, error } = await supabase
            .from("clinical_encounters")
            .insert([encounter])
            .select()
            .single();
        if (error) throw error;
        return data as ClinicalEncounter;
    },

    async updateEncounter(id: string, updates: Partial<ClinicalEncounter>) {
        const { data, error } = await supabase
            .from("clinical_encounters")
            .update(updates)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data as ClinicalEncounter;
    },

    // --- Prescriptions ---
    async createPrescription(prescription: Partial<Prescription>, items: Partial<PrescriptionItem>[]) {
        // 1. Create Prescription Header
        const { data: pData, error: pError } = await supabase
            .from("prescriptions")
            .insert([prescription])
            .select()
            .single();

        if (pError) throw pError;

        // 2. Create Items
        if (items.length > 0) {
            const itemsWithId = items.map(item => ({
                prescription_id: pData.id,
                item_id: item.item_id,
                quantity: item.quantity,
                dosage_instructions: item.dosage_instructions
            }));

            const { error: iError } = await supabase
                .from("prescription_items")
                .insert(itemsWithId);

            if (iError) throw iError;
        }

        return pData as Prescription;
    },

    async getPrescriptions(orgId: string, status?: string) {
        let query = supabase
            .from("prescriptions")
            .select(`
                *,
                patient:patients(first_name, last_name),
                items:prescription_items(
                    *,
                    item:inventory_items(name, unit)
                )
            `)
            .eq("org_id", orgId)
            .order("created_at", { ascending: false });

        if (status) {
            query = query.eq("status", status);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Prescription[];
    },

    async updatePrescription(prescriptionId: string, prescription: Partial<Prescription>, items: Partial<PrescriptionItem>[]) {
        // 1. Update Prescription Header
        const { data: pData, error: pError } = await supabase
            .from("prescriptions")
            .update(prescription)
            .eq("id", prescriptionId)
            .select()
            .single();

        if (pError) throw pError;

        // 2. Update Items (Strategy: Delete all and re-insert)
        // Only safe if status is not dispensed, but UI should guard that.

        // Delete existing items
        const { error: dError } = await supabase
            .from("prescription_items")
            .delete()
            .eq("prescription_id", prescriptionId);

        if (dError) throw dError;

        // Insert new items
        if (items.length > 0) {
            const itemsWithId = items.map(item => ({
                prescription_id: prescriptionId,
                item_id: item.item_id,
                quantity: item.quantity,
                dosage_instructions: item.dosage_instructions
            }));

            const { error: iError } = await supabase
                .from("prescription_items")
                .insert(itemsWithId);

            if (iError) throw iError;
        }

        return pData as Prescription;
    },

    async getPrescriptionsByEncounter(encounterId: string) {
        const { data, error } = await supabase
            .from("prescriptions")
            .select(`
                *,
                items:prescription_items(
                    *,
                    item:inventory_items(name, unit)
                )
            `)
            .eq("encounter_id", encounterId);

        if (error) throw error;
        return data as Prescription[];
    },

    async dispensePrescription(prescriptionId: string) {
        // Use RPC function to atomically update status and deduct stock
        const { data, error } = await supabase
            .rpc('dispense_prescription', { p_id: prescriptionId });

        if (error) throw error;
        return data as any;
    }
};
