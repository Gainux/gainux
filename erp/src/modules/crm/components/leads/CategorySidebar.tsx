import { useState } from "react";
import type { LeadCategory, LeadLocation, Lead } from "@/modules/crm/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, LayoutList, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ManageCategoriesDialog } from "./ManageCategoriesDialog";

export interface CategoryFilter {
    categoryId: string | null;
    locationId: string | null;
}

interface Props {
    categories: LeadCategory[];
    locations: LeadLocation[];
    leads: Lead[];
    filter: CategoryFilter;
    onFilterChange: (f: CategoryFilter) => void;
    onRefresh: () => void;
}

export function CategorySidebar({ categories, locations, leads, filter, onFilterChange, onRefresh }: Props) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [manageOpen, setManageOpen] = useState(false);

    const toggleExpand = (catId: string) =>
        setExpanded(prev => ({ ...prev, [catId]: !prev[catId] }));

    const locsFor = (catId: string) => locations.filter(l => l.categoryId === catId);

    const countFor = (catId: string | null, locId: string | null) => {
        if (catId === null) return leads.length;
        if (locId !== null) return leads.filter(l => l.locationId === locId).length;
        return leads.filter(l => l.categoryId === catId).length;
    };

    const isActive = (catId: string | null, locId: string | null) =>
        filter.categoryId === catId && filter.locationId === locId;

    const select = (catId: string | null, locId: string | null) =>
        onFilterChange({ categoryId: catId, locationId: locId });

    return (
        <>
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto space-y-0.5 pb-2">
                    {/* All Leads */}
                    <button
                        type="button"
                        onClick={() => select(null, null)}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                            isActive(null, null)
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                        )}
                    >
                        <LayoutList className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left font-medium">All Leads</span>
                        <span className={cn("text-xs tabular-nums", isActive(null, null) ? "text-primary-foreground/80" : "text-muted-foreground")}>
                            {countFor(null, null)}
                        </span>
                    </button>

                    {/* Categories */}
                    {categories.map(cat => {
                        const locs = locsFor(cat.id);
                        const isOpen = expanded[cat.id];
                        const catActive = isActive(cat.id, null);

                        return (
                            <div key={cat.id}>
                                <div className={cn(
                                    "flex items-center rounded-md transition-colors",
                                    catActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                                )}>
                                    <button
                                        type="button"
                                        onClick={() => select(cat.id, null)}
                                        className="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-left min-w-0"
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                                        <span className="flex-1 truncate font-medium">{cat.name}</span>
                                        <span className={cn("text-xs tabular-nums shrink-0", catActive ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                            {countFor(cat.id, null)}
                                        </span>
                                    </button>
                                    {locs.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => toggleExpand(cat.id)}
                                            className={cn("px-2 py-2 rounded-r-md", catActive ? "hover:bg-primary-foreground/10" : "hover:bg-muted-foreground/10")}
                                        >
                                            {isOpen
                                                ? <ChevronDown className="h-3.5 w-3.5" />
                                                : <ChevronRight className="h-3.5 w-3.5" />}
                                        </button>
                                    )}
                                </div>

                                {isOpen && locs.map(loc => {
                                    const locActive = isActive(cat.id, loc.id);
                                    return (
                                        <button
                                            key={loc.id}
                                            type="button"
                                            onClick={() => select(cat.id, loc.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 pl-7 pr-3 py-1.5 rounded-md text-sm transition-colors",
                                                locActive
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            <span className="text-xs text-muted-foreground">└</span>
                                            <span className="flex-1 text-left truncate">{loc.name}</span>
                                            <span className="text-xs tabular-nums">{countFor(cat.id, loc.id)}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}

                    {categories.length === 0 && (
                        <p className="text-xs text-muted-foreground px-3 py-2">
                            No categories yet. Click Manage to add some.
                        </p>
                    )}
                </div>

                {/* Manage button */}
                <div className="border-t pt-2 mt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-muted-foreground"
                        onClick={() => setManageOpen(true)}
                    >
                        <Settings2 className="h-4 w-4" />
                        Manage Categories
                    </Button>
                </div>
            </div>

            <ManageCategoriesDialog
                open={manageOpen}
                onOpenChange={setManageOpen}
                onChanged={() => { setManageOpen(false); onRefresh(); }}
            />
        </>
    );
}
