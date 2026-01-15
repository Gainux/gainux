
import type { ColumnDef } from "@tanstack/react-table"
import type { Customer } from "@/modules/crm/types"
import { Badge } from "@/components/ui/badge"
import { CustomerRowActions } from "./CustomerRowActions"

export const columns: ColumnDef<Customer>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            return (
                <a href={`/crm/customers/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
                    {row.getValue("name")}
                </a>
            )
        }
    },
    {
        accessorKey: "company",
        header: "Company",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            return (
                <Badge variant={status === "active" ? "default" : "secondary"}>
                    {status}
                </Badge>
            )
        },
    },
    {
        accessorKey: "totalRevenue",
        header: "Total Revenue",
        cell: ({ row }) => {
            return <div className="font-medium">{row.getValue("totalRevenue")}</div>
        }
    },
    {
        accessorKey: "lastOrderDate",
        header: "Last Order",
    },
    {
        id: "actions",
        cell: ({ row }) => <CustomerRowActions row={row} />,
    },
]
