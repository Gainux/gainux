import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Building, User } from "lucide-react";
import { crmService } from "../services/crmService";
import type { Lead } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import { LeadForm } from "../components/leads/LeadForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CreateCustomerFromLeadDialog } from "../components/leads/CreateCustomerFromLeadDialog";
import PageLoading from "../../../components/common/PageLoading";

const STATUS_LABELS: Record<string, string> = {
    do_cold_call: "Do Cold Call",
    collecting_requirements: "Collecting Requirements",
    not_interested: "Not Interested",
    preparing_proposal: "Preparing Proposal",
    waiting_for_proposal_response: "Waiting for Proposal Response",
    negotiating: "Negotiating",
    waiting_for_advance_amount: "Waiting for Advance Amount",
    work_ongoing: "Work Ongoing",
    do_completion_call: "Do Completion Call",
    waiting_for_full_payment: "Waiting for Full Payment",
    complete: "Complete",
};

export default function LeadDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [editOpen, setEditOpen] = useState(searchParams.get("edit") === "true");
    const [saving, setSaving] = useState(false);
    const [customerDialogOpen, setCustomerDialogOpen] = useState(false);

    useEffect(() => {
        const loadLead = async (leadId: string) => {
            try {
                setLoading(true);
                const data = await crmService.getLeadById(leadId);
                setLead(data);
            } catch (error) {
                console.error("Failed to load lead", error);
                toast.error("Failed to load lead details");
                navigate("/crm/leads");
            } finally {
                setLoading(false);
            }
        };

        if (id) loadLead(id);
    }, [id, navigate]);

    const handleEdit = async (data: Partial<Lead>) => {
        if (!lead) return;
        try {
            setSaving(true);
            const updated = await crmService.updateLead(lead.id, data);
            setLead(updated);
            setEditOpen(false);
            setSearchParams({});
            toast.success("Lead updated");
            if (updated.status === "complete") {
                setCustomerDialogOpen(true);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to update lead");
        } finally {
            setSaving(false);
        }
    };

    const closeEdit = () => {
        setEditOpen(false);
        setSearchParams({});
    };

    if (loading) return <PageLoading />;
    if (!lead) return <div>Lead not found</div>;

    const statusVariant = lead.status === "not_interested" ? "destructive" : lead.status === "complete" ? "default" : "secondary";

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <Dialog open={editOpen} onOpenChange={open => { if (!open) closeEdit(); }}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Lead</DialogTitle>
                        <DialogDescription>Update the lead details below.</DialogDescription>
                    </DialogHeader>
                    <LeadForm
                        initialData={lead}
                        onSubmit={handleEdit}
                        onCancel={closeEdit}
                        loading={saving}
                    />
                </DialogContent>
            </Dialog>

            <CreateCustomerFromLeadDialog
                lead={lead}
                open={customerDialogOpen}
                onOpenChange={setCustomerDialogOpen}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate("/crm/leads")}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                            {lead.firstName} {lead.lastName}
                            <Badge variant={statusVariant}>
                                {STATUS_LABELS[lead.status] ?? lead.status}
                            </Badge>
                        </h2>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Building className="h-3 w-3" /> {lead.companyName || 'No Company'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditOpen(true)}>Edit</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">{lead.email}</a>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{lead.phone || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">Source</label>
                                    <div>{lead.source || 'Direct'}</div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-muted-foreground">Owner</label>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{lead.owner ? `${lead.owner.firstName} ${lead.owner.lastName}` : 'Unassigned'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap">{lead.notes || "No notes added."}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Timeline / Meta */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">System Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{format(new Date(lead.createdAt), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated</span>
                                <span>{format(new Date(lead.updatedAt), 'MMM d, yyyy')}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
