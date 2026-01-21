import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { financeService } from '../services/financeService';
import type { Account } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FinancialReports() {
    const { profile } = useAuth();
    const orgId = profile?.org_id;

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTrialBalance = async () => {
        if (!orgId) return;
        setIsLoading(true);
        try {
            const data = await financeService.getTrialBalance(orgId);
            setAccounts(data);
        } catch (error) {
            console.error('Failed to fetch trial balance:', error);
            toast.error('Failed to load Trial Balance');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTrialBalance();
    }, [orgId]);

    const totalDebits = accounts.reduce((sum, acc) => {
        return sum + (acc.current_balance && acc.current_balance > 0 ? acc.current_balance : 0);
    }, 0);

    const totalCredits = accounts.reduce((sum, acc) => {
        return sum + (acc.current_balance && acc.current_balance < 0 ? Math.abs(acc.current_balance) : 0);
    }, 0);

    const handleExportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Trial Balance', 14, 22);

        doc.setFontSize(11);
        doc.text(`As of ${format(new Date(), 'MMMM dd, yyyy')}`, 14, 30);

        const tableBody = accounts
            .filter(acc => Math.abs(acc.current_balance || 0) >= 0.01 || acc.is_active)
            .map(acc => {
                const balance = acc.current_balance || 0;
                const isDebit = balance > 0;
                const isCredit = balance < 0;
                return [
                    acc.code,
                    acc.name,
                    acc.type,
                    isDebit ? balance.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-',
                    isCredit ? Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'
                ];
            });

        // Add Total Row
        tableBody.push([
            '',
            'Total',
            '',
            totalDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            totalCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })
        ]);

        autoTable(doc, {
            head: [['Code', 'Account Name', 'Type', 'Debit', 'Credit']],
            body: tableBody,
            startY: 40,
            theme: 'striped',
            headStyles: { fillColor: [66, 66, 66] },
        });

        doc.save(`Trial_Balance_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Financial Reports</h2>
                    <p className="text-sm text-muted-foreground">View your organization's financial health.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchTrialBalance}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" onClick={handleExportPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Trial Balance</CardTitle>
                    <CardDescription>
                        As of {format(new Date(), 'MMMM dd, yyyy')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Account Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {accounts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No data available.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    accounts.map(account => {
                                        const balance = account.current_balance || 0;
                                        // Simple Display: Positive = Debit, Negative = Credit
                                        const isDebit = balance > 0;
                                        const isCredit = balance < 0; // Strictly less than 0
                                        const displayDebit = isDebit ? balance : 0;
                                        const displayCredit = isCredit ? Math.abs(balance) : 0;

                                        // Filter out zero balance accounts if desired, but TB usually shows all active
                                        if (Math.abs(balance) < 0.01 && !account.is_active) return null;

                                        return (
                                            <TableRow key={account.id}>
                                                <TableCell className="font-medium">{account.code}</TableCell>
                                                <TableCell>{account.name}</TableCell>
                                                <TableCell className="capitalize text-muted-foreground">{account.type}</TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {displayDebit > 0 ? displayDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {displayCredit > 0 ? displayCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '-'}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                                <TableRow className="bg-muted/50 font-bold">
                                    <TableCell colSpan={3} className="text-right">Total</TableCell>
                                    <TableCell className="text-right font-mono text-primary">
                                        {totalDebits.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-primary">
                                        {totalCredits.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
