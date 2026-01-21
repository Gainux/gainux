import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { financeService } from "../services/financeService";
import { toast } from "sonner";
import type { Account } from "../types";
import { supabase } from "../../../lib/supabase";

const formSchema = z.object({
    type: z.enum(["deposit", "withdrawal"]),
    amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    description: z.string().min(1, "Description is required"),
    contraAccountId: z.string().min(1, "Account is required"), // The other side of ledger
});

interface TransactionFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    bankAccountId: string;
    bankGlAccountId: string;
    bankAccountName: string;
    preselectedType?: 'deposit' | 'withdrawal';
}

export function TransactionForm({
    open,
    onOpenChange,
    onSuccess,
    bankAccountId,
    bankGlAccountId,
    bankAccountName,
    preselectedType = 'deposit'
}: TransactionFormProps) {
    const { profile } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: preselectedType,
            date: new Date().toISOString().split('T')[0],
            description: "",
            amount: 0,
        },
    });

    useEffect(() => {
        if (open) {
            form.reset({
                type: preselectedType,
                date: new Date().toISOString().split('T')[0],
                description: "",
                amount: 0,
                contraAccountId: "",
            });
            fetchAccounts();
        }
    }, [open, preselectedType]);

    const fetchAccounts = async () => {
        if (!profile?.org_id) return;
        try {
            // Fetch all accounts to select from (Income, Expense, Liability, Equity, other Assets)
            // Maybe exclude the current bank account itself
            const data = await financeService.getAccounts(profile.org_id);
            setAccounts(data.filter(a => a.id !== bankGlAccountId));
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!profile?.org_id) return;

        try {
            setSubmitting(true);

            // Determine Debits and Credits
            // Deposit: Debit Bank (Increase Asset), Credit Contra Account
            // Withdrawal: Credit Bank (Decrease Asset), Debit Contra Account

            const isDeposit = values.type === 'deposit';
            const bankEntry = {
                account_id: bankGlAccountId,
                debit: isDeposit ? values.amount : 0,
                credit: isDeposit ? 0 : values.amount,
                description: values.description
            };

            const contraEntry = {
                account_id: values.contraAccountId,
                debit: isDeposit ? 0 : values.amount,
                credit: isDeposit ? values.amount : 0,
                description: values.description
            };

            // 1. Create Journal Entry
            await financeService.createJournalEntry(
                {
                    org_id: profile.org_id,
                    entry_date: values.date,
                    description: values.description,
                    reference: `MAN-${Date.now()}`,
                    status: 'posted'
                },
                [bankEntry, contraEntry]
            );

            // 2. Update Bank Balance Cache
            // We update the local balance record. For high volume, use an RPC or triggers.
            const { data: currentBank } = await supabase.from('bank_accounts').select('balance').eq('id', bankAccountId).single();
            if (currentBank) {
                const newBalance = Number(currentBank.balance) + (isDeposit ? values.amount : -values.amount);
                await supabase.from('bank_accounts').update({ balance: newBalance }).eq('id', bankAccountId);
            }

            toast.success("Transaction recorded successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to record transaction");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter accounts based on type to make it easier? 
    // Or just show all grouped?
    // Let's Group by Type
    const groupedAccounts = accounts.reduce((acc, curr) => {
        const type = curr.type.charAt(0).toUpperCase() + curr.type.slice(1);
        if (!acc[type]) acc[type] = [];
        acc[type].push(curr);
        return acc;
    }, {} as Record<string, Account[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{form.watch('type') === 'deposit' ? 'Record Deposit' : 'Record Withdrawal'}</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        Enter the details of the {form.watch('type')} below.
                    </div>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="deposit">Deposit (In)</SelectItem>
                                            <SelectItem value="withdrawal">Withdrawal (Out)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Bank Fees, Interest" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="contraAccountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {form.watch('type') === 'deposit' ? 'From Account (Income/Equity)' : 'To Account (Expense/Liability)'}
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[200px]">
                                            {Object.entries(groupedAccounts).map(([type, accs]) => (
                                                <div key={type}>
                                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                                        {type}
                                                    </div>
                                                    {accs.map((acc) => (
                                                        <SelectItem key={acc.id} value={acc.id}>
                                                            {acc.code} - {acc.name}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Transaction"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
