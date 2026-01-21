
import type { ColumnDef } from "@tanstack/react-table"
import type { Company } from "@/modules/crm/types"
import { Badge } from "@/components/ui/badge"
import { CustomerRowActions } from "./CustomerRowActions"

export const columns: ColumnDef<Company>[] = [
    {
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => {
            return (
                <a href={`/crm/customers/${row.original.id}`} className="font-medium text-blue-600 hover:underline">
                    {row.getValue("name")}
                </a>
            )
        }
    },
    {
        accessorKey: "industry",
        header: "Industry",
    },
    {
        accessorKey: "website",
        header: "Website",
        cell: ({ row }) => {
            const website = row.getValue("website") as string;
            return website ? (
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                    {website}
                </a>
            ) : "-";
        }
    },
    {
        accessorKey: "phone",
        header: "Phone",
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            return new Date(row.getValue("createdAt")).toLocaleDateString()
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <CustomerRowActions row={row} />,
    },
]
