import { useState, useEffect } from "react";
import { DataTable } from "@/modules/crm/components/leads/data-table"
import { columns } from "@/modules/crm/components/leads/columns"
import type { Lead } from "@/modules/crm/types"
import { leadService } from "@/modules/crm/services/leadService"; // Import service
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LeadsPage() {
    const [data, setData] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                setLoading(true);
                const leads = await leadService.getLeads();
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


    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
                <div className="flex items-center space-x-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
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
                    <DataTable columns={columns} data={data} searchKey="name" />
                )}
            </div>
        </div>
    );
}
