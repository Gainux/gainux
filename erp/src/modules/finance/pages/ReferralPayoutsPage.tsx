/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export default function ReferralPayoutsPage() {
    const { formatAmount, symbol } = useCurrency();
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);
    const [, setLoading] = useState(true);

    // Credit Form State
    const [selectedReferrer, setSelectedReferrer] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [commissionRate, setCommissionRate] = useState("20");
    const [description, setDescription] = useState("");
    const [crediting, setCrediting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            // Fetch withdrawals
            const { data: wData } = await supabase
                .from('withdrawals')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch referrers (profiles)
            // Note: role='referrer' constraint is failing on backend, fetch all users for now
            const { data: pData } = await supabase
                .from('profiles')
                .select('id, auth_id, kyc_full_name, full_name, email, bank_account_number, ifsc_code, upi_id, role');

            if (pData) setProfiles(pData);

            if (wData && pData) {
                const stitched = wData.map((w: any) => {
                    const profile = pData.find((p: any) => p.auth_id === w.user_id || p.id === w.user_id);
                    return { ...w, profiles: profile || {} };
                });
                setWithdrawals(stitched);
            }


        } catch (error: any) {
            toast.error("Failed to load finance data: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    const handleProcessWithdrawal = async (id: string, userId: string, amount: number) => {
        try {
            const { error } = await supabase
                .from('withdrawals')
                .update({ status: 'completed' })
                .eq('id', id);

            if (error) throw error;

            // Ensure the referrer's transaction log shows this as completed
            const { error: txError } = await supabase
                .from('wallet_transactions')
                .update({ status: 'completed', description: 'Withdrawal (Completed)' })
                .eq('user_id', userId)
                .eq('type', 'debit')
                .eq('status', 'pending')
                .eq('amount', amount);

            if (txError) console.error("Failed to update transaction status:", txError);

            // Update local state
            setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'completed' } : w));
            toast.success("Withdrawal marked as completed");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleExportCSV = () => {
        const pending = withdrawals.filter(w => w.status === 'pending');
        if (pending.length === 0) {
            toast.info("No pending withdrawals to export.");
            return;
        }

        const headers = ["ID", "Referrer Name", "Amount", "Account No", "IFSC", "UPI", "Requested At"];
        const rows = pending.map(w => [
            w.id,
            w.profiles?.kyc_full_name || 'N/A',
            w.amount,
            w.profiles?.bank_account_number || '',
            w.profiles?.ifsc_code || '',
            w.profiles?.upi_id || '',
            new Date(w.created_at).toLocaleString()
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payouts_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleCreditWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReferrer || !paymentAmount || !commissionRate) {
            toast.error("Please fill all required fields");
            return;
        }

        const amount = Number(paymentAmount);
        const rate = Number(commissionRate) / 100;
        const commissionCuts = Math.round(amount * rate);

        try {
            setCrediting(true);

            // 1. Transaction record
            const { error: txError } = await supabase
                .from('wallet_transactions')
                .insert({
                    user_id: selectedReferrer,
                    type: 'credit',
                    amount: commissionCuts,
                    description: description || `Client Payment Split (${commissionRate}%)`,
                    status: 'completed'
                });

            if (txError) throw txError;

            // 2. Fetch current wallet balance
            const { data: walletData, error: walletFetchError } = await supabase
                .from('wallets')
                .select('balance, total_earned')
                .eq('user_id', selectedReferrer)
                .single();

            if (walletFetchError && walletFetchError.code !== 'PGRST116') throw walletFetchError;

            // 3. Upsert wallet balance
            const newBalance = (walletData?.balance || 0) + commissionCuts;
            const newEarned = (walletData?.total_earned || 0) + commissionCuts;

            const { error: walletUpdateError } = await supabase
                .from('wallets')
                .upsert({
                    user_id: selectedReferrer,
                    balance: newBalance,
                    total_earned: newEarned,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (walletUpdateError) throw walletUpdateError;

            toast.success(`Successfully credited ${formatAmount(commissionCuts)} to referrer's wallet!`);

            // Reset form
            setSelectedReferrer("");
            setPaymentAmount("");
            setDescription("");

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setCrediting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Finance Control Panel</h2>
                <p className="text-muted-foreground">Manage wallet credits and process referrer payouts.</p>
            </div>

            <Tabs defaultValue="payouts" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="payouts">Pending Payouts</TabsTrigger>
                    <TabsTrigger value="credit">Credit Wallets</TabsTrigger>
                </TabsList>

                <TabsContent value="payouts" className="space-y-4">
                    <div className="flex justify-between items-center bg-white p-4 border rounded-md">
                        <div>
                            <h3 className="font-semibold text-lg">Withdrawal Requests</h3>
                            <p className="text-sm text-muted-foreground">Approve and process bank transfers for referrers.</p>
                        </div>
                        <Button variant="outline" onClick={handleExportCSV}>
                            <Download className="mr-2 h-4 w-4" /> Export Pending CSV
                        </Button>
                    </div>

                    <div className="bg-white border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date Requested</TableHead>
                                    <TableHead>Referrer</TableHead>
                                    <TableHead>Amount ({symbol})</TableHead>
                                    <TableHead>Payment Details</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {withdrawals.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No withdrawal requests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    withdrawals.map((w) => (
                                        <TableRow key={w.id}>
                                            <TableCell>{format(new Date(w.created_at), "MMM d, yyyy")}</TableCell>
                                            <TableCell className="font-medium">{w.profiles?.kyc_full_name || 'N/A'}</TableCell>
                                            <TableCell className="font-bold">{formatAmount(w.amount)}</TableCell>
                                            <TableCell className="text-xs">
                                                {w.profiles?.upi_id && <div>UPI: {w.profiles.upi_id}</div>}
                                                {w.profiles?.bank_account_number && (
                                                    <div>Bank: {w.profiles.bank_account_number} <br /> IFSC: {w.profiles.ifsc_code}</div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={w.status === 'completed' ? 'default' : 'secondary'} className={w.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-100 text-orange-800'}>
                                                    {w.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {w.status === 'pending' ? (
                                                    <Button size="sm" onClick={() => handleProcessWithdrawal(w.id, w.user_id, w.amount)}>
                                                        Mark Paid
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="ghost" disabled>
                                                        Paid
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="credit">
                    <div className="max-w-xl bg-white border rounded-xl p-6 sm:p-8">
                        <div className="mb-6 border-b pb-4">
                            <h3 className="font-semibold text-xl">Credit Referrer Wallet</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Register a client payment manually and credit the calculated commission directly.
                            </p>
                        </div>

                        <form onSubmit={handleCreditWallet} className="space-y-6">
                            <div>
                                <Label>Select Referrer *</Label>
                                <Select value={selectedReferrer} onValueChange={setSelectedReferrer}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Search or select a referrer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profiles.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.kyc_full_name || p.full_name || 'Unnamed'} ({p.email}) - {p.role}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="paymentAmount">Received Base Amount ({symbol}) *</Label>
                                    <Input
                                        id="paymentAmount"
                                        type="number"
                                        placeholder="e.g. 50000"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="commissionRate">Commission Rate (%) *</Label>
                                    <Input
                                        id="commissionRate"
                                        type="number"
                                        value={commissionRate}
                                        onChange={(e) => setCommissionRate(e.target.value)}
                                        min="1" max="100"
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Milestone / Description</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g. 50% Advance for E-commerce App"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" size="lg" disabled={crediting}>
                                    {crediting ? "Processing..." : "Credit Commission to Wallet"}
                                </Button>
                            </div>
                        </form>

                        {paymentAmount && commissionRate && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800 font-medium">
                                    Preview: Will credit {formatAmount(Math.round(Number(paymentAmount) * (Number(commissionRate) / 100)))} to the selected referrer's wallet.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
