
import type { InventoryItem } from "../procurement/types";

export interface Patient {
    id: string;
    org_id: string;
    first_name: string;
    last_name: string;
    date_of_birth?: string;
    gender?: string;
    contact_number?: string;
    email?: string;
    address?: string;
    medical_history?: string;
    allergies?: string;
    created_at: string;
    updated_at: string;
}

export interface ClinicalEncounter {
    id: string;
    org_id: string;
    patient_id: string;
    patient?: Patient;
    doctor_id?: string;
    encounter_date: string;
    type: 'consultation' | 'emergency' | 'follow_up' | 'checkup';
    chief_complaint?: string;
    diagnosis?: string;
    notes?: string;
    status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
    departments_to_visit?: { id: string, name: string }[];
    created_at: string;
    updated_at: string;
}

export interface Prescription {
    id: string;
    org_id: string;
    encounter_id: string;
    patient_id: string;
    doctor_id?: string;
    status: 'draft' | 'pending_pharmacy' | 'dispensed' | 'cancelled';
    notes?: string;
    created_at: string;
    updated_at: string;
    items?: PrescriptionItem[];
    patient?: Patient;
}

export interface PrescriptionItem {
    id: string;
    prescription_id: string;
    item_id: string;
    item?: InventoryItem;
    quantity: number;
    dosage_instructions?: string;
    dispensed_at?: string;
}
