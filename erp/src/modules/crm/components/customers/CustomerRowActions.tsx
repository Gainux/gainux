import { useState } from "react";
import { MoreHorizontal, Pencil, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { CustomerForm } from "./CustomerForm";
import type { Company } from "@/modules/crm/types";
import { crmService } from "@/modules/crm/services/crmService";
import type { Row } from "@tanstack/react-table";

interface CustomerRowActionsProps<TData> {
    row: Row<TData>;
}

export function CustomerRowActions<TData>({ row }: CustomerRowActionsProps<TData>) {
    const company = row.original as unknown as Company;
    const [showEditDialog, setShowEditDialog] = useState(false);

    const handleEdit = async (data: Partial<Company>) => {
        try {
            await crmService.updateCompany(company.id, data);
            window.location.reload();
        } catch (error) {
            console.error("Failed to update company", error);
            alert("Failed to update company");
        }
        setShowEditDialog(false);
    };

    return (
        <>
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
                        onClick={() => navigator.clipboard.writeText(company.name)}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Name
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Company</DialogTitle>
                        <DialogDescription>
                            Make changes to the company profile here.
                        </DialogDescription>
                    </DialogHeader>
                    {/* Casting to any to bridge gap between Company and CustomerForm props for now */}
                    <CustomerForm
                        initialData={company as any}
                        onSubmit={(data) => handleEdit(data as unknown as Partial<Company>)}
                        onCancel={() => setShowEditDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
