
import type { ColumnDef } from "@tanstack/react-table"
import type { Quote } from "@/modules/crm/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<Quote>[] = [
    {
        accessorKey: "quoteNumber",
        header: "Quote #",
    },
    {
        accessorKey: "company.name", // Assuming deep access works or handle in cell
        header: "Customer",
        cell: ({ row }) => {
            const company = row.original.company;
            const contact = row.original.contact;
            return company?.name || (contact ? `${contact.firstName} ${contact.lastName}` : "-");
        }
    },
    {
        accessorKey: "totalAmount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("totalAmount"))
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: row.original.currency,
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "accepted" ? "default" : status === "rejected" ? "destructive" : "secondary"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "issueDate",
        header: "Date",
        cell: ({ row }) => {
            return new Date(row.getValue("issueDate")).toLocaleDateString()
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const quote = row.original

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
                            onClick={() => navigator.clipboard.writeText(quote.quoteNumber)}
                        >
                            Copy Quote Number
                        </DropdownMenuItem>
                        {/* Add edit/view details later */}
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
