
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function LeadDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">Lead Details</h2>
            </div>
            <div className="p-4 border rounded-md">
                <p>Details for Lead ID: {id}</p>
                <p className="text-muted-foreground mt-2">Implementation coming soon...</p>
            </div>
        </div>
    );
}
