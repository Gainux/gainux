
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import KanbanBoard from "../components/KanbanBoard";
import type { Deal } from "../types";
import { dealService } from "../services/dealService";
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
import { DealForm } from "../components/DealForm";


export default function DealsPage() {
    const navigate = useNavigate();
    const [deals, setDeals] = useState<Deal[]>([]); // Dynamic state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [editDeal, setEditDeal] = useState<Deal | null>(null);
    const [editOpen, setEditOpen] = useState(false);

    const fetchDeals = async () => {
        try {
            setLoading(true);
            const fetchedDeals = await dealService.getDeals();
            setDeals(fetchedDeals);
        } catch (err: any) {
            console.error("Error fetching deals:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeals();
    }, []);

    const handleCreate = async (dealData: Partial<Deal>) => {
        try {
            const newDeal = await dealService.createDeal(dealData);
            setDeals([newDeal, ...deals]);
            setOpen(false);
        } catch (err: any) {
            console.error("Error creating deal:", err);
            setError("Failed to create deal");
        }
    }

    const handleEdit = (deal: Deal) => {
        setEditDeal(deal);
        setEditOpen(true);
    };

    const handleUpdate = async (updates: Partial<Deal>) => {
        if (!editDeal) return;
        try {
            const updatedDeal = await dealService.updateDeal(editDeal.id, updates);
            setDeals(deals.map(d => d.id === editDeal.id ? updatedDeal : d));
            setEditOpen(false);
            setEditDeal(null);
        } catch (err: any) {
            console.error("Error updating deal:", err);
            alert(`Failed to update deal: ${err.message}`);
        }
    };

    const handleDealMove = async (dealId: string, newStage: string) => {
        try {
            await dealService.updateDealStage(dealId, newStage);
            const updatedDeals = deals.map(d =>
                d.id === dealId ? { ...d, stage: newStage as Deal["stage"] } : d
            );
            setDeals(updatedDeals);

        } catch (err: any) {
            console.error("Failed to update deal stage:", err);
            setError("Failed to save deal move");
            fetchDeals(); // Revert on error
        }
    };

    return (
        <div className="flex-1 h-[calc(100vh-4rem)] p-8 pt-6 flex flex-col">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h2 className="text-3xl font-bold tracking-tight">Deals Pipeline</h2>
                <div className="flex items-center space-x-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> Add Deal
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Deal</DialogTitle>
                                <DialogDescription>
                                    Create a new deal to track in your pipeline.
                                </DialogDescription>
                            </DialogHeader>
                            <DealForm
                                onSubmit={handleCreate}
                                onCancel={() => setOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="h-full flex-1 flex-col space-y-8 flex">
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <KanbanBoard
                        deals={deals}
                        onDealMove={handleDealMove}
                        onDealEdit={handleEdit}
                        onDealClick={(dealId) => navigate(`/crm/deals/${dealId}`)}
                    />
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Deal</DialogTitle>
                        <DialogDescription>
                            Update the deal details.
                        </DialogDescription>
                    </DialogHeader>
                    <DealForm
                        initialData={editDeal}
                        onSubmit={handleUpdate}
                        onCancel={() => {
                            setEditOpen(false);
                            setEditDeal(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
