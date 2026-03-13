import { useState, useEffect } from "react";
import { RefreshCw, Plus, Pencil, Trash2, Pause, Play, XCircle } from "lucide-react";
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
import { recurringPaymentService } from "../services/recurringPaymentService";
import { crmService } from "@/modules/crm/services/crmService";
import type { RecurringPayment, RecurringFrequency, RecurringStatus } from "../types";
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
    // Override day-of-month for non-weekly frequencies
    if (frequency !== "weekly") {
        next.setDate(Math.min(paymentDay, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    }
    return next.toISOString().split("T")[0];
}

const formatCurrency = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

// ─── empty form ──────────────────────────────────────────────────────────────

const emptyForm = (): Omit<RecurringPayment, "id" | "org_id" | "occurrences_completed" | "created_at" | "updated_at" | "client"> => ({
    client_id: "",
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

export default function RecurringPaymentsPage() {
    const { profile } = useAuth();
    const orgId = profile?.org_id;

    const [payments, setPayments] = useState<RecurringPayment[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm());

    useEffect(() => {
        if (orgId) {
            loadData();
        }
    }, [orgId]);

    const loadData = async () => {
        if (!orgId) return;
        try {
            setLoading(true);
            const [paymentsResult, companiesResult] = await Promise.allSettled([
                recurringPaymentService.getAll(orgId),
                crmService.getCompanies(orgId),
            ]);
            if (paymentsResult.status === "fulfilled") setPayments(paymentsResult.value);
            else { toast.error("Failed to load recurring payments"); console.error(paymentsResult.reason); }
            if (companiesResult.status === "fulfilled") setCompanies(companiesResult.value);
            else { toast.error("Failed to load clients"); console.error(companiesResult.reason); }
        } finally {
            setLoading(false);
        }
    };

    const openAdd = () => {
        setEditingId(null);
        setForm(emptyForm());
        setDialogOpen(true);
    };

    const openEdit = (p: RecurringPayment) => {
        setEditingId(p.id);
        setForm({
            client_id: p.client_id,
            description: p.description,
            amount: p.amount,
            currency: p.currency,
            frequency: p.frequency,
            payment_day: p.payment_day,
            start_date: p.start_date,
            end_date: p.end_date,
            occurrences: p.occurrences,
            status: p.status,
            tax_rate: p.tax_rate,
            notes: p.notes || "",
            next_payment_date: p.next_payment_date,
        });
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!orgId) return;
        if (!form.client_id) { toast.error("Please select a client"); return; }
        if (!form.description.trim()) { toast.error("Please enter a description"); return; }
        if (form.amount <= 0) { toast.error("Amount must be greater than 0"); return; }

        try {
            setSaving(true);
            const nextDate = computeNextDate(form.start_date, form.frequency, form.payment_day);
            const payload = { ...form, next_payment_date: nextDate };

            if (editingId) {
                const updated = await recurringPaymentService.update(editingId, payload);
                setPayments(prev => prev.map(p => p.id === editingId ? updated : p));
                toast.success("Recurring payment updated");
            } else {
                const created = await recurringPaymentService.create(orgId, payload);
                setPayments(prev => [created, ...prev]);
                toast.success("Recurring payment added");
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
            const updated = await recurringPaymentService.updateStatus(id, status);
            setPayments(prev => prev.map(p => p.id === id ? updated : p));
            toast.success(`Marked as ${STATUS_META[status].label}`);
        } catch (err: any) {
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this recurring payment?")) return;
        try {
            await recurringPaymentService.delete(id);
            setPayments(prev => prev.filter(p => p.id !== id));
            toast.success("Deleted");
        } catch (err: any) {
            toast.error("Failed to delete");
        }
    };

    const setField = (key: keyof typeof form, value: any) =>
        setForm(prev => ({ ...prev, [key]: value }));

    // ── render ────────────────────────────────────────────────────────────────

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Recurring Payments</h2>
                    <p className="text-muted-foreground">Manage automatic recurring billing for clients.</p>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                </Button>
            </div>

            {/* Summary cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {(["active", "paused", "cancelled", "completed"] as RecurringStatus[]).map(s => (
                    <Card key={s}>
                        <CardHeader className="pb-2">
                            <CardDescription className="capitalize">{s}</CardDescription>
                            <CardTitle className="text-2xl">
                                {payments.filter(p => p.status === s).length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Recurring Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="py-12 text-center text-muted-foreground">Loading...</div>
                    ) : payments.length === 0 ? (
                        <div className="py-12 text-center border-2 border-dashed rounded-lg">
                            <RefreshCw className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No recurring payments yet.</p>
                            <Button className="mt-4" onClick={openAdd}>
                                <Plus className="mr-2 h-4 w-4" /> Add Client
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Client</TableHead>
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
                                    {payments.map(p => {
                                        const meta = STATUS_META[p.status];
                                        const taxAmount = p.amount * (p.tax_rate / 100);
                                        const total = p.amount + taxAmount;
                                        return (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">
                                                    {p.client?.name ?? p.client_id}
                                                </TableCell>
                                                <TableCell className="max-w-[180px] truncate">
                                                    {p.description}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-semibold">{formatCurrency(total, p.currency)}</div>
                                                    {p.tax_rate > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            +{p.tax_rate}% tax
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="capitalize">{p.frequency}</TableCell>
                                                <TableCell>
                                                    {p.next_payment_date
                                                        ? format(new Date(p.next_payment_date), "dd MMM yyyy")
                                                        : "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {format(new Date(p.start_date), "dd MMM yyyy")}
                                                        {p.end_date && (
                                                            <span className="text-muted-foreground">
                                                                {" "}→ {format(new Date(p.end_date), "dd MMM yyyy")}
                                                            </span>
                                                        )}
                                                        {p.occurrences && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {p.occurrences_completed}/{p.occurrences} completed
                                                            </div>
                                                        )}
                                                        {!p.end_date && !p.occurrences && (
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
                                                            <Button variant="ghost" size="sm">
                                                                Actions
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEdit(p)}>
                                                                <Pencil className="mr-2 h-4 w-4" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            {p.status === "active" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, "paused")}>
                                                                    <Pause className="mr-2 h-4 w-4" /> Pause
                                                                </DropdownMenuItem>
                                                            )}
                                                            {p.status === "paused" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, "active")}>
                                                                    <Play className="mr-2 h-4 w-4" /> Resume
                                                                </DropdownMenuItem>
                                                            )}
                                                            {p.status !== "cancelled" && p.status !== "completed" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, "cancelled")}>
                                                                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                                                                </DropdownMenuItem>
                                                            )}
                                                            {p.status !== "completed" && (
                                                                <DropdownMenuItem onClick={() => handleStatusChange(p.id, "completed")}>
                                                                    <RefreshCw className="mr-2 h-4 w-4" /> Mark Completed
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDelete(p.id)}
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
                        <DialogTitle>{editingId ? "Edit Recurring Payment" : "Add Recurring Payment"}</DialogTitle>
                        <DialogDescription>
                            Configure automatic recurring billing for a client.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Client */}
                        <div className="space-y-2">
                            <Label>Client *</Label>
                            <Select value={form.client_id} onValueChange={v => setField("client_id", v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select client" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.length === 0 ? (
                                        <div className="px-3 py-2 text-sm text-muted-foreground">
                                            No clients found. Add companies in CRM first.
                                        </div>
                                    ) : (
                                        companies.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description *</Label>
                            <Input
                                placeholder="e.g. Monthly retainer fee"
                                value={form.description}
                                onChange={e => setField("description", e.target.value)}
                            />
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
                                />
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
                            />
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

                        {/* Occurrences (optional) */}
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
                        {form.amount > 0 && (
                            <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                                <p className="font-medium">Preview</p>
                                <p>
                                    Billing{" "}
                                    <span className="font-semibold">
                                        {formatCurrency(form.amount + form.amount * (form.tax_rate / 100), form.currency)}
                                    </span>{" "}
                                    ({formatCurrency(form.amount, form.currency)} + {form.tax_rate}% tax){" "}
                                    <span className="capitalize">{form.frequency}</span>
                                </p>
                                <p className="text-muted-foreground">
                                    Next payment: {computeNextDate(form.start_date, form.frequency, form.payment_day)
                                        ? format(new Date(computeNextDate(form.start_date, form.frequency, form.payment_day)), "dd MMM yyyy")
                                        : "—"}
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : editingId ? "Update" : "Add Payment"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
