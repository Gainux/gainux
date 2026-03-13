
import type { ColumnDef } from "@tanstack/react-table"
import type { Lead } from "@/modules/crm/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            const status = row.getValue("status") as string
            const statusLabels: Record<string, string> = {
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
            const variant = status === "not_interested" ? "destructive" : status === "complete" ? "default" : "secondary"
            return (
                <Badge variant={variant}>
                    {statusLabels[status] ?? status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            return new Date(row.getValue("createdAt")).toLocaleDateString()
        },
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
