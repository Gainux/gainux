
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { budgetService } from '../services/budgetService';
import type { Budget, BudgetItem, Account } from '../types';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase'; // Or financeService

export default function BudgetDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [budget, setBudget] = useState<(Budget & { items: BudgetItem[] }) | null>(null);
    const [loading, setLoading] = useState(true);
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Quick edit state
    const [editingItems, setEditingItems] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (id) {
            loadBudget(id);
            loadAccounts();
        }
    }, [id]);

    const loadBudget = async (budgetId: string) => {
        try {
            setLoading(true);
            const data = await budgetService.getBudgetById(budgetId);
            setBudget(data);
            // Initialize editing items with existing amounts
            const initialEdits: any = {};
            data.items.forEach(item => {
                initialEdits[item.account_id] = item.amount;
            });
            setEditingItems(initialEdits);

        } catch (error) {
            console.error('Failed to load budget', error);
            toast.error('Failed to load budget details');
        } finally {
            setLoading(false);
        }
    };

    const loadAccounts = async () => {
        // Fetch Expense and Revenue accounts
        const { data, error } = await supabase
            .from('accounts')
            .select('*')
            .in('type', ['expense', 'revenue'])
            .order('code');

        if (error) {
            console.error('Failed to load accounts', error);
        } else {
            setAccounts(data || []);
        }
    };

    const handleAmountChange = (accountId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        setEditingItems(prev => ({
            ...prev,
            [accountId]: numValue
        }));
    };

    const handleSave = async () => {
        if (!budget) return;

        try {
            toast.loading('Saving budget allocations...');

            // For each account in editingItems, update or verify budget item
            // This is a naive implementation; optimized would be batch upsert.

            const promises = Object.keys(editingItems).map(async (accountId) => {
                const amount = editingItems[accountId];
                const existingItem = budget.items.find(i => i.account_id === accountId);

                if (existingItem) {
                    if (existingItem.amount !== amount) {
                        return budgetService.updateBudgetItem(existingItem.id, amount);
                    }
                } else if (amount > 0) {
                    // Create new
                    return budgetService.addBudgetItem({
                        budget_id: budget.id,
                        account_id: accountId,
                        amount: amount,
                        period_type: 'total'
                    });
                }
            });

            await Promise.all(promises);
            toast.dismiss();
            toast.success('Budget saved successfully');
            loadBudget(budget.id); // Reload to get fresh data
        } catch (error) {
            console.error('Failed to save budget', error);
            toast.error('Failed to save budget');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!budget) return <div>Budget not found</div>;

    const totalBudgeted = Object.values(editingItems).reduce((sum, val) => sum + val, 0);

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 md:pt-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/finance/budgeting')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{budget.name}</h1>
                    <p className="text-muted-foreground">
                        {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm text-muted-foreground">Total Budgeted</div>
                        <div className="text-xl font-bold">{formatCurrency(totalBudgeted, 'INR')}</div>
                    </div>
                    <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Allocations</CardTitle>
                    <CardDescription>Allocate budget amounts to accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Account Code</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Budget Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map((account) => (
                                <TableRow key={account.id}>
                                    <TableCell className="font-mono">{account.code}</TableCell>
                                    <TableCell>{account.name}</TableCell>
                                    <TableCell>
                                        <span className={`capitalize px-2 py-1 rounded text-xs ${account.type === 'revenue' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {account.type}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end">
                                            <Input
                                                type="number"
                                                className="w-32 text-right"
                                                value={editingItems[account.id] || ''}
                                                onChange={(e) => handleAmountChange(account.id, e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
