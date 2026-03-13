
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/modules/crm/components/leads/data-table";
import { columns, LeadMobileCard } from "@/modules/crm/components/leads/columns";
import type { Lead, LeadCategory, LeadLocation } from "@/modules/crm/types";
import { crmService } from "@/modules/crm/services/crmService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Plus, Loader2, ChevronRight, Settings2,
    FolderOpen, Users, TrendingUp, CheckCircle2, XCircle, MapPin, X,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { LeadForm } from "@/modules/crm/components/leads/LeadForm";
import { CreateCustomerFromLeadDialog } from "@/modules/crm/components/leads/CreateCustomerFromLeadDialog";
import { ManageCategoriesDialog } from "@/modules/crm/components/leads/ManageCategoriesDialog";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewState =
    | { type: "categories" }
    | { type: "locations"; category: LeadCategory }
    | { type: "leads"; category: LeadCategory; location: LeadLocation | null }
    | { type: "unassigned-leads" };

type BulkAction = "status" | "location" | "category" | null;

interface StatusSummary { total: number; active: number; complete: number; lost: number; }

const LEAD_STATUSES = [
    { value: "do_cold_call", label: "Do Cold Call" },
    { value: "collecting_requirements", label: "Collecting Requirements" },
    { value: "preparing_proposal", label: "Preparing Proposal" },
    { value: "waiting_for_proposal_response", label: "Waiting for Proposal Response" },
    { value: "negotiating", label: "Negotiating" },
    { value: "waiting_for_advance_amount", label: "Waiting for Advance Amount" },
    { value: "work_ongoing", label: "Work Ongoing" },
    { value: "do_completion_call", label: "Do Completion Call" },
    { value: "waiting_for_full_payment", label: "Waiting for Full Payment" },
    { value: "complete", label: "Complete" },
    { value: "not_interested", label: "Not Interested" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function summarize(leads: Lead[]): StatusSummary {
    return {
        total: leads.length,
        active: leads.filter(l => l.status !== "complete" && l.status !== "not_interested").length,
        complete: leads.filter(l => l.status === "complete").length,
        lost: leads.filter(l => l.status === "not_interested").length,
    };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatusPills({ summary }: { summary: StatusSummary }) {
    return (
        <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5 font-medium">
                <TrendingUp className="h-3 w-3" /> {summary.active} Active
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-full px-2 py-0.5 font-medium">
                <CheckCircle2 className="h-3 w-3" /> {summary.complete} Done
            </span>
            {summary.lost > 0 && (
                <span className="inline-flex items-center gap-1 text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-full px-2 py-0.5 font-medium">
                    <XCircle className="h-3 w-3" /> {summary.lost} Lost
                </span>
            )}
        </div>
    );
}

function CategoryCard({ category, leads, onClick }: { category: LeadCategory; leads: Lead[]; onClick: () => void }) {
    const summary = summarize(leads);
    return (
        <button type="button" onClick={onClick}
            className="group text-left border rounded-xl bg-card hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden w-full">
            <div className="h-1.5 w-full" style={{ background: category.color }} />
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: category.color }} />
                        <span className="font-semibold text-sm truncate">{category.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-2xl md:text-3xl font-bold mt-3 tabular-nums">{summary.total}</p>
                <p className="text-xs text-muted-foreground">total leads</p>
                <StatusPills summary={summary} />
            </div>
        </button>
    );
}

function UnassignedCategoryCard({ leads, onClick }: { leads: Lead[]; onClick: () => void }) {
    const summary = summarize(leads);
    return (
        <button type="button" onClick={onClick}
            className="group text-left border rounded-xl bg-card hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden w-full">
            <div className="h-1.5 w-full bg-muted-foreground/30" />
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen className="w-3 h-3 shrink-0 text-muted-foreground" />
                        <span className="font-semibold text-sm truncate text-muted-foreground">Unassigned</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-2xl md:text-3xl font-bold mt-3 tabular-nums">{summary.total}</p>
                <p className="text-xs text-muted-foreground">total leads</p>
                <StatusPills summary={summary} />
            </div>
        </button>
    );
}

function LocationCard({ name, leads, color, onClick, isUnassigned }: {
    name: string; leads: Lead[]; color?: string; onClick: () => void; isUnassigned?: boolean;
}) {
    const summary = summarize(leads);
    return (
        <button type="button" onClick={onClick}
            className="group text-left border rounded-xl bg-card hover:shadow-md hover:border-primary/40 transition-all duration-200 overflow-hidden w-full">
            {color && <div className="h-1 w-full opacity-50" style={{ background: color }} />}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {isUnassigned
                            ? <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                            : <MapPin className="h-4 w-4 shrink-0" style={{ color: color ?? 'currentColor' }} />}
                        <span className="font-semibold text-sm truncate">{name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-0.5" />
                </div>
                <p className="text-2xl md:text-3xl font-bold mt-3 tabular-nums">{summary.total}</p>
                <p className="text-xs text-muted-foreground">leads</p>
                <StatusPills summary={summary} />
            </div>
        </button>
    );
}

function AddLocationCard({ onAdd, saving }: { onAdd: (name: string) => Promise<void>; saving: boolean; }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const save = async () => {
        if (!name.trim()) return;
        await onAdd(name.trim());
        setName(""); setEditing(false);
    };
    if (editing) {
        return (
            <div className="border-2 border-primary/40 rounded-xl p-4 bg-card">
                <Input autoFocus placeholder="Location name…" value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
                    className="mb-3" />
                <div className="flex gap-2">
                    <Button size="sm" onClick={save} disabled={!name.trim() || saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(""); }}>Cancel</Button>
                </div>
            </div>
        );
    }
    return (
        <button type="button" onClick={() => setEditing(true)}
            className="border-2 border-dashed rounded-xl p-4 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 min-h-[140px] w-full">
            <Plus className="h-5 w-5" />
            <span className="text-sm font-medium">Add Location</span>
        </button>
    );
}

// ─── Bulk Action Bar ──────────────────────────────────────────────────────────

function BulkActionBar({ count, onAction, onClear }: {
    count: number;
    onAction: (action: BulkAction) => void;
    onClear: () => void;
}) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 border border-primary/20 rounded-lg mb-3 flex-wrap">
            <span className="text-sm font-medium text-primary shrink-0">{count} selected</span>
            <div className="flex items-center gap-1.5 flex-wrap">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction("status")}>
                    Update Status
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction("location")}>
                    Change Location
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => onAction("category")}>
                    Change Category
                </Button>
            </div>
            <button type="button" onClick={onClear} className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function LeadsPage() {
    const [allLeads, setAllLeads] = useState<Lead[]>([]);
    const [categories, setCategories] = useState<LeadCategory[]>([]);
    const [locations, setLocations] = useState<LeadLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<ViewState>({ type: "categories" });
    const [addLeadOpen, setAddLeadOpen] = useState(false);
    const [completedLead, setCompletedLead] = useState<Lead | null>(null);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [addingLocation, setAddingLocation] = useState(false);

    // Bulk selection
    const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<BulkAction>(null);
    const [bulkValue, setBulkValue] = useState("");
    const [bulkSaving, setBulkSaving] = useState(false);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [leads, cats, locs] = await Promise.all([
                crmService.getLeads(),
                crmService.getLeadCategories(),
                crmService.getLeadLocations(),
            ]);
            setAllLeads(leads); setCategories(cats); setLocations(locs);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);
    useEffect(() => { setSearch(""); setSelectedLeadIds([]); }, [view]);

    const leadsForCategory = (catId: string) => allLeads.filter(l => l.categoryId === catId);
    const leadsForLocation = (locId: string) => allLeads.filter(l => l.locationId === locId);
    const unassignedInCategory = (catId: string) => allLeads.filter(l => l.categoryId === catId && !l.locationId);
    const unassignedLeads = useMemo(() => allLeads.filter(l => !l.categoryId), [allLeads]);

    // Leads shown in the table (based on location context + search)
    const baseLeads = useMemo(() => {
        if (view.type === "unassigned-leads") return unassignedLeads;
        if (view.type !== "leads") return [];
        return view.location === null
            ? unassignedInCategory(view.category.id)
            : leadsForLocation(view.location.id);
    }, [view, allLeads]);

    const tableLeads = useMemo(() => {
        if (!search.trim()) return baseLeads;
        const q = search.toLowerCase();
        return baseLeads.filter(l =>
            [l.firstName, l.lastName, l.email, l.phone, l.companyName, l.source]
                .filter(Boolean).join(" ").toLowerCase().includes(q)
        );
    }, [baseLeads, search]);

    const handleCreateLead = async (leadData: Partial<Lead>) => {
        try {
            const newLead = await crmService.createLead(leadData);
            setAllLeads(prev => [newLead, ...prev]);
            setAddLeadOpen(false);
            if (newLead.status === "complete") { setCompletedLead(newLead); setCustomerDialogOpen(true); }
        } catch { setError("Failed to create lead"); }
    };

    const handleAddLocation = async (name: string) => {
        if (view.type !== "locations") return;
        setAddingLocation(true);
        try {
            const created = await crmService.createLeadLocation(view.category.id, name);
            setLocations(prev => [...prev, created]);
        } finally { setAddingLocation(false); }
    };

    // ── Bulk actions ────────────────────────────────────────────────────────
    const openBulkAction = (action: BulkAction) => {
        setBulkValue("");
        setBulkAction(action);
    };

    const clearSelection = () => {
        setSelectedLeadIds([]);
        setBulkAction(null);
        setBulkValue("");
    };

    const applyBulkAction = async () => {
        if (!bulkValue || selectedLeadIds.length === 0) return;
        setBulkSaving(true);
        try {
            const updates: Partial<Lead> = {};
            if (bulkAction === "status") updates.status = bulkValue;
            if (bulkAction === "location") updates.locationId = bulkValue === "__none__" ? undefined : bulkValue;
            if (bulkAction === "category") { updates.categoryId = bulkValue === "__none__" ? undefined : bulkValue; updates.locationId = undefined; }
            await Promise.all(selectedLeadIds.map(id => crmService.updateLead(id, updates)));
            await fetchAll();
            clearSelection();
            setBulkAction(null);
        } catch { setError("Failed to apply bulk update"); }
        finally { setBulkSaving(false); }
    };

    // Locations relevant to the bulk location picker
    const bulkLocationOptions = useMemo(() => {
        if (view.type === "leads") return locations.filter(l => l.categoryId === view.category.id);
        return locations;
    }, [view, locations]);

    // ── Breadcrumb ──────────────────────────────────────────────────────────
    const breadcrumb = (
        <nav className="flex items-center gap-1 text-sm mb-4 flex-wrap">
            <button type="button"
                onClick={() => setView({ type: "categories" })}
                className={cn("hover:text-primary transition-colors",
                    view.type === "categories" ? "font-semibold text-foreground" : "text-muted-foreground")}>
                Leads
            </button>
            {view.type === "unassigned-leads" && (
                <>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground">Unassigned</span>
                </>
            )}
            {(view.type === "locations" || view.type === "leads") && (
                <>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <button type="button"
                        onClick={() => setView({ type: "locations", category: view.category })}
                        className={cn("hover:text-primary transition-colors flex items-center gap-1",
                            view.type === "locations" ? "font-semibold text-foreground" : "text-muted-foreground")}>
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: view.category.color }} />
                        {view.category.name}
                    </button>
                </>
            )}
            {view.type === "leads" && (
                <>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground">
                        {view.location ? view.location.name : "Unassigned"}
                    </span>
                </>
            )}
        </nav>
    );

    // ── Page header ─────────────────────────────────────────────────────────
    const title = view.type === "categories" ? "Leads"
        : view.type === "unassigned-leads" ? "Unassigned Leads"
        : view.type === "locations" ? view.category.name
        : view.location ? view.location.name : "Unassigned";

    const isLeadsView = view.type === "leads" || view.type === "unassigned-leads";

    const header = (
        <div className="flex items-center justify-between gap-2 mb-6">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
            <div className="flex items-center gap-2">
                {view.type === "categories" && (
                    <Button variant="outline" size="sm" onClick={() => setManageOpen(true)} className="gap-1.5">
                        <Settings2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Manage</span>
                    </Button>
                )}
                {view.type === "leads" && (
                    <Dialog open={addLeadOpen} onOpenChange={setAddLeadOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="gap-1.5">
                                <Plus className="h-4 w-4" /> Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                                <DialogDescription>
                                    Adding to {view.category.name}{view.location ? ` › ${view.location.name}` : ""}.
                                </DialogDescription>
                            </DialogHeader>
                            <LeadForm
                                onSubmit={handleCreateLead}
                                onCancel={() => setAddLeadOpen(false)}
                                defaultCategoryId={view.category.id}
                                defaultLocationId={view.location?.id}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex-1 p-4 md:p-8 md:pt-6 flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="flex-1 p-4 md:p-8 md:pt-6">
            <CreateCustomerFromLeadDialog
                lead={completedLead}
                open={customerDialogOpen}
                onOpenChange={o => { setCustomerDialogOpen(o); if (!o) setCompletedLead(null); }}
            />
            <ManageCategoriesDialog
                open={manageOpen}
                onOpenChange={setManageOpen}
                onChanged={() => { setManageOpen(false); fetchAll(); }}
            />

            {/* ── Bulk Action Dialogs ────────────────────────────────── */}
            <Dialog open={bulkAction !== null} onOpenChange={open => { if (!open) setBulkAction(null); }}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            {bulkAction === "status" ? "Update Status"
                                : bulkAction === "location" ? "Change Location"
                                : "Change Category"}
                        </DialogTitle>
                        <DialogDescription>
                            Apply to {selectedLeadIds.length} selected lead{selectedLeadIds.length !== 1 ? "s" : ""}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        {bulkAction === "status" && (
                            <Select value={bulkValue} onValueChange={setBulkValue}>
                                <SelectTrigger><SelectValue placeholder="Select status…" /></SelectTrigger>
                                <SelectContent>
                                    {LEAD_STATUSES.map(s => (
                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {bulkAction === "location" && (
                            <Select value={bulkValue} onValueChange={setBulkValue}>
                                <SelectTrigger><SelectValue placeholder="Select location…" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">— None (unassign)</SelectItem>
                                    {bulkLocationOptions.map(loc => (
                                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                        {bulkAction === "category" && (
                            <Select value={bulkValue} onValueChange={setBulkValue}>
                                <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">— None (unassign)</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            <span className="flex items-center gap-2">
                                                <span className="inline-block w-2 h-2 rounded-full" style={{ background: cat.color }} />
                                                {cat.name}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setBulkAction(null)}>Cancel</Button>
                        <Button size="sm" onClick={applyBulkAction} disabled={!bulkValue || bulkSaving}>
                            {bulkSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {breadcrumb}
            {header}

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* ── CATEGORIES VIEW ───────────────────────────────────── */}
            {view.type === "categories" && (
                categories.length === 0 && unassignedLeads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-semibold text-lg">No categories yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create categories like Medical, Manufacturing to organise your leads.
                            </p>
                        </div>
                        <Button onClick={() => setManageOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" /> Create First Category
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {categories.map(cat => (
                            <CategoryCard
                                key={cat.id}
                                category={cat}
                                leads={leadsForCategory(cat.id)}
                                onClick={() => setView({ type: "locations", category: cat })}
                            />
                        ))}
                        {unassignedLeads.length > 0 && (
                            <UnassignedCategoryCard
                                leads={unassignedLeads}
                                onClick={() => setView({ type: "unassigned-leads" })}
                            />
                        )}
                    </div>
                )
            )}

            {/* ── LOCATIONS VIEW ────────────────────────────────────── */}
            {view.type === "locations" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {locations
                        .filter(l => l.categoryId === view.category.id)
                        .map(loc => (
                            <LocationCard
                                key={loc.id}
                                name={loc.name}
                                leads={leadsForLocation(loc.id)}
                                color={view.category.color}
                                onClick={() => setView({ type: "leads", category: view.category, location: loc })}
                            />
                        ))}

                    {/* Unassigned card */}
                    {(() => {
                        const unassigned = unassignedInCategory(view.category.id);
                        return unassigned.length > 0 ? (
                            <LocationCard
                                key="unassigned"
                                name="Unassigned"
                                leads={unassigned}
                                isUnassigned
                                onClick={() => setView({ type: "leads", category: view.category, location: null })}
                            />
                        ) : null;
                    })()}

                    <AddLocationCard onAdd={handleAddLocation} saving={addingLocation} />
                </div>
            )}

            {/* ── LEADS VIEW ────────────────────────────────────────── */}
            {isLeadsView && (
                <div>
                    <StatusPills summary={summarize(baseLeads)} />
                    <div className="mt-4">
                        {selectedLeadIds.length > 0 && (
                            <BulkActionBar
                                count={selectedLeadIds.length}
                                onAction={openBulkAction}
                                onClear={clearSelection}
                            />
                        )}
                        <DataTable
                            columns={columns}
                            data={tableLeads}
                            searchKey="firstName"
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Search by name, email, phone, company…"
                            enableSelection
                            onSelectionChange={setSelectedLeadIds}
                            renderMobileCard={(lead, { isSelected, onSelect }) => (
                                <LeadMobileCard
                                    key={(lead as any).id}
                                    lead={lead as any}
                                    isSelected={isSelected}
                                    onSelect={onSelect}
                                />
                            )}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
