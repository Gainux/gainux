import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Phone, Building, User, ArrowRightLeft } from "lucide-react";
import { crmService } from "../services/crmService";
import type { Lead } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import { ConvertLeadModal } from "../components/leads/ConvertLeadModal";
import PageLoading from "../../../components/common/PageLoading";

export default function LeadDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [convertOpen, setConvertOpen] = useState(false);

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

    if (loading) return <PageLoading />;
    if (!lead) return <div>Lead not found</div>;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <ConvertLeadModal
                open={convertOpen}
                onOpenChange={setConvertOpen}
                leadId={lead.id}
                leadName={`${lead.firstName} ${lead.lastName}`}
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
                            <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>{lead.status}</Badge>
                        </h2>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Building className="h-3 w-3" /> {lead.companyName || 'No Company'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Edit</Button>
                    <Button onClick={() => setConvertOpen(true)}>
                        <ArrowRightLeft className="mr-2 h-4 w-4" /> Convert to Deal
                    </Button>
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
