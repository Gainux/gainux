
import { supabase } from '@/lib/supabase';
import type { FixedAsset, DepreciationScheduleItem } from '../types';

export const assetService = {
    getAssets: async (orgId: string): Promise<FixedAsset[]> => {
        const { data, error } = await supabase
            .from('fixed_assets')
            .select('*')
            .eq('org_id', orgId)
            .order('purchase_date', { ascending: false });

        if (error) throw error;

        return (data || []).map((a: any) => mapDbToAsset(a));
    },

    getAssetById: async (id: string): Promise<FixedAsset> => {
        const { data, error } = await supabase
            .from('fixed_assets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return mapDbToAsset(data);
    },

    createAsset: async (asset: Partial<FixedAsset> & { org_id: string }): Promise<FixedAsset> => {
        const dbPayload = mapAssetToDb(asset);
        // Ensure defaults
        if (!dbPayload.status) dbPayload.status = 'active';

        const { data, error } = await supabase
            .from('fixed_assets')
            .insert([dbPayload])
            .select()
            .single();

        if (error) throw error;
        return mapDbToAsset(data);
    },

    updateAsset: async (id: string, updates: Partial<FixedAsset>): Promise<FixedAsset> => {
        const dbPayload = mapAssetToDb(updates);
        // Remove undefined keys
        Object.keys(dbPayload).forEach(key => dbPayload[key] === undefined && delete dbPayload[key]);

        const { data, error } = await supabase
            .from('fixed_assets')
            .update(dbPayload)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapDbToAsset(data);
    },

    deleteAsset: async (id: string): Promise<void> => {
        const { error } = await supabase
            .from('fixed_assets')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Logic: Calculate Depreciation Schedule (Straight Line)
    calculateDepreciationSchedule: (asset: FixedAsset): DepreciationScheduleItem[] => {
        const { purchaseCost, salvageValue, usefulLifeYears, purchaseDate, depreciationMethod } = asset;
        const schedule: DepreciationScheduleItem[] = [];

        if (depreciationMethod === 'STRAIGHT_LINE') {
            const depreciableAmount = purchaseCost - salvageValue;
            const yearlyDepreciation = depreciableAmount / usefulLifeYears;
            const startYear = new Date(purchaseDate).getFullYear();

            let currentBookValue = purchaseCost;

            // Simple yearly schedule
            let remainingLife = usefulLifeYears;
            let currentYear = startYear;

            while (remainingLife > 0) {
                // If remaining life is less than 1 year (fractional), take the rest
                const amount = remainingLife < 1
                    ? (currentBookValue - salvageValue)
                    : yearlyDepreciation;

                // Adjust for final year rounding or if it goes below salvage
                const depreciationEntries = Math.min(amount, currentBookValue - salvageValue);
                if (depreciationEntries <= 0 && schedule.length > 0) break;

                const closingValue = currentBookValue - depreciationEntries;

                schedule.push({
                    year: currentYear,
                    openingValue: Number(currentBookValue.toFixed(2)),
                    depreciationAmount: Number(depreciationEntries.toFixed(2)),
                    closingValue: Number(closingValue.toFixed(2))
                });

                currentBookValue = closingValue;
                currentYear++;
                remainingLife--;
            }
        }

        return schedule;
    }
};

// Helpers to map CamelCase (Frontend) <-> Snake_Case (DB)
const mapDbToAsset = (data: any): FixedAsset => ({
    id: data.id,
    org_id: data.org_id,
    assetName: data.asset_name,
    assetCode: data.asset_code,
    description: data.description,
    purchaseDate: data.purchase_date,
    purchaseCost: data.purchase_cost,
    salvageValue: data.salvage_value,
    usefulLifeYears: data.useful_life_years,
    depreciationMethod: data.depreciation_method,
    status: data.status,
    currentValue: data.current_value,
    accumulatedDepreciation: data.accumulated_depreciation,
    created_at: data.created_at,
    updated_at: data.updated_at
});

const mapAssetToDb = (asset: Partial<FixedAsset>): any => {
    const db: any = {};
    if (asset.org_id) db.org_id = asset.org_id;
    if (asset.assetName) db.asset_name = asset.assetName;
    if (asset.assetCode) db.asset_code = asset.assetCode;
    if (asset.description) db.description = asset.description;
    if (asset.purchaseDate) db.purchase_date = asset.purchaseDate;
    if (asset.purchaseCost !== undefined) db.purchase_cost = asset.purchaseCost;
    if (asset.salvageValue !== undefined) db.salvage_value = asset.salvageValue;
    if (asset.usefulLifeYears !== undefined) db.useful_life_years = asset.usefulLifeYears;
    if (asset.depreciationMethod) db.depreciation_method = asset.depreciationMethod;
    if (asset.status) db.status = asset.status;
    // Current value and accumulated dep usually calculated or updated by system, but allow override
    if (asset.currentValue !== undefined) db.current_value = asset.currentValue;
    if (asset.accumulatedDepreciation !== undefined) db.accumulated_depreciation = asset.accumulatedDepreciation;

    return db;
};
