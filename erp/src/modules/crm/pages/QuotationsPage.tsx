
import { useState, useEffect, useMemo, useCallback } from "react";
import { DataTable } from "@/modules/crm/components/leads/data-table"; // Reusing generic
import { getColumns } from "@/modules/crm/components/quotes/columns";
import type { Quote } from "@/modules/crm/types";
import { crmService } from "@/modules/crm/services/crmService";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { QuoteForm } from "@/modules/crm/components/quotes/QuoteForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function QuotationsPage() {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<Quote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuotes = useCallback(async () => {
        try {
            setLoading(true);
            const quotes = await crmService.getQuotes();
            setData(quotes);
        } catch (err: any) {
            console.error("Error fetching quotes:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const columns = useMemo(() => getColumns(fetchQuotes), [fetchQuotes]);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const handleCreate = async (newQuoteData: Partial<Quote>) => {
        try {
            const newQuote = await crmService.createQuote(newQuoteData);
            setData([newQuote, ...data]);
            setOpen(false);
        } catch (err: any) {
            console.error("Error creating quote:", err);
            setError("Failed to create quote");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Quotations</h2>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Quote
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Quote</DialogTitle>
                            <DialogDescription>
                                Create a new sales quotation for a customer or deal.
                            </DialogDescription>
                        </DialogHeader>
                        <QuoteForm
                            onSubmit={handleCreate}
                            onCancel={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="quoteNumber" />
                )}
            </div>
        </div>
    );
}
