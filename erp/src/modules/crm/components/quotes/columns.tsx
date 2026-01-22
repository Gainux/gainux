
import type { ColumnDef } from "@tanstack/react-table"
import type { Quote } from "@/modules/crm/types"
import { Badge } from "@/components/ui/badge"
import { QuoteRowActions } from "./QuoteRowActions"

export const getColumns = (onUpdate: () => void): ColumnDef<Quote>[] => [
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
            const dateStr = row.getValue("issueDate") as string;
            if (!dateStr) return "-";
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <QuoteRowActions row={row} onUpdate={onUpdate} />,
    },
]
