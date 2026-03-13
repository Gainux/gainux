/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Wallet,
    ArrowDownRight,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";

export default function WalletPage() {
    const [wallet, setWallet] = useState({ balance: 0, total_earned: 0 });
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        loadWalletData();
    }, []);

    async function loadWalletData() {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Wallet balances
            const { data: walletData } = await supabase
                .from('wallets')
                .select('balance, total_earned')
                .eq('user_id', user.id)
                .single();

            if (walletData) {
                setWallet(walletData);
            }

            // Fetch Transactions
            const { data: txData } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (txData) {
                setTransactions(txData);
            }
        } catch (error) {
            console.error("Wallet Load Error:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(withdrawAmount);

        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }

        if (amount > wallet.balance) {
            toast.error("Insufficient balance");
            return;
        }

        if (amount < 500) {
            toast.error("Minimum withdrawal amount is ₹500");
            return;
        }

        try {
            setIsSubmitting(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Create withdrawal request
            const { error: withdrawError } = await supabase
                .from('withdrawals')
                .insert({
                    user_id: user.id,
                    amount: amount,
                    status: 'pending'
                });

            if (withdrawError) throw withdrawError;

            // 2. We should ideally deduct from wallet balance here or via database trigger.
            // We'll simulate updating the local state since we don't have triggers guaranteed right now.
            const newBalance = wallet.balance - amount;

            const { error: updateError } = await supabase
                .from('wallets')
                .update({ balance: newBalance })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            // 3. Add a transaction record for the withdrawal
            await supabase
                .from('wallet_transactions')
                .insert({
                    user_id: user.id,
                    type: 'debit',
                    amount: amount,
                    description: 'Withdrawal Request (Pending)',
                    status: 'pending'
                });

            toast.success("Withdrawal request submitted successfully!");
            setDialogOpen(false);
            setWithdrawAmount("");
            loadWalletData(); // Refresh data
        } catch (error: any) {
            toast.error(error.message || "Failed to process withdrawal");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading wallet...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Virtual Wallet</h2>
                    <p className="text-muted-foreground mt-1">Manage your earnings and request payouts.</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="w-full sm:w-auto transition-all">
                            Request Withdrawal
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Withdraw Funds</DialogTitle>
                            <DialogDescription>
                                Transfers may take 2-3 business days. Minimum amount is ₹500.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleWithdraw} className="space-y-4 pt-4">
                            <div>
                                <Label htmlFor="amount">Amount (₹)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="e.g. 5000"
                                    min="500"
                                    max={wallet.balance}
                                    step="100"
                                />
                                <p className="text-xs text-muted-foreground mt-2">Available Balance: ₹{wallet.balance.toLocaleString()}</p>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button type="button" variant="outline" className="mr-3" onClick={() => setDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Processing..." : "Confirm Withdrawal"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none bg-primary text-primary-foreground shadow-sm group">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-primary-foreground/80">Available Balance</CardTitle>
                        <Wallet className="h-5 w-5 opacity-80" />
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-5xl font-extrabold tracking-tight">₹{wallet.balance.toLocaleString()}</div>
                        <p className="text-sm font-medium opacity-80 mt-2 flex items-center gap-1.5 pt-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            Ready to be withdrawn
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass-card hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Earnings</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="text-4xl font-bold tracking-tight">₹{wallet.total_earned.toLocaleString()}</div>
                        <p className="text-sm font-medium text-muted-foreground mt-2">Total commissions earned on Gainux</p>
                    </CardContent>
                </Card>
            </div >

            <Card className="glass-card">
                <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>A ledger of your commissions and withdrawals.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        {transactions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <p className="font-medium text-foreground">No transactions yet</p>
                                <p className="text-xs mt-1">Submit leads to start earning!</p>
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between border-b border-border/40 pb-5 last:border-0 last:pb-0 hover:bg-secondary/30 p-2 -mx-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl shadow-sm ${tx.type === 'credit' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                                            {tx.type === 'credit' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-semibold text-foreground">{tx.description}</p>
                                            <p className="text-xs font-medium text-muted-foreground mt-0.5">
                                                {format(new Date(tx.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-bold tracking-tight ${tx.type === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                                            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                        </p>
                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                            {tx.status === 'completed' ? (
                                                <><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /><span className="text-xs font-medium text-green-600">Completed</span></>
                                            ) : (
                                                <><Clock className="h-3.5 w-3.5 text-amber-500" /><span className="text-xs font-medium text-amber-600">Pending</span></>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
