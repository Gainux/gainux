import { useState, useEffect } from "react";
import { Plus, Building2, ArrowRightLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bankService } from "../services/bankService";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import BankAccountForm from "../components/BankAccountForm";
import TransferForm from "../components/TransferForm";
import type { BankAccount } from "../types";

import { useNavigate } from "react-router-dom";

export default function BankList() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    useEffect(() => {
        if (profile?.org_id) {
            fetchAccounts();
        }
    }, [profile?.org_id]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await bankService.getBankAccounts(profile?.org_id || "");
            setAccounts(data);
        } catch (error) {
            console.error("Failed to fetch bank accounts", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Cash & Bank</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" className="hidden md:flex" onClick={() => setIsTransferOpen(true)}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Funds
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Account
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {loading ? (
                    <div>Loading accounts...</div>
                ) : accounts.length === 0 ? (
                    <div className="col-span-3 text-center py-10 text-muted-foreground border rounded-md border-dashed">
                        No bank accounts found. Add one to get started.
                    </div>
                ) : (
                    accounts.map((account) => (
                        <Card
                            key={account.id}
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => navigate(`/finance/banking/${account.id}`)}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {account.bankName || "Bank Account"}
                                </CardTitle>
                                {account.bankName ? <Building2 className="h-4 w-4 text-muted-foreground" /> : <CreditCard className="h-4 w-4 text-muted-foreground" />}
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(account.balance, account.currency)}</div>
                                <p className="text-xs text-muted-foreground">
                                    {account.accountName}
                                    {account.accountNumber && ` •••• ${account.accountNumber.slice(-4)}`}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <BankAccountForm
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={fetchAccounts}
            />

            <TransferForm
                open={isTransferOpen}
                onOpenChange={setIsTransferOpen}
                onSuccess={fetchAccounts}
                accounts={accounts}
            />
        </div>
    );
}
