
import type { ColumnDef } from "@tanstack/react-table"
import type { Lead } from "@/modules/crm/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, MapPin, Building2, Mail, Phone, Tag } from "lucide-react"
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

const STATUS_LABELS: Record<string, string> = {
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

function statusVariant(status: string): "destructive" | "default" | "secondary" {
    if (status === "not_interested") return "destructive";
    if (status === "complete") return "default";
    return "secondary";
}

// ─── Mobile card ─────────────────────────────────────────────────────────────

export function LeadMobileCard({ lead, isSelected, onSelect }: {
    lead: Lead;
    isSelected: boolean;
    onSelect: (v: boolean) => void;
}) {
    const navigate = useNavigate();
    return (
        <div className={cn(
            "border rounded-xl p-3 bg-card transition-colors",
            isSelected && "border-primary bg-primary/5"
        )}>
            {/* Row 1: checkbox + name + actions */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={onSelect}
                        className="mt-0.5 shrink-0"
                        aria-label="Select lead"
                    />
                    <div className="min-w-0">
                        <Link
                            to={`/crm/leads/${lead.id}`}
                            className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-1"
                        >
                            {lead.firstName} {lead.lastName}
                        </Link>
                        {lead.companyName && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{lead.companyName}</span>
                            </p>
                        )}
                    </div>
                </div>
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
                        <DropdownMenuItem onClick={() => navigate(`/crm/leads/${lead.id}?edit=true`)}>
                            Edit Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Row 2: status + category */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={statusVariant(lead.status)} className="text-xs">
                    {STATUS_LABELS[lead.status] ?? lead.status}
                </Badge>
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
            {(lead.email || lead.phone || lead.source) && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                    {lead.email && (
                        <a href={`mailto:${lead.email}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors min-w-0">
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                        </a>
                    )}
                    {lead.phone && (
                        <a href={`tel:${lead.phone}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors">
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

export const columns: ColumnDef<Lead>[] = [
    {
        accessorKey: "firstName",
        header: "Name",
        cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`
    },
    {
        accessorKey: "companyName",
        header: "Company",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "source",
        header: "Source",
    },
    {
        id: "category",
        header: "Category",
        cell: ({ row }) => {
            const cat = row.original.category;
            const loc = row.original.location;
            if (!cat) return <span className="text-muted-foreground text-xs">—</span>;
            return (
                <div className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                        <span className="text-xs font-medium">{cat.name}</span>
                    </span>
                    {loc && <span className="text-xs text-muted-foreground pl-3.5">{loc.name}</span>}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={statusVariant(status)}>
                    {STATUS_LABELS[status] ?? status}
                </Badge>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const lead = row.original
            const navigate = useNavigate()

            return (
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
                        <DropdownMenuItem asChild>
                            <Link to={`/crm/leads/${lead.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/crm/leads/${lead.id}?edit=true`)}>
                            Edit Lead
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
