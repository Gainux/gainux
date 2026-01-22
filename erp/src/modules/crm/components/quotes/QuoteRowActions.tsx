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
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { QuoteForm } from "./QuoteForm";
import type { Quote } from "@/modules/crm/types";
import { crmService } from "@/modules/crm/services/crmService";
import type { Row } from "@tanstack/react-table";

interface QuoteRowActionsProps<TData> {
    row: Row<TData>;
    onUpdate?: () => void;
}

export function QuoteRowActions<TData>({ row, onUpdate }: QuoteRowActionsProps<TData>) {
    const quote = row.original as unknown as Quote;
    const [showEditDialog, setShowEditDialog] = useState(false);

    const handleEdit = async (data: Partial<Quote>) => {
        try {
            await crmService.updateQuote(quote.id, data);
            if (onUpdate) onUpdate();
            else window.location.reload();
        } catch (error) {
            console.error("Failed to update quote", error);
            alert("Failed to update quote");
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
                        onClick={() => navigator.clipboard.writeText(quote.quoteNumber)}
                    >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Quote #
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Quote
                    </DropdownMenuItem>
                    {/* Optionally add Delete here later */}
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Quote</DialogTitle>
                        <DialogDescription>
                            Update the quotation details.
                        </DialogDescription>
                    </DialogHeader>
                    <QuoteForm
                        initialData={quote}
                        onSubmit={(data) => handleEdit(data)}
                        onCancel={() => setShowEditDialog(false)}
                    />
                </DialogContent>
            </Dialog>
        </>
    );
}
