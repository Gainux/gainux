import { useState, useEffect } from "react";
import { RefreshCw, Plus, Pencil, Trash2, Pause, Play, XCircle, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { format, addWeeks, addMonths, addQuarters, addYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { recurringExpenseService } from "../services/recurringExpenseService";
import { crmService } from "@/modules/crm/services/crmService";
import type { RecurringExpense, RecurringFrequency, RecurringStatus } from "../types";
import type { Company } from "@/modules/crm/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "yearly", label: "Yearly" },
];

const STATUS_META: Record<RecurringStatus, { label: string; className: string }> = {
    active: { label: "Active", className: "bg-green-100 text-green-700" },
    paused: { label: "Paused", className: "bg-yellow-100 text-yellow-700" },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
    completed: { label: "Completed", className: "bg-blue-100 text-blue-700" },
};

function computeNextDate(startDate: string, frequency: RecurringFrequency, paymentDay: number): string {
    const today = new Date();
    let next = new Date(startDate);
    while (next <= today) {
        if (frequency === "weekly") next = addWeeks(next, 1);
        else if (frequency === "monthly") next = addMonths(next, 1);
        else if (frequency === "quarterly") next = addQuarters(next, 1);
        else next = addYears(next, 1);
    }
    if (frequency !== "weekly") {
        next.setDate(Math.min(paymentDay, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    }
    return next.toISOString().split("T")[0];
}

const formatCurrency = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

// ─── empty form ──────────────────────────────────────────────────────────────

const emptyForm = (): Omit<RecurringExpense, "id" | "org_id" | "occurrences_completed" | "created_at" | "updated_at" | "vendor"> => ({
    vendor_id: "",
    description: "",
    amount: 0,
    currency: "INR",
    frequency: "monthly",
    payment_day: 1,
    start_date: new Date().toISOString().split("T")[0],
    end_date: undefined,
    occurrences: undefined,
    status: "active",
    tax_rate: 0,
    notes: "",
    next_payment_date: undefined,
});

// ─── component ───────────────────────────────────────────────────────────────

export default function RecurringExpensesPage() {
    const { profile } = useAuth();
    const orgId = profile?.org_id;

    const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
    const [vendors, setVendors] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (orgId) loadData();
    }, [orgId]);

    const loadData = async () => {
        if (!orgId) return;
        try {
            setLoading(true);
            const [expensesResult, vendorsResult] = await Promise.allSettled([
                recurringExpenseService.getAll(orgId),
                crmService.getCompanies(orgId),
            ]);
            if (expensesResult.status === "fulfilled") setExpenses(expensesResult.value);
            else { toast.error("Failed to load recurring expenses"); console.error(expensesResult.reason); }
            if (vendorsResult.status === "fulfilled") setVendors(vendorsResult.value);
            else { toast.error("Failed to load vendors"); console.error(vendorsResult.reason); }
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm());
        setErrors({});
        setDialogOpen(true);
    };

    const openEdit = (e: RecurringExpense) => {
        setEditingId(e.id);
        setErrors({});
        setForm({
            vendor_id: e.vendor_id,
            description: e.description,
            amount: e.amount,
            currency: e.currency,
            frequency: e.frequency,
            payment_day: e.payment_day,
            start_date: e.start_date,
            end_date: e.end_date,
            occurrences: e.occurrences,
            status: e.status,
            tax_rate: e.tax_rate,
            notes: e.notes || "",
            next_payment_date: e.next_payment_date,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!orgId) { toast.error("Organization not found. Please refresh and try again."); return; }

        const newErrors: Record<string, string> = {};
        if (!form.vendor_id) newErrors.vendor_id = "Please select a vendor";
        if (!form.description.trim()) newErrors.description = "Description is required";
        if (form.amount <= 0) newErrors.amount = "Amount must be greater than 0";
        if (!form.start_date) newErrors.start_date = "Start date is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});

        try {
            setSaving(true);
            const nextDate = computeNextDate(form.start_date, form.frequency, form.payment_day);
            const payload = { ...form, next_payment_date: nextDate };

            if (editingId) {
                const updated = await recurringExpenseService.update(editingId, payload);
                setExpenses(prev => prev.map(e => e.id === editingId ? updated : e));
                toast.success("Recurring expense updated");
            } else {
                const created = await recurringExpenseService.create(orgId, payload);
                setExpenses(prev => [created, ...prev]);
                toast.success("Recurring expense added");
            }
            setDialogOpen(false);
        } catch (err: any) {
            toast.error(err.message || "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (id: string, status: RecurringStatus) => {
        try {
            const updated = await recurringExpenseService.updateStatus(id, status);
            setExpenses(prev => prev.map(e => e.id === id ? updated : e));
            toast.success(`Marked as ${STATUS_META[status].label}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this recurring expense?")) return;
        try {
            await recurringExpenseService.delete(id);
            setExpenses(prev => prev.filter(e => e.id !== id));
            toast.success("Deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    const setField = (key: keyof typeof form, value: any) => {
        setForm(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
    };

    // ── totals ────────────────────────────────────────────────────────────────
    const activeExpenses = expenses.filter(e => e.status === "active");
    const totalPayable = activeExpenses.reduce((sum, e) => sum + e.amount + e.amount * (e.tax_rate / 100), 0);

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight">Recurring Expenses</h2>
                    <p className="text-muted-foreground">Manage automatic recurring payables to vendors.</p>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-5">
                {/* Total Payable highlight */}
                <Card className="md:col-span-1 border-destructive/40 bg-destructive/5">
                    <CardHeader className="pb-2">
                        <CardDescription className="flex items-center gap-1">
                            <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                            Total Payable / cycle
                        </CardDescription>
                        <CardTitle className="text-xl text-destructive">
                            {formatCurrency(totalPayable)}
                        </CardTitle>
                    </CardHeader>
                </Card>

                {(["active", "paused", "cancelled", "completed"] as RecurringStatus[]).map(s => (
                    <Card key={s}>
                        <CardHeader className="pb-2">
                            <CardDescription className="capitalize">{s}</CardDescription>
                            <CardTitle className="text-2xl">
                                {expenses.filter(e => e.status === s).length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Recurring Expenses</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 text-center text-muted-foreground">Loading...</div>
                    ) : expenses.length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed rounded-lg">
                            <RefreshCw className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No recurring expenses yet.</p>
                            <Button className="mt-4" onClick={openAdd}>
                                <Plus className="mr-2 h-4 w-4" /> Add Expense
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Next Payment</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses.map(e => {
                                        const meta = STATUS_META[e.status];
                                        const taxAmount = e.amount * (e.tax_rate / 100);
                                        const total = e.amount + taxAmount;
                                        return (
                                            <TableRow key={e.id}>
                                                <TableCell className="font-medium">
                                                    {e.vendor?.name ?? e.vendor_id}
                                                </TableCell>
                                                <TableCell className="max-w-[180px] truncate">
                                                    {e.description}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold">{formatCurrency(total, e.currency)}</div>
                                                    {e.tax_rate > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            +{e.tax_rate}% tax
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="capitalize">{e.frequency}</TableCell>
                                                <TableCell>
                                                    {e.next_payment_date
                                                        ? format(new Date(e.next_payment_date), "dd MMM yyyy")
                                                        : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {format(new Date(e.start_date), "dd MMM yyyy")}
                                                        {e.end_date && (
                                                            <span className="text-muted-foreground">
                                                                {" "}→ {format(new Date(e.end_date), "dd MMM yyyy")}
                                                            </span>
                                                        )}
                                                        {e.occurrences && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {e.occurrences_completed}/{e.occurrences} completed
                                                            </div>
                                                        )}
                                                        {!e.end_date && !e.occurrences && (
                                                            <div className="text-xs text-muted-foreground">Indefinite</div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={meta.className}>
                                                        {meta.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">Actions</Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEdit(e)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {e.status === "active" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(e.id, "paused")}>
                                                                    <Pause className="mr-2 h-4 w-4" /> Pause
                                                                </DropdownMenuItem>
                                                            )}
                                                            {e.status === "paused" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(e.id, "active")}>
                                                                    <Play className="mr-2 h-4 w-4" /> Resume
                                                                </DropdownMenuItem>
                                                            )}
                                                            {e.status !== "cancelled" && e.status !== "completed" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(e.id, "cancelled")}>
                                                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                                                </DropdownMenuItem>
                                                            )}
                                                            {e.status !== "completed" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(e.id, "completed")}>
                                                                    <RefreshCw className="mr-2 h-4 w-4" /> Mark Completed
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDelete(e.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Recurring Expense" : "Add Recurring Expense"}</DialogTitle>
                        <DialogDescription>
                            Configure automatic recurring payable to a vendor.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Vendor */}
                        <div className="space-y-2">
                            <Label>Vendor *</Label>
                            <Select value={form.vendor_id} onValueChange={v => setField("vendor_id", v)}>
                                <SelectTrigger className={errors.vendor_id ? "border-destructive" : ""}>
                                    <SelectValue placeholder="Select vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendors.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No vendors found. Add companies in CRM first.
                                        </div>
                                    ) : (
                                        vendors.map(v => (
                                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {errors.vendor_id && <p className="text-xs text-destructive">{errors.vendor_id}</p>}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Input
                                placeholder="e.g. Monthly SaaS subscription"
                                value={form.description}
                                onChange={e => setField("description", e.target.value)}
                                className={errors.description ? "border-destructive" : ""}
                            />
                            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                        </div>

                        {/* Amount + Currency */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2 space-y-2">
                                <Label>Amount *</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={form.amount}
                                    onChange={e => setField("amount", parseFloat(e.target.value) || 0)}
                                    className={errors.amount ? "border-destructive" : ""}
                                />
                                {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Currency</Label>
                                <Select value={form.currency} onValueChange={v => setField("currency", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {["INR", "USD", "EUR", "GBP", "AED"].map(c => (
                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Tax */}
                        <div className="space-y-2">
                            <Label>Tax Rate (%)</Label>
                            <Input
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                value={form.tax_rate}
                                onChange={e => setField("tax_rate", parseFloat(e.target.value) || 0)}
                            />
                        </div>

                        {/* Frequency + Payment Day */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Frequency *</Label>
                                <Select value={form.frequency} onValueChange={v => setField("frequency", v as RecurringFrequency)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {FREQUENCIES.map(f => (
                                            <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Payment Day (1–31)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={31}
                                    value={form.payment_day}
                                    onChange={e => setField("payment_day", parseInt(e.target.value) || 1)}
                                />
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Input
                                type="date"
                                value={form.start_date}
                                onChange={e => setField("start_date", e.target.value)}
                                className={errors.start_date ? "border-destructive" : ""}
                            />
                            {errors.start_date && <p className="text-xs text-destructive">{errors.start_date}</p>}
                        </div>

                        {/* End Date (optional) */}
                        <div className="space-y-2">
                            <Label>End Date <span className="text-muted-foreground text-xs">(optional)</span></Label>
                            <Input
                                type="date"
                                value={form.end_date || ""}
                                onChange={e => setField("end_date", e.target.value || undefined)}
                            />
                        </div>

                        {/* Occurrences */}
                        <div className="space-y-2">
                            <Label>
                                Max Occurrences{" "}
                                <span className="text-muted-foreground text-xs">(optional — leave blank for indefinite)</span>
                            </Label>
                            <Input
                                type="number"
                                min={1}
                                placeholder="e.g. 12"
                                value={form.occurrences ?? ""}
                                onChange={e => setField("occurrences", e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={v => setField("status", v as RecurringStatus)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {(Object.keys(STATUS_META) as RecurringStatus[]).map(s => (
                                        <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                rows={2}
                                placeholder="Optional notes..."
                                value={form.notes || ""}
                                onChange={e => setField("notes", e.target.value)}
                            />
                        </div>

                        {/* Live preview */}
                        {form.amount > 0 && form.start_date && (
                            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                                <p className="font-medium">Preview</p>
                                <p>
                                    Paying{" "}
                                    <span className="font-semibold">
                                        {formatCurrency(form.amount + form.amount * (form.tax_rate / 100), form.currency)}
                                    </span>{" "}
                                    ({formatCurrency(form.amount, form.currency)} + {form.tax_rate}% tax){" "}
                                    <span className="capitalize">{form.frequency}</span>
                                </p>
                                <p className="text-muted-foreground">
                                    Next payment: {(() => {
                                        try {
                                            return format(new Date(computeNextDate(form.start_date, form.frequency, form.payment_day)), "dd MMM yyyy");
                                        } catch {
                                            return "—";
                                        }
                                    })()}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : editingId ? "Update" : "Add Expense"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
