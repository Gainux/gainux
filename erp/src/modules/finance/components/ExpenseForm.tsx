import React, { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { expenseService } from "../services/expenseService";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

import type { Expense } from "../types";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    amount: z.string().min(1, "Amount is required"), // Handle as string for input
    category: z.enum(['office', 'travel', 'equipment', 'utilities', 'marketing', 'other']),
    expenseDate: z.string().min(1, "Date is required"),
    vendor: z.string().min(1, "Vendor is required"),
    description: z.string().optional(),
    receiptUrl: z.string().optional(),
});

interface ExpenseFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    expenseToEdit?: Expense | null;
}

export default function ExpenseForm({ open, onOpenChange, onSuccess, expenseToEdit }: ExpenseFormProps) {
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            amount: "",
            category: "office",
            expenseDate: new Date().toISOString().split('T')[0],
            vendor: "",
            description: "",
            receiptUrl: "",
        },
    });

    useEffect(() => {
        if (expenseToEdit) {
            form.reset({
                title: expenseToEdit.title,
                amount: expenseToEdit.amount.toString(),
                category: expenseToEdit.category as any, // Cast to any or specific union to avoid TS error
                expenseDate: expenseToEdit.expenseDate
                    ? new Date(expenseToEdit.expenseDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0],
                vendor: expenseToEdit.vendor,
                description: expenseToEdit.description || "",
                receiptUrl: expenseToEdit.receiptUrl || "",
            });
        } else {
            form.reset({
                title: "",
                amount: "",
                category: "office",
                expenseDate: new Date().toISOString().split('T')[0],
                vendor: "",
                description: "",
                receiptUrl: "",
            });
        }
    }, [expenseToEdit, form, open]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const url = await expenseService.uploadReceipt(file);
            form.setValue("receiptUrl", url);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload receipt");
        } finally {
            setUploading(false);
        }
    };



    // START OF ACTUAL REPLACE
    const { profile } = useAuth();
    const orgId = profile?.org_id;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!orgId) {
            alert("Organization ID not found");
            return;
        }

        try {
            setSubmitting(true);
            const expenseData = {
                ...values,
                amount: parseFloat(values.amount),
                status: 'pending' as const,
                org_id: orgId, // Added org_id
            };

            if (expenseToEdit) {
                await expenseService.updateExpense(expenseToEdit.id, expenseData);
            } else {
                await expenseService.createExpense(expenseData);
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            alert("Failed to save expense: " + (error as any).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{expenseToEdit ? "Edit Expense" : "Add New Expense"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Office Supplies" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="expenseDate"
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
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="office">Office</SelectItem>
                                                <SelectItem value="travel">Travel</SelectItem>
                                                <SelectItem value="equipment">Equipment</SelectItem>
                                                <SelectItem value="utilities">Utilities</SelectItem>
                                                <SelectItem value="marketing">Marketing</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="vendor"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Vendor</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Amazon" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="receiptUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Receipt</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-4">
                                            <Input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={handleFileUpload}
                                                className="cursor-pointer"
                                                disabled={uploading}
                                            />
                                            {uploading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                        </div>
                                    </FormControl>
                                    {field.value && (
                                        <p className="text-xs text-green-600 mt-1">Receipt uploaded successfully</p>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Add details..." className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting || uploading}>
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {expenseToEdit ? "Update Expense" : "Create Expense"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
