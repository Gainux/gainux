
import { useState, useEffect } from "react";
import { DataTable } from "@/modules/crm/components/leads/data-table"
import { columns } from "@/modules/crm/components/leads/columns"
import type { Lead } from "@/modules/crm/types"
import { crmService } from "@/modules/crm/services/crmService";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LeadForm } from "@/modules/crm/components/leads/LeadForm";

export default function LeadsPage() {
    const [data, setData] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);
                const leads = await crmService.getLeads();
                setData(leads);
            } catch (err: any) {
                console.error("Error fetching leads:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const handleCreate = async (leadData: Partial<Lead>) => {
        try {
            const newLead = await crmService.createLead(leadData);
            setData([newLead, ...data]);
            setOpen(false);
        } catch (err: any) {
            console.error("Error creating lead:", err);
            setError("Failed to create lead");
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                <div className="flex items-center space-x-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Lead
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Add New Lead</DialogTitle>
                                <DialogDescription>
                                    Enter the details of the new lead. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <LeadForm
                                onSubmit={handleCreate}
                                onCancel={() => setOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
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
                    <DataTable columns={columns} data={data} searchKey="firstName" />
                )}
            </div>
        </div>
    );
}
