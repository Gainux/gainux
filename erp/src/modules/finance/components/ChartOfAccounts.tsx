import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, RefreshCw, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { financeService } from '../services/financeService';
import { ACCOUNT_TYPES } from '../types';
import type { Account } from '../types';
import { toast } from 'sonner';

export default function ChartOfAccounts() {
    const { profile } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const orgId = profile?.org_id;

    // New Account Form State
    const [newAccount, setNewAccount] = useState<Partial<Account>>({
        code: '',
        name: '',
        type: 'asset',
        currency: 'USD',
        is_active: true,
    });

    const fetchAccounts = async () => {
        if (!orgId) return;
        setIsLoading(true);
        try {
            const data = await financeService.getAccounts(orgId);
            setAccounts(data);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            toast.error('Failed to load Chart of Accounts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, [orgId]);

    const handleCreateAccount = async () => {
        if (!orgId) return;
        if (!newAccount.code || !newAccount.name || !newAccount.type) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            if (newAccount.id) {
                // Update mode
                await financeService.updateAccount(newAccount.id, {
                    code: newAccount.code,
                    name: newAccount.name,
                    type: newAccount.type as any,
                    currency: newAccount.currency,
                    is_active: newAccount.is_active
                });
                toast.success('Account updated successfully');
            } else {
                // Create mode
                await financeService.createAccount({
                    org_id: orgId,
                    code: newAccount.code,
                    name: newAccount.name,
                    type: newAccount.type as any,
                    currency: newAccount.currency || 'USD',
                    is_active: true,
                    parent_id: null
                });
                toast.success('Account created successfully');
            }

            setIsCreateDialogOpen(false);
            setNewAccount({ code: '', name: '', type: 'asset', currency: 'USD', is_active: true });
            fetchAccounts();
        } catch (error) {
            console.error('Failed to save account:', error);
            toast.error('Failed to save account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAccount = async (id: string) => {
        if (!confirm("Are you sure? Deleting an account with transactions will cause issues.")) return;
        try {
            await financeService.deleteAccount(id);
            toast.success("Account deleted");
            fetchAccounts();
        } catch (err: any) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete account");
        }
    };

    const filteredAccounts = accounts.filter(account =>
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Chart of Accounts</h2>
                    <p className="text-muted-foreground">Manage your general ledger accounts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={fetchAccounts}>
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add New Account</DialogTitle>
                                <DialogDescription>
                                    Create a new General Ledger account.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="code" className="text-right">Code</Label>
                                    <Input
                                        id="code"
                                        value={newAccount.code}
                                        onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                                        className="col-span-3"
                                        placeholder="e.g. 1000"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input
                                        id="name"
                                        value={newAccount.name}
                                        onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                                        className="col-span-3"
                                        placeholder="e.g. Cash on Hand"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <div className="col-span-3">
                                        <Select
                                            value={newAccount.type}
                                            onValueChange={(val: any) => setNewAccount({ ...newAccount, type: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ACCOUNT_TYPES.map(type => (
                                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateAccount} disabled={isSubmitting}>
                                    {isSubmitting ? 'Creating...' : 'Create Account'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Accounts List</CardTitle>
                    <CardDescription>
                        View and search all accounts in your organization.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center py-4">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search accounts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Currency</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAccounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                {isLoading ? (
                                                    <span>Loading accounts...</span>
                                                ) : (
                                                    <>
                                                        <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                                                        <p>No accounts found.</p>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAccounts.map((account) => (
                                        <TableRow key={account.id}>
                                            <TableCell className="font-medium">{account.code}</TableCell>
                                            <TableCell>{account.name}</TableCell>
                                            <TableCell className="capitalize">{account.type}</TableCell>
                                            <TableCell>{account.currency}</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {account.current_balance?.toLocaleString('en-US', { style: 'currency', currency: account.currency }) || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${account.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {account.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => {
                                                        setNewAccount(account);
                                                        setIsCreateDialogOpen(true);
                                                    }}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAccount(account.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
