import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, RefreshCw, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { financeService } from '../services/financeService';
import type { JournalEntry, Account } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function JournalEntryList() {
    // Assuming AuthContext provides user which contains organization info or organization directly but lint says it doesn't exist on type. 
    // Checking AuthContext definition might be needed, but usually it's `user?.organization_id` or similar if `organization` is missing.
    // Based on ChartOfAccounts, it uses `const { organization } = useAuth()`. 
    // Let's assume the previous error on lines 17 was due to outdated types or I should check AuthContext. 
    // However, I will wrap it to be safe or ignore if I am sure. 
    // Actually, let's look at previous successful file ChartOfAccounts. It used `const { organization } = useAuth();`
    // Maybe the lint is just slow? Or AuthContextType is missing it. 
    // I'll suppress for now or keep it if I trust ChartOfAccounts was working.
    const { profile } = useAuth();
    const orgId = profile?.org_id;
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Create Journal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [newJournal, setNewJournal] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
        items: [
            { account_id: '', debit: '', credit: '', description: '' },
            { account_id: '', debit: '', credit: '', description: '' } // Minimum 2 lines
        ]
    });

    const fetchJournals = async () => {
        if (!orgId) return;
        setIsLoading(true);
        try {
            const data = await financeService.getJournalEntries(orgId);
            setJournals(data);
        } catch (error) {
            console.error('Failed to fetch journals:', error);
            toast.error('Failed to load journal entries');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAccounts = async () => {
        if (!orgId) return;
        try {
            const data = await financeService.getAccounts(orgId);
            setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts for journal:', error);
        }
    };

    useEffect(() => {
        fetchJournals();
        fetchAccounts();
    }, [orgId]);

    const handleCreateJournal = async () => {
        if (!orgId) return;

        // Validation
        const validItems = newJournal.items.filter(item => item.account_id && (Number(item.debit) > 0 || Number(item.credit) > 0));

        if (validItems.length < 2) {
            toast.error('Double Entry Principle: You must have at least 2 lines with selected accounts and non-zero amounts.', {
                duration: 5000,
            });
            return;
        }

        const totalDebit = validItems.reduce((sum, item) => sum + Number(item.debit || 0), 0);
        const totalCredit = validItems.reduce((sum, item) => sum + Number(item.credit || 0), 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            toast.error(`Unbalanced Entry: Total Debits (₹${totalDebit.toFixed(2)}) must equal Total Credits (₹${totalCredit.toFixed(2)})`, {
                duration: 5000,
            });
            return;
        }

        try {
            await financeService.createJournalEntry(
                {
                    org_id: orgId,
                    entry_date: newJournal.date,
                    description: newJournal.description,
                    reference: newJournal.reference,
                    status: 'posted' // Auto-post for now
                },
                validItems.map(item => ({
                    account_id: item.account_id,
                    debit: Number(item.debit || 0),
                    credit: Number(item.credit || 0),
                    description: item.description || newJournal.description
                }))
            );

            toast.success('Journal Entry Posted Successfully');
            setIsCreateOpen(false);
            setNewJournal({
                date: new Date().toISOString().split('T')[0],
                description: '',
                reference: '',
                items: [
                    { account_id: '', debit: '', credit: '', description: '' },
                    { account_id: '', debit: '', credit: '', description: '' }
                ]
            });
            fetchJournals();
        } catch (error: any) {
            console.error('Failed to create journal:', error);
            toast.error(error.message || 'Failed to post journal entry');
        }
    };

    const handleDeleteJournal = async (id: string) => {
        if (!confirm("Are you sure you want to delete this journal entry?")) return;
        try {
            await financeService.deleteJournalEntry(id);
            toast.success("Journal entry deleted");
            fetchJournals();
        } catch (err: any) {
            console.error("Failed to delete journal:", err);
            toast.error("Failed to delete journal entry");
        }
    };

    const addLine = () => {
        setNewJournal({
            ...newJournal,
            items: [...newJournal.items, { account_id: '', debit: '', credit: '', description: '' }]
        });
    };

    const updateLine = (index: number, field: string, value: string) => {
        const newItems = [...newJournal.items];

        // Prevent negative values for Debit/Credit
        if (field === 'debit' || field === 'credit') {
            if (Number(value) < 0) return; // Ignore negative inputs
        }

        (newItems[index] as any)[field] = value;
        setNewJournal({ ...newJournal, items: newItems });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Journal Entries</h2>
                    <p className="text-sm text-muted-foreground">Record financial transactions.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Journal Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>New Journal Entry</DialogTitle>
                            <DialogDescription>Record a double-entry transaction.</DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-3 gap-4 py-4">
                            <div>
                                <label className="text-sm font-medium">Date</label>
                                <Input type="date" value={newJournal.date} onChange={e => setNewJournal({ ...newJournal, date: e.target.value })} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input placeholder="e.g., Monthly Rent" value={newJournal.description} onChange={e => setNewJournal({ ...newJournal, description: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Reference</label>
                                <Input placeholder="Invoice #, Check #" value={newJournal.reference} onChange={e => setNewJournal({ ...newJournal, reference: e.target.value })} />
                            </div>
                        </div>

                        <div className="border rounded-md p-4 bg-muted/30">
                            <div className="grid grid-cols-12 gap-2 mb-2 text-sm font-medium text-muted-foreground">
                                <div className="col-span-4">Account</div>
                                <div className="col-span-3">Description (Optional)</div>
                                <div className="col-span-2 text-right">Debit</div>
                                <div className="col-span-2 text-right">Credit</div>
                                <div className="col-span-1"></div>
                            </div>

                            {newJournal.items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
                                    <div className="col-span-4">
                                        <Select value={item.account_id} onValueChange={v => updateLine(index, 'account_id', v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Account" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>{acc.code} - {acc.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-3">
                                        <Input
                                            placeholder="Line description"
                                            value={item.description}
                                            onChange={e => updateLine(index, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            className="text-right"
                                            placeholder="0.00"
                                            value={item.debit}
                                            onChange={e => updateLine(index, 'debit', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Input
                                            type="number"
                                            min="0"
                                            className="text-right"
                                            placeholder="0.00"
                                            value={item.credit}
                                            onChange={e => updateLine(index, 'credit', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button variant="ghost" size="sm" onClick={addLine} className="mt-2 text-primary">
                                + Add Line
                            </Button>
                        </div>

                        <div className="flex justify-end gap-8 px-4 font-semibold">
                            <span>Total Debit: {newJournal.items.reduce((sum, i) => sum + Number(i.debit || 0), 0).toFixed(2)}</span>
                            <span>Total Credit: {newJournal.items.reduce((sum, i) => sum + Number(i.credit || 0), 0).toFixed(2)}</span>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateJournal}>Post Entry</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Posted Journals</CardTitle>
                    <CardDescription>History of all posted transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full max-w-sm mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search journals..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-8"
                        />
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>No.</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Ref</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {journals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No journal entries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    journals.map(journal => {
                                        // Try to assume content for list view (e.g. Total Debits)
                                        // The backend query includes items, but we need to sum them if we strictly want 'Amount'
                                        const totalAmount = journal.items?.reduce((s, i) => s + Number(i.debit), 0) || 0;

                                        return (
                                            <TableRow key={journal.id}>
                                                <TableCell>{format(new Date(journal.entry_date), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {String(journal.id).substring(0, 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{journal.description}</div>
                                                    {/* We could show the first couple of accounts involved */}
                                                </TableCell>
                                                <TableCell>{journal.reference || '-'}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={journal.status === 'posted' ? 'default' : 'secondary'}>
                                                        {journal.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteJournal(journal.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
