import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { bankService } from "../services/bankService";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, cn } from "@/lib/utils";
import type { BankAccount } from "../types";
import { format } from "date-fns";
import { TransactionForm } from "../components/TransactionForm";

// We need a specific type for Bank Transactions which are flattened JEs
interface BankTransaction {
    id: string;
    date: string;
    description: string;
    reference: string;
    amount: number; // Positive for Debit (Deposit), Negative for Credit (Withdrawal) for Asset accounts? 
    // Actually for Asset: Debit is Increase (+), Credit is Decrease (-)
    type: 'deposit' | 'withdrawal';
    balance_after?: number; // Calculated running balance
}

export default function BankDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();

    const [account, setAccount] = useState<BankAccount | null>(null);
    const [transactions, setTransactions] = useState<BankTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [txnType, setTxnType] = useState<'deposit' | 'withdrawal'>('deposit');

    useEffect(() => {
        if (profile?.org_id && id) {
            fetchDetails();
        }
    }, [profile?.org_id, id]);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            // 1. Get Account Details
            const accounts = await bankService.getBankAccounts(profile?.org_id || "");
            const currentAccount = accounts.find(a => a.id === id);

            if (!currentAccount) {
                navigate('/finance/banking');
                return;
            }
            setAccount(currentAccount);

            // 2. Get Transactions
            if (currentAccount.glAccountId) {
                const txns = await bankService.getBankTransactions(profile?.org_id || "", currentAccount.glAccountId);
                // Cast the type or ensure usage matches
                setTransactions(txns as BankTransaction[]);
            }

        } catch (error) {
            console.error("Failed to fetch bank details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenTransaction = (type: 'deposit' | 'withdrawal') => {
        setTxnType(type);
        setShowTransactionForm(true);
    };

    if (loading) return <div className="p-8" > Loading...</div>;
    if (!account) return <div className="p-8" > Account not found </div>;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6" >
            <div className="flex items-center space-x-2 mb-4" >
                <Button variant="ghost" size="sm" onClick={() => navigate('/finance/banking')
                }>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back
                </Button>
            </div>

            < div className="flex items-center justify-between" >
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight" > {account.bankName} - {account.accountName} </h2>
                    < p className="text-muted-foreground" > {account.currency} •••• {account.accountNumber?.slice(-4)} </p>
                </div>
                < div className="flex space-x-2" >
                    <Button
                        className="bg-red-600 hover:bg-red-700 text-white border-none"
                        onClick={() => handleOpenTransaction('withdrawal')}
                    >
                        <Minus className="mr-2 h-4 w-4" /> Withdraw
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700 text-white border-none"
                        onClick={() => handleOpenTransaction('deposit')}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Deposit
                    </Button>
                </div>
            </div>

            < div className="grid gap-4 md:grid-cols-3" >
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2" >
                        <CardTitle className="text-sm font-medium" > Current Balance </CardTitle>
                    </CardHeader>
                    < CardContent >
                        <div className="text-lg md:text-2xl font-bold" > {formatCurrency(account.balance, account.currency)} </div>
                    </CardContent>
                </Card>
                {/* Add more stats later if needed */}
            </div>

            < Card >
                <CardHeader>
                    <CardTitle>Transaction History </CardTitle>
                </CardHeader>
                < CardContent >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date </TableHead>
                                < TableHead > Description </TableHead>
                                < TableHead > Reference </TableHead>
                                < TableHead className="text-right" > Amount </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground" >
                                            No transactions found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((txn) => (
                                        <TableRow key={txn.id} >
                                            <TableCell>{format(new Date(txn.date), 'MMM dd, yyyy')} </TableCell>
                                            < TableCell > {txn.description} </TableCell>
                                            < TableCell className="font-mono text-xs" > {txn.reference} </TableCell>
                                            < TableCell className={
                                                cn(
                                                    "text-right font-medium",
                                                    txn.type === 'deposit' ? "text-green-600" : "text-red-600"
                                                )
                                            } >
                                                {txn.type === 'deposit' ? '+' : '-'}{formatCurrency(Math.abs(txn.amount), account.currency)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {account.glAccountId && (
                <TransactionForm
                    open={showTransactionForm}
                    onOpenChange={setShowTransactionForm}
                    onSuccess={fetchDetails}
                    bankAccountId={account.id}
                    bankGlAccountId={account.glAccountId}
                    bankAccountName={account.accountName}
                    preselectedType={txnType}
                />
            )}
        </div>
    );
}
