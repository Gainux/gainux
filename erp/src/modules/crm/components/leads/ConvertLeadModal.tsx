import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { crmService } from "../../services/crmService";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConvertLeadModalProps {
    leadId: string;
    leadName: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConvertLeadModal({ leadId, leadName, open, onOpenChange }: ConvertLeadModalProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState(`Deal from ${leadName}`);
    const [value, setValue] = useState<string>("0");
    const [date, setDate] = useState<string>("");

    const handleConvert = async () => {
        try {
            setLoading(true);
            const deal = await crmService.convertLead(leadId, {
                title,
                value: parseFloat(value) || 0,
                expectedCloseDate: date ? new Date(date).toISOString() : undefined
            });

            toast.success("Lead converted successfully!");
            onOpenChange(false);
            // Navigate to the new deal
            navigate(`/crm/deals/${deal.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to convert lead");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Convert Lead to Deal</DialogTitle>
                    <DialogDescription>
                        This will create a new Deal, Company, and Contact record from this lead.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Deal Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="value">Value</Label>
                            <Input
                                id="value"
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Expected Close</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button onClick={handleConvert} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Convert & View Deal
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
