
import type { ColumnDef } from "@tanstack/react-table"
import { Link } from "react-router-dom"
import type { Company } from "@/modules/crm/types"
import { CustomerRowActions } from "./CustomerRowActions"

export const getColumns = (onUpdate: () => void): ColumnDef<Company>[] => [
    {
        accessorKey: "name",
        header: "Company Name",
        cell: ({ row }) => {
            return (
                <Link
                    to={`/crm/customers/${row.original.id}`}
                    className="font-medium hover:underline text-foreground"
                >
                    {row.getValue("name")}
                </Link>
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
        cell: ({ row }) => <CustomerRowActions row={row} onUpdate={onUpdate} />,
    },
]
