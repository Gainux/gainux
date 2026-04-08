
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetService } from '../services/assetService';
import { toast } from 'sonner';

/**
 * Note: Check depreciation method enum values in DB schema
 */
const assetSchema = z.object({
    assetName: z.string().min(1, "Asset Name is required"),
    assetCode: z.string().optional(),
    description: z.string().optional(),
    purchaseDate: z.string().min(1, "Purchase Date is required"),
    purchaseCost: z.number().min(0, "Cost must be positive"),
    salvageValue: z.number().min(0, "Salvage Value must be positive").default(0),
    usefulLifeYears: z.number().min(0.1, "Useful Life must be positive"),
    // Default to SL for now
    depreciationMethod: z.enum(['STRAIGHT_LINE', 'DECLINING_BALANCE']).default('STRAIGHT_LINE')
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function AssetForm({ open, onOpenChange, onSuccess }: AssetFormProps) {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(false);

    const form = useForm<any>({
        resolver: zodResolver(assetSchema),
        defaultValues: {
            assetName: '',
            assetCode: '',
            description: '',
            purchaseDate: new Date().toISOString().split('T')[0],
            purchaseCost: 0,
            salvageValue: 0,
            usefulLifeYears: 5,
            depreciationMethod: 'STRAIGHT_LINE'
        }
    });

    const onSubmit = async (values: AssetFormValues) => {
        if (!profile?.org_id) return;

        try {
            setLoading(true);
            await assetService.createAsset({
                ...values,
                org_id: profile.org_id,
                status: 'active'
            });
            toast.success('Asset registered successfully');
            form.reset();
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create asset', error);
            toast.error('Failed to register asset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Register Fixed Asset</DialogTitle>
                    <DialogDescription>Enter the details of the new asset.</DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="assetName">Asset Name*</Label>
                            <Input id="assetName" {...form.register('assetName')} placeholder="e.g. MacBook Pro M3" />
                            {form.formState.errors.assetName && <p className="text-sm text-red-500">{(form.formState.errors.assetName as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="assetCode">Asset Code</Label>
                            <Input id="assetCode" {...form.register('assetCode')} placeholder="e.g. FA-001" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input id="description" {...form.register('description')} placeholder="Serial Number, Location, etc." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purchaseDate">Purchase Date*</Label>
                            <Input type="date" id="purchaseDate" {...form.register('purchaseDate')} />
                            {form.formState.errors.purchaseDate && <p className="text-sm text-red-500">{(form.formState.errors.purchaseDate as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="purchaseCost">Purchase Cost*</Label>
                            <Input type="number" step="0.01" id="purchaseCost"
                                {...form.register('purchaseCost', { valueAsNumber: true })} />
                            {form.formState.errors.purchaseCost && <p className="text-sm text-red-500">{(form.formState.errors.purchaseCost as any).message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="salvageValue">Salvage Value</Label>
                            <Input type="number" step="0.01" id="salvageValue"
                                {...form.register('salvageValue', { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="usefulLifeYears">Useful Life (Years)*</Label>
                            <Input type="number" step="0.1" id="usefulLifeYears"
                                {...form.register('usefulLifeYears', { valueAsNumber: true })} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Registering..." : "Register Asset"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
