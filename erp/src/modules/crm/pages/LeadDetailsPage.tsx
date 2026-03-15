import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Pencil, Check, X, Loader2, Trash2 } from "lucide-react";
import { crmService } from "../services/crmService";
import type { Lead, LeadCategory, LeadLocation } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import { CreateCustomerFromLeadDialog } from "../components/leads/CreateCustomerFromLeadDialog";
import PageLoading from "../../../components/common/PageLoading";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, StatusBadge } from "../components/leads/columns";

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

// ─── Inline field components ──────────────────────────────────────────────────

function InlineTextField({
    label, value, placeholder = "—",
    onSave, type = "text",
}: {
    label: string;
    value?: string;
    placeholder?: string;
    onSave: (v: string) => Promise<void>;
    type?: string;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const start = () => { setDraft(value ?? ""); setEditing(true); };
    const cancel = () => setEditing(false);
    const save = async () => {
        setSaving(true);
        try { await onSave(draft); setEditing(false); }
        catch { /* onSave shows toast */ }
        finally { setSaving(false); }
    };

    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

    return (
        <div className="group py-3 border-b last:border-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        type={type}
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") cancel(); }}
                        className="flex-1"
                    />
                    <Button size="icon" className="shrink-0" onClick={save} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="shrink-0" onClick={cancel} disabled={saving}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <span className={cn("text-sm", !value && "text-muted-foreground/50")}>{value || placeholder}</span>
                    <button
                        type="button"
                        onClick={start}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-muted transition-opacity shrink-0"
                        aria-label={`Edit ${label}`}
                    >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                </div>
            )}
        </div>
    );
}

function InlineTextareaField({
    label, value, onSave,
}: {
    label: string;
    value?: string;
    onSave: (v: string) => Promise<void>;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);

    const start = () => { setDraft(value ?? ""); setEditing(true); };
    const cancel = () => setEditing(false);
    const save = async () => {
        setSaving(true);
        try { await onSave(draft); setEditing(false); }
        catch { }
        finally { setSaving(false); }
    };

    return (
        <div className="group py-3 border-b last:border-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="space-y-2">
                    <Textarea
                        autoFocus
                        value={draft}
                        onChange={e => setDraft(e.target.value)}
                        rows={4}
                        onKeyDown={e => { if (e.key === "Escape") cancel(); }}
                    />
                    <div className="flex gap-2">
                        <Button size="sm" onClick={save} disabled={saving} className="h-7">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancel} disabled={saving} className="h-7">Cancel</Button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm whitespace-pre-wrap flex-1", !value && "text-muted-foreground/50")}>
                        {value || "No notes added."}
                    </p>
                    <button
                        type="button"
                        onClick={start}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-muted transition-opacity shrink-0 mt-0.5"
                        aria-label="Edit notes"
                    >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                </div>
            )}
        </div>
    );
}

