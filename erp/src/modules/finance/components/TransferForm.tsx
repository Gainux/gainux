import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { bankService } from "../services/bankService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import type { BankAccount } from "../types";

const formSchema = z.object({
    fromAccountId: z.string().min(1, "Source account is required"),
    toAccountId: z.string().min(1, "Destination account is required"),
    amount: z.string().transform((val) => parseFloat(val) || 0).refine((val) => val > 0, "Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    description: z.string().optional(),
});

interface TransferFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    accounts: BankAccount[];
}

export default function TransferForm({
    open,
    onOpenChange,
    onSuccess,
    accounts
}: TransferFormProps) {
    const { profile } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<any>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fromAccountId: "",
            toAccountId: "",
            amount: 0 as any, // handled by transform
            date: new Date().toISOString().split('T')[0],
            description: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!profile?.org_id) return;
        if (values.fromAccountId === values.toAccountId) {
            form.setError("toAccountId", { message: "Cannot transfer to the same account" });
            return;
        }

        try {
            setSubmitting(true);
            await bankService.transferFunds(
                profile.org_id,
                values.fromAccountId,
                values.toAccountId,
                values.amount,
                values.date,
                values.description
            );
            toast.success("Funds transferred successfully");
            form.reset();
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to transfer funds");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Transfer Funds</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="fromAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>From Account</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Source" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id}>
                                                        {acc.accountName} ({acc.currency})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control as any}
                                name="toAccountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>To Account</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Destination" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map(acc => (
                                                    <SelectItem key={acc.id} value={acc.id} disabled={acc.id === form.watch('fromAccountId')}>
                                                        {acc.accountName} ({acc.currency})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
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
                            <FormField
                                control={form.control as any}
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
                        </div>

                        <FormField
                            control={form.control as any}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Monthly allocation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Transferring..." : "Transfer Funds"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
