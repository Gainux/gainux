
import type { ColumnDef } from "@tanstack/react-table"
import type { Lead } from "@/modules/crm/types"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, MapPin, Building2, Phone, Tag } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ─── Shared helpers ───────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
    do_cold_call: "Do Cold Call",
    collecting_requirements: "Collecting Requirements",
    not_interested: "Not Interested",
    preparing_proposal: "Preparing Proposal",
    waiting_for_proposal_response: "Waiting for Proposal Response",
    negotiating: "Negotiating",
    waiting_for_advance_amount: "Waiting for Advance Amount",
    work_ongoing: "Work Ongoing",
    do_completion_call: "Do Completion Call",
    waiting_for_full_payment: "Waiting for Full Payment",
    complete: "Complete",
}

// Distinct color per status (full Tailwind class strings for purge safety)
export const STATUS_COLORS: Record<string, string> = {
    do_cold_call:                    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    collecting_requirements:         "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
    not_interested:                  "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    preparing_proposal:              "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    waiting_for_proposal_response:   "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    negotiating:                     "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    waiting_for_advance_amount:      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
    work_ongoing:                    "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    do_completion_call:              "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
    waiting_for_full_payment:        "bg-lime-100 text-lime-700 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300 dark:border-lime-800",
    complete:                        "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
            STATUS_COLORS[status] ?? "bg-muted text-muted-foreground border-border",
            className
        )}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// Keep for any external callers
export function statusVariant(status: string): "destructive" | "default" | "secondary" {
    if (status === "not_interested") return "destructive";
    if (status === "complete") return "default";
    return "secondary";
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

export function LeadMobileCard({ lead, isSelected, onSelect, onDelete }: {
    lead: Lead;
    isSelected: boolean;
    onSelect: (v: boolean) => void;
    onDelete: (id: string) => void;
}) {
    const navigate = useNavigate();
    return (
        <div
            className={cn(
                "border rounded-xl p-3 bg-card transition-colors cursor-pointer",
                isSelected && "border-primary bg-primary/5"
            )}
            onClick={() => navigate(`/crm/leads/${lead.id}`)}
        >
            {/* Row 1: checkbox + name + actions */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                    <div onClick={e => e.stopPropagation()}>
                        <Checkbox
                            checked={isSelected}
                            onCheckedChange={onSelect}
                            className="mt-0.5 shrink-0"
                            aria-label="Select lead"
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight line-clamp-1">
                            {lead.firstName} {lead.lastName}
                        </p>
                        {lead.companyName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{lead.companyName}</span>
                            </p>
                        )}
                    </div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0 shrink-0 -mr-1 -mt-0.5">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => lead.email && navigator.clipboard.writeText(lead.email)}
                                disabled={!lead.email}
                            >
                                Copy Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link to={`/crm/leads/${lead.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete(lead.id)}
                            >
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Row 2: status + category */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StatusBadge status={lead.status} />
                {lead.category && (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: lead.category.color }} />
                        {lead.category.name}
                        {lead.location && (
                            <span className="flex items-center gap-0.5">
                                <span className="text-muted-foreground/50">·</span>
                                <MapPin className="h-2.5 w-2.5" />
                                {lead.location.name}
                            </span>
                        )}
                    </span>
                )}
            </div>

            {/* Row 3: contact details */}
            {(lead.phone || lead.source) && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                    {lead.phone && (
                        <a
                            href={`tel:${lead.phone}`}
                            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors"
                            onClick={e => e.stopPropagation()}
                        >
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{lead.phone}</span>
                        </a>
                    )}
                    {lead.source && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Tag className="h-3 w-3 shrink-0" />
                            {lead.source}
                        </span>
                    )}
                </div>
            )}

            {/* Row 4: date */}
            <p className="text-xs text-muted-foreground mt-1.5">
                {new Date(lead.createdAt).toLocaleDateString()}
            </p>
        </div>
    );
}

// ─── Table columns ────────────────────────────────────────────────────────────

export function createColumns(onDelete: (id: string) => void): ColumnDef<Lead>[] {
    return [
        {
            accessorKey: "companyName",
            header: "Lead",
            cell: ({ row }) => (
                <div>
                    <p className="font-medium text-sm">{row.original.firstName} {row.original.lastName}</p>
                    {row.original.companyName && (
                        <p className="text-xs text-muted-foreground">{row.original.companyName}</p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "phone",
            header: "Phone",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const lead = row.original;
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const navigate = useNavigate();
                return (
                    <div onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => lead.email && navigator.clipboard.writeText(lead.email)}
                                >
                                    Copy Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate(`/crm/leads/${lead.id}`)}>
                                    View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => onDelete(lead.id)}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];
}

// Keep a static export for backwards compatibility (no delete handler)
export const columns = createColumns(() => {});
