
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "@/modules/crm/components/leads/data-table"
import { columns } from "@/modules/crm/components/leads/columns"
import type { Lead, LeadCategory, LeadLocation } from "@/modules/crm/types"
import { crmService } from "@/modules/crm/services/crmService";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, SlidersHorizontal, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LeadForm } from "@/modules/crm/components/leads/LeadForm";
import { CreateCustomerFromLeadDialog } from "@/modules/crm/components/leads/CreateCustomerFromLeadDialog";
import { CategorySidebar, type CategoryFilter } from "@/modules/crm/components/leads/CategorySidebar";

export default function LeadsPage() {
    const [allLeads, setAllLeads] = useState<Lead[]>([]);
    const [categories, setCategories] = useState<LeadCategory[]>([]);
    const [locations, setLocations] = useState<LeadLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [completedLead, setCompletedLead] = useState<Lead | null>(null);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);
    const [filter, setFilter] = useState<CategoryFilter>({ categoryId: null, locationId: null });
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [leads, cats, locs] = await Promise.all([
                crmService.getLeads(),
                crmService.getLeadCategories(),
                crmService.getLeadLocations(),
            ]);
            setAllLeads(leads);
            setCategories(cats);
            setLocations(locs);
        } catch (err: any) {
            console.error("Error fetching leads:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    const filteredLeads = useMemo(() => {
        if (filter.locationId) return allLeads.filter(l => l.locationId === filter.locationId);
        if (filter.categoryId) return allLeads.filter(l => l.categoryId === filter.categoryId);
        return allLeads;
    }, [allLeads, filter]);

    const handleCreate = async (leadData: Partial<Lead>) => {
        try {
            const newLead = await crmService.createLead(leadData);
            setAllLeads(prev => [newLead, ...prev]);
            setOpen(false);
            if (newLead.status === "complete") {
                setCompletedLead(newLead);
                setCustomerDialogOpen(true);
            }
        } catch (err: any) {
            console.error("Error creating lead:", err);
            setError("Failed to create lead");
        }
    };

    // Active filter label for mobile chip
    const activeFilterLabel = useMemo(() => {
        if (filter.locationId) {
            const loc = locations.find(l => l.id === filter.locationId);
            const cat = categories.find(c => c.id === filter.categoryId);
            return loc ? `${cat?.name} › ${loc.name}` : null;
        }
        if (filter.categoryId) {
            return categories.find(c => c.id === filter.categoryId)?.name ?? null;
        }
        return null;
    }, [filter, categories, locations]);

    const sidebar = (
        <CategorySidebar
            categories={categories}
            locations={locations}
            leads={allLeads}
            filter={filter}
            onFilterChange={f => { setFilter(f); setMobileSidebarOpen(false); }}
            onRefresh={fetchAll}
        />
    );

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 md:pt-6">
            <CreateCustomerFromLeadDialog
                lead={completedLead}
                open={customerDialogOpen}
                onOpenChange={open => {
                    setCustomerDialogOpen(open);
                    if (!open) setCompletedLead(null);
                }}
            />

            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-xl md:text-3xl font-bold tracking-tight shrink-0">Leads</h2>
                    {activeFilterLabel && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium max-w-[160px] truncate">
                            {activeFilterLabel}
                            <button onClick={() => setFilter({ categoryId: null, locationId: null })} className="ml-0.5 hover:text-primary/70">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    {/* Mobile sidebar toggle */}
                    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="md:hidden gap-1.5">
                                <SlidersHorizontal className="h-4 w-4" />
                                Filter
                                {activeFilterLabel && <span className="ml-1 w-2 h-2 rounded-full bg-primary" />}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-64 p-4">
                            <p className="font-semibold text-sm mb-4">Categories</p>
                            {sidebar}
                        </SheetContent>
                    </Sheet>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="mr-1.5 h-4 w-4" /> Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the new lead. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <LeadForm
                                onSubmit={handleCreate}
                                onCancel={() => setOpen(false)}
                                defaultCategoryId={filter.categoryId ?? undefined}
                                defaultLocationId={filter.locationId ?? undefined}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Mobile active filter chip */}
            {activeFilterLabel && (
                <div className="flex sm:hidden items-center gap-2">
                    <span className="text-xs text-muted-foreground">Filtered by:</span>
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-medium">
                        {activeFilterLabel}
                        <button onClick={() => setFilter({ categoryId: null, locationId: null })}>
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                </div>
            )}

            {/* Main content: sidebar + table */}
            <div className="flex gap-4 h-full">
                {/* Desktop sidebar */}
                <aside className="hidden md:flex flex-col w-52 shrink-0 border rounded-lg p-3 bg-card h-fit max-h-[calc(100vh-12rem)] sticky top-4">
                    {sidebar}
                </aside>

                {/* Table */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-24">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <DataTable columns={columns} data={filteredLeads} searchKey="firstName" />
                    )}
                </div>
            </div>
        </div>
    );
}
