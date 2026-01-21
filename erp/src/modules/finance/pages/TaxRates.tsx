
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Shield, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { taxService } from '../services/taxService';
import { financeService } from '../services/financeService';
import type { TaxRate, Account } from '../types';

import { useNavigate } from 'react-router-dom';

export default function TaxRates() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [rates, setRates] = useState<TaxRate[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRate, setEditingRate] = useState<TaxRate | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        rate: '',
        type: 'both',
        description: '',
        glAccountId: ''
    });

    useEffect(() => {
        if (profile?.org_id) {
            loadData();
        }
    }, [profile?.org_id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [ratesData, accountsData] = await Promise.all([
                taxService.getTaxRates(profile!.org_id),
                financeService.getAccounts(profile!.org_id)
            ]);
            setRates(ratesData);
            setAccounts(accountsData);
        } catch (error) {
            console.error('Failed to load tax data', error);
            toast.error('Failed to load tax rates');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const dataToSubmit = {
                org_id: profile!.org_id,
                name: formData.name,
                code: formData.code,
                rate: parseFloat(formData.rate),
                type: formData.type as 'sales' | 'purchase' | 'both',
                description: formData.description,
                glAccountId: formData.glAccountId || undefined,
                isActive: true
            };

            if (editingRate) {
                await taxService.updateTaxRate(editingRate.id, dataToSubmit);
                toast.success('Tax rate updated');
            } else {
                await taxService.createTaxRate(dataToSubmit);
                toast.success('Tax rate created');
            }

            setIsDialogOpen(false);
            resetForm();
            loadData();
        } catch (error) {
            console.error('Failed to save tax rate', error);
            toast.error('Failed to save tax rate');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this tax rate?')) return;
        try {
            await taxService.deleteTaxRate(id);
            toast.success('Tax rate deleted');
            loadData();
        } catch (error) {
            toast.error('Failed to delete tax rate');
        }
    };

    const openCreateDialog = () => {
        resetForm();
        setEditingRate(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (rate: TaxRate) => {
        setFormData({
            name: rate.name,
            code: rate.code,
            rate: rate.rate.toString(),
            type: rate.type,
            description: rate.description || '',
            glAccountId: rate.glAccountId || ''
        });
        setEditingRate(rate);
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            code: '',
            rate: '',
            type: 'both',
            description: '',
            glAccountId: ''
        });
    };

    const filteredAccounts = accounts.filter(a =>
        a.type === 'liability' || a.type === 'asset' // Tax can be payable (liability) or receivable (asset)
    );

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tax & Compliance</h2>
                    <p className="text-muted-foreground">Manage tax rates and compliance settings.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/finance/tax/report')}>
                        View Liability Report
                    </Button>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Add Tax Rate
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Tax Rates</CardTitle>
                        <CardDescription>Defined tax rates for sales and purchases.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Rate (%)</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>GL Account</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">Loading...</TableCell>
                                    </TableRow>
                                ) : rates.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No tax rates defined.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rates.map((rate) => (
                                        <TableRow key={rate.id}>
                                            <TableCell className="font-mono">{rate.code}</TableCell>
                                            <TableCell className="font-medium">{rate.name}</TableCell>
                                            <TableCell>{rate.rate}%</TableCell>
                                            <TableCell className="capitalize">{rate.type}</TableCell>
                                            <TableCell title={accounts.find(a => a.id === rate.glAccountId)?.name || 'Not Linked'}>
                                                {accounts.find(a => a.id === rate.glAccountId)?.code || '-'}
                                                {accounts.find(a => a.id === rate.glAccountId) && <span className='text-muted-foreground ml-2 text-xs'>({accounts.find(a => a.id === rate.glAccountId)?.name})</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => openEditDialog(rate)}>
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(rate.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRate ? 'Edit Tax Rate' : 'Add Tax Rate'}</DialogTitle>
                        <DialogDescription>
                            Configure the tax rate details and GL mapping.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tax Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. GST Standard"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="code">Tax Code</Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. GST-18"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="rate">Rate (%)</Label>
                                <Input
                                    id="rate"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.rate}
                                    onChange={e => setFormData({ ...formData, rate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Applies To</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={val => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sales">Sales Only</SelectItem>
                                        <SelectItem value="purchase">Purchase Only</SelectItem>
                                        <SelectItem value="both">Both</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="glAccountId">GL Account (Auto-Posting)</Label>
                            <Select
                                value={formData.glAccountId}
                                onValueChange={val => setFormData({ ...formData, glAccountId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a GL Account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredAccounts.map(account => (
                                        <SelectItem key={account.id} value={account.id}>
                                            {account.code} - {account.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Select a Liability (Tax Payable) or Asset (Tax Input) account.</p>
                        </div>

                        <DialogFooter>
                            <Button type="submit">Save Tax Rate</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
