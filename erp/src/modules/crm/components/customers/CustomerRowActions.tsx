import { useState } from "react";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import type { Customer } from "@/modules/crm/types";
import { customerService } from "@/modules/crm/services/customerService";
import type { Row } from "@tanstack/react-table";

interface CustomerRowActionsProps<TData> {
    row: Row<TData>;
}

export function CustomerRowActions<TData>({ row }: CustomerRowActionsProps<TData>) {
    const customer = row.original as Customer;
    const [showEditDialog, setShowEditDialog] = useState(false);

    const handleEdit = async (data: Partial<Customer>) => {
        try {
            await customerService.updateCustomer(customer.id, data);
            // Ideally we should reload the data or update the row directly via context
            // For now, reloading the page is a crude but effective way to refresh data if we don't have a context
            window.location.reload();
        } catch (error) {
            console.error("Failed to update customer", error);
            alert("Failed to update customer");
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
                        onClick={() => navigator.clipboard.writeText(customer.email)}
                    >
                        Copy Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Customer</DialogTitle>
                        <DialogDescription>
                            Make changes to the customer profile here.
                        </DialogDescription>
                    </DialogHeader>
                    <CustomerForm
                        initialData={customer}
                        onSubmit={handleEdit}
                        onCancel={() => setShowEditDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