function InlineSelectField({
    label, value, displayValue, options, onSave, nullable,
}: {
    label: string;
    value?: string;
    displayValue?: string;
    options: { value: string; label: string; color?: string }[];
    onSave: (v: string | undefined) => Promise<void>;
    nullable?: boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);

    const start = () => { setDraft(value ?? "__none__"); setEditing(true); };
    const cancel = () => setEditing(false);
    const save = async () => {
        setSaving(true);
        try {
            await onSave(draft === "__none__" ? undefined : draft);
            setEditing(false);
        } catch { }
        finally { setSaving(false); }
    };

    return (
        <div className="group py-3 border-b last:border-0">
            <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    <Select value={draft} onValueChange={setDraft}>
                        <SelectTrigger className="flex-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {nullable && <SelectItem value="__none__">— None</SelectItem>}
                            {options.map(o => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.color ? (
                                        <span className="flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: o.color }} />
                                            {o.label}
                                        </span>
                                    ) : o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button size="icon" className="shrink-0" onClick={save} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="shrink-0" onClick={cancel} disabled={saving}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-2 min-h-[28px]">
                    <span className={cn("text-sm", !value && "text-muted-foreground/50")}>
                        {displayValue || value || "—"}
                    </span>
                    <button
                        type="button"
                        onClick={start}
                        className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-muted transition-opacity shrink-0"
                        aria-label={`Edit ${label}`}
                    >
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="border rounded-xl bg-card overflow-hidden">
            <div className="px-4 pt-4 pb-1 border-b">
                <h3 className="text-sm font-semibold">{title}</h3>
            </div>
            <div className="px-4">{children}</div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LeadDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [pendingComplete, setPendingComplete] = useState<Partial<Lead> | null>(null);
    const [categories, setCategories] = useState<LeadCategory[]>([]);
    const [locations, setLocations] = useState<LeadLocation[]>([]);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            crmService.getLeadById(id),
            crmService.getLeadCategories(),
            crmService.getLeadLocations(),
        ]).then(([l, cats, locs]) => {
            setLead(l); setCategories(cats); setLocations(locs);
        }).catch(() => {
            toast.error("Failed to load lead");
            navigate("/crm/leads");
        }).finally(() => setLoading(false));
    }, [id, navigate]);

    // Generic field saver — intercepts "complete" status to enforce customer creation first
    const save = async (updates: Partial<Lead>) => {
        if (!lead) return;
        if (updates.status === "complete") {
            // Hold the update and show customer creation dialog.
            // Status is only written to DB after onConfirm fires (success or explicit skip).
            setPendingComplete(updates);
            setCustomerDialogOpen(true);
            return; // InlineSelectField resolves → closes; displayed value stays old until confirmed
        }
        try {
            const updated = await crmService.updateLead(lead.id, updates);
            setLead(updated);
            toast.success("Saved");
        } catch (err: any) {
            toast.error(err.message || "Failed to save");
            throw err; // let inline component stay in edit mode
        }
    };

    // Called by CreateCustomerFromLeadDialog when customer is created OR user explicitly skips
    const handleCompleteConfirm = async () => {
        if (!pendingComplete || !lead) return;
        try {
            const updated = await crmService.updateLead(lead.id, pendingComplete);
            setLead(updated);
            toast.success("Status set to Complete");
        } catch (err: any) {
            toast.error(err.message || "Failed to update status");
        } finally {
            setPendingComplete(null);
        }
    };

    const handleCustomerDialogClose = (open: boolean) => {
        if (!open && pendingComplete) {
            // Dialog closed via × without creating customer or skipping → cancel the status change
            setPendingComplete(null);
        }
        setCustomerDialogOpen(open);
    };

    const handleDelete = async () => {
        if (!lead) return;
        setDeleting(true);
        try {
            await crmService.deleteLead(lead.id);
            toast.success("Lead deleted");
            navigate("/crm/leads");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete");
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    };

    if (loading) return <PageLoading />;
    if (!lead) return <div>Lead not found</div>;

    const filteredLocations = locations.filter(l => l.categoryId === lead.categoryId);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <CreateCustomerFromLeadDialog
                lead={lead}
                open={customerDialogOpen}
                onOpenChange={handleCustomerDialogClose}
                onConfirm={handleCompleteConfirm}
            />

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete lead?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete {lead.firstName} {lead.lastName}. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <Button variant="outline" size="icon" className="shrink-0 mt-0.5" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                            {lead.firstName} {lead.lastName}
                        </h2>
                        {lead.companyName && (
                            <p className="text-sm text-muted-foreground mt-0.5">{lead.companyName}</p>
                        )}
                        <StatusBadge status={lead.status} className="mt-2" />
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive hover:border-destructive/40"
                    onClick={() => setDeleteOpen(true)}
                    title="Delete lead"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            {/* Content grid */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Contact */}
                <Section title="Contact">
                    <InlineTextField
                        label="First Name"
                        value={lead.firstName}
                        onSave={v => save({ firstName: v })}
                    />
                    <InlineTextField
                        label="Last Name"
                        value={lead.lastName}
                        onSave={v => save({ lastName: v })}
                    />
                    <InlineTextField
                        label="Email"
                        value={lead.email}
                        type="email"
                        onSave={v => save({ email: v })}
                    />
                    <InlineTextField
                        label="Phone"
                        value={lead.phone}
                        type="tel"
                        onSave={v => save({ phone: v })}
                    />
                    <InlineTextField
                        label="Company"
                        value={lead.companyName}
                        onSave={v => save({ companyName: v })}
                    />
                    <InlineTextField
                        label="Source"
                        value={lead.source}
                        placeholder="e.g. Website, Referral"
                        onSave={v => save({ source: v })}
                    />
                </Section>

                {/* Pipeline */}
                <Section title="Pipeline">
                    <InlineSelectField
                        label="Status"
                        value={lead.status}
                        displayValue={STATUS_LABELS[lead.status] ?? lead.status}
                        options={STATUS_OPTIONS}
                        onSave={v => save({ status: v ?? "do_cold_call" })}
                    />
                    <InlineSelectField
                        label="Category"
                        value={lead.categoryId}
                        displayValue={lead.category?.name}
                        nullable
                        options={categories.map(c => ({ value: c.id, label: c.name, color: c.color }))}
                        onSave={async v => {
                            await save({ categoryId: v, locationId: undefined });
                        }}
                    />
                    <InlineSelectField
                        label="Location"
                        value={lead.locationId}
                        displayValue={lead.location?.name}
                        nullable
                        options={filteredLocations.map(l => ({ value: l.id, label: l.name }))}
                        onSave={v => save({ locationId: v })}
                    />
                    {lead.owner && (
                        <div className="group py-3 border-b last:border-0">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Owner</p>
                            <p className="text-sm">{lead.owner.firstName} {lead.owner.lastName}</p>
                        </div>
                    )}
                    <div className="py-3 border-b last:border-0">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Created</p>
                        <p className="text-sm">{format(new Date(lead.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div className="py-3 last:border-0">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Last Updated</p>
                        <p className="text-sm">{format(new Date(lead.updatedAt), "MMM d, yyyy")}</p>
                    </div>
                </Section>

                {/* Notes — full width */}
                <div className="md:col-span-2">
                    <Section title="Notes">
                        <InlineTextareaField
                            label=""
                            value={lead.notes}
                            onSave={v => save({ notes: v })}
                        />
                    </Section>
                </div>
            </div>
        </div>
    );
}
