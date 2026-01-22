import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    Briefcase,
    Calendar as CalendarIcon,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { dealService } from "@/modules/crm/services/dealService";
import type { Deal } from "@/modules/crm/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { RequirementsList } from "@/modules/crm/components/deals/RequirementsList";

const STAGES = ["new", "proposal", "negotiation", "won", "lost"];

export default function DealDetailsPage() {
    const { id } = useParams();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDeal = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const deals = await dealService.getDeals();
            const foundDeal = deals.find(d => d.id === id);
            if (!foundDeal) {
                setError("Deal not found");
            } else {
                setDeal(foundDeal);
            }
        } catch (err: any) {
            console.error("Error fetching deal:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeal();
    }, [id]);

    const handleUpdateRequirements = async (requirements: any[]) => {
        if (!id) return;
        try {
            const updated = await dealService.updateRequirements(id, requirements);
            setDeal(updated);
        } catch (err: any) {
            console.error("Error updating requirements:", err);
            alert("Failed to update requirements");
        }
    };

    const handleUpdateStage = async (newStage: string) => {
        if (!id) return;
        try {
            await dealService.updateDealStage(id, newStage);
            fetchDeal();
        } catch (err: any) {
            console.error("Error updating stage:", err);
            alert("Failed to update deal stage");
        }
    };

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error || !deal) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertDescription>{error || "Deal not found"}</AlertDescription>
                </Alert>
                <Button className="mt-4" onClick={() => window.history.back()}>Go Back</Button>
            </div>
        );
    }

    // Calculate stage progress
    const currentStageIndex = STAGES.indexOf(deal.stage);
    const progress = ((currentStageIndex + 1) / STAGES.length) * 100;

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b bg-background p-6">
                <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{deal.title}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Briefcase className="h-4 w-4" />
                            <Briefcase className="h-4 w-4" />
                            <span>{deal.company?.name}</span>
                        </div>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Value</p>
                            <p className="text-xl font-bold">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: deal.currency || 'INR' }).format(deal.value || 0)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stage Progress Bar */}
                <div className="space-y-2 max-w-3xl mx-auto mt-8">
                    <div className="flex justify-between text-sm uppercase text-muted-foreground font-semibold">
                        {STAGES.map((stage, index) => (
                            <span key={stage} className={index <= currentStageIndex ? "text-primary" : ""}>
                                {stage}
                            </span>
                        ))}
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex-1 p-6 space-y-6 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requirements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <RequirementsList
                                    requirements={deal.requirements || []}
                                    onUpdate={handleUpdateRequirements}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Deal Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Expected Close</span>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <CalendarIcon className="h-4 w-4" />
                                        {deal.expectedCloseDate || "-"}
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Stage</span>
                                    <Badge variant="secondary" className="capitalize">{deal.stage}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-2">
                            <Button
                                className="w-full"
                                variant="outline"
                                size="lg"
                                onClick={() => handleUpdateStage("lost")}
                                disabled={deal.stage === "lost"}
                            >
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Mark Lost
                            </Button>
                            <Button
                                className="w-full"
                                variant="default"
                                size="lg"
                                onClick={() => handleUpdateStage("won")}
                                disabled={deal.stage === "won"}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark Won
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
